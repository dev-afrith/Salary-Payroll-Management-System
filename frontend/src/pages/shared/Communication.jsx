import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, User, Search, MessageSquare, Check, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { socket } from '../../utils/socket';
import { formatDate } from '../../utils/dateHelpers';

import Button from '../../components/ui/Button';

const Communication = () => {
  const [activeTab, setActiveTab] = useState('public'); // 'public' or 'private'
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null); // the user selected for private chat
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);
  const myUser = JSON.parse(localStorage.getItem('payroll_user') || '{}');
  const myRole = localStorage.getItem('payroll_role');
  const myId = myRole === 'admin' ? myUser.id : (myUser.employee_db_id || myUser.id);

  useEffect(() => {
    // Socket setup
    socket.auth.token = localStorage.getItem('payroll_token');
    socket.connect();

    const handleMessagesRead = (data) => {
      // data = { readerId, readerRole }
      // This means the other person read my messages.
      setMessages(prev => prev.map(msg => {
        if (msg.sender_id === myId && msg.sender_role === myRole && msg.receiver_id === data.readerId && msg.receiver_role === data.readerRole) {
          return { ...msg, is_read: 1 };
        }
        return msg;
      }));
    };

    socket.on('receive_message', (msg) => {
      // Logic to append properly:
      // If it's a public message and we are in public tab
      if (!msg.receiver_id && activeTab === 'public') {
        setMessages(prev => [...prev, msg]);
        return;
      }
      
      // If it's a private message regarding the current active contact
      if (activeTab === 'private' && activeContact) {
        const isFromContact = msg.sender_id === activeContact.id && msg.sender_role === activeContact.role;
        const isToContact = msg.receiver_id === activeContact.id && msg.receiver_role === activeContact.role;
        
        if (isFromContact || isToContact) {
          setMessages(prev => [...prev, msg]);
          // If I just received it and it's open, mark as read immediately
          if (isFromContact) {
            API.put(`/communication/read/${activeContact.role}/${activeContact.id}`).catch(()=>{});
            socket.emit('mark_messages_read', {
              myId, myRole, contactId: activeContact.id, contactRole: activeContact.role
            });
          }
        }
      }
    });

    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('receive_message');
      socket.off('messages_read', handleMessagesRead);
      socket.disconnect();
    };
  }, [activeTab, activeContact, myId, myRole]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeTab === 'public') {
      fetchPublicMessages();
    } else if (activeTab === 'private') {
      fetchContacts();
      if (activeContact) {
        fetchPrivateMessages(activeContact);
      } else {
        setMessages([]);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeContact && activeTab === 'private') {
      fetchPrivateMessages(activeContact);
      
      // Mark as read whenever switching to a contact
      API.put(`/communication/read/${activeContact.role}/${activeContact.id}`).catch(()=>{});
      // Emit to let them know we read it
      socket.emit('mark_messages_read', {
        myId, myRole, contactId: activeContact.id, contactRole: activeContact.role
      });
    }
  }, [activeContact]);

  const fetchPublicMessages = async () => {
    try {
      const { data } = await API.get('/communication/public');
      setMessages(data);
    } catch (err) {
      toast.error('Failed to load public channel');
    }
  };

  const fetchContacts = async () => {
    try {
      const { data } = await API.get('/communication/contacts');
      setContacts(data);
    } catch (err) {
      toast.error('Failed to load contacts');
    }
  };

  const fetchPrivateMessages = async (contact) => {
    try {
      const { data } = await API.get(`/communication/private/${contact.role}/${contact.id}`);
      setMessages(data);
    } catch (err) {
      toast.error('Failed to load private messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const payload = {
      senderId: myId,
      senderRole: myRole,
      receiverId: activeTab === 'private' ? activeContact.id : null,
      receiverRole: activeTab === 'private' ? activeContact.role : null,
      content: inputMsg
    };

    // emit to server via socket for real-time delivery + DB persistence
    socket.emit('send_message', payload);
    setInputMsg('');
  };

  const filteredContacts = contacts.filter(c => c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Render Helpers
  const isMine = (msg) => msg.sender_id === myId && msg.sender_role === myRole;

  return (
    <div className="page-enter w-full h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Communication Center</h1>
        <p className="text-sm text-slate-500">End-to-End Database Encrypted Messaging</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Sidebar - Contacts & Tabs */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 flex space-x-2">
            <button 
              className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${activeTab === 'public' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
              onClick={() => setActiveTab('public')}
            >
              <Users size={16} /> Public
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${activeTab === 'private' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
              onClick={() => setActiveTab('private')}
            >
              <MessageSquare size={16} /> Direct
            </button>
          </div>

          {activeTab === 'private' && (
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search contacts..." 
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'public' ? (
              <div 
                className="p-4 flex items-center gap-3 cursor-pointer bg-blue-50 select-none"
              >
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-inner">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Company Broadcast</h3>
                  <p className="text-xs text-slate-500">Public messages for all</p>
                </div>
              </div>
            ) : (
              <div>
                {filteredContacts.length === 0 ? (
                  <p className="p-4 text-center text-sm text-slate-500">No contacts found</p>
                ) : (
                  filteredContacts.map(contact => (
                    <div 
                      key={`${contact.role}_${contact.id}`}
                      className={`p-4 flex items-center gap-3 cursor-pointer border-b border-slate-100 hover:bg-white transition-colors select-none ${activeContact?.id === contact.id && activeContact?.role === contact.role ? 'bg-white border-l-4 border-l-blue-600' : ''}`}
                      onClick={() => setActiveContact(contact)}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm font-bold text-sm ${contact.role === 'admin' ? 'bg-purple-600' : 'bg-slate-400'}`}>
                        {contact.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{contact.full_name}</h3>
                        <p className="text-xs text-slate-500 truncate capitalize">{contact.role}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Chat Window */}
        <div className="flex-1 flex flex-col bg-[#efeae2] relative">
          {(!activeContact && activeTab === 'private') ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-white pb-20">
              <MessageSquare size={64} className="text-slate-200 mb-4" />
              <p className="text-lg font-medium text-slate-400">Select a contact to start chatting</p>
              <p className="text-sm text-slate-400 mt-2">Messages are end-to-end securely encrypted</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-[68px] px-6 bg-white border-b border-slate-200 flex items-center z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm font-bold text-sm ${activeTab === 'public' ? 'bg-blue-600' : (activeContact?.role === 'admin' ? 'bg-purple-600' : 'bg-slate-400')}`}>
                    {activeTab === 'public' ? <Users size={18} /> : (activeContact?.full_name?.charAt(0) || 'U')}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">{activeTab === 'public' ? 'Company Broadcast' : activeContact?.full_name}</h2>
                    <p className="text-xs text-slate-500">{activeTab === 'public' ? 'Visible to everyone' : activeContact?.role === 'admin' ? 'Administrator' : 'Employee'}</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="bg-yellow-100/80 text-yellow-800 text-xs px-4 py-2 rounded-lg text-center max-w-sm">
                      🔒 Messages are secured with AES-256 database-level encryption. Nobody outside this chat can read them.
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const mine = isMine(msg);
                    return (
                      <div key={msg.id || i} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                        {!mine && activeTab === 'public' && (
                          <span className="text-[10px] text-slate-500 mb-1 ml-1 font-semibold">{msg.sender_name}</span>
                        )}
                        <div 
                          className={`max-w-[75%] md:max-w-[65%] px-4 py-2 rounded-2xl shadow-sm text-sm relative ${
                            mine 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                          }`}
                        >
                          {msg.content}
                          <div className={`text-[10px] mt-1 flex justify-end items-center gap-1 block ${mine ? 'text-blue-200' : 'text-slate-400'}`}>
                            {new Date(msg.created_at || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            
                            {/* Read Receipts for Private Messages sent by Me */}
                            {mine && activeTab === 'private' && (
                              <span className="ml-1">
                                {msg.is_read ? <CheckCheck size={14} className="text-white" /> : <Check size={14} className="opacity-70" />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
                  <textarea 
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 max-h-32 min-h-[44px] resize-none bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-shadow"
                    rows={1}
                  />
                  <Button 
                    type="submit" 
                    icon={Send} 
                    className="h-[44px] px-5 shadow-md flex-shrink-0"
                    disabled={!inputMsg.trim()}
                  >
                    Send
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Communication;
