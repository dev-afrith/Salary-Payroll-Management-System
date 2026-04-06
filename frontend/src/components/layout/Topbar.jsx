import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/axios';
import { socket } from '../../utils/socket';

const Topbar = ({ onMenuClick, isCollapsed }) => {
  let user = { full_name: 'Admin' };
  try { user = JSON.parse(localStorage.getItem('payroll_user') || '{"full_name": "Admin"}'); } catch {}
  const role = localStorage.getItem('payroll_role');
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Initial fetch
    const fetchUnread = async () => {
      try {
        const { data } = await API.get('/communication/unread');
        setUnreadCount(data.count);
        setUnreadMessages(data.messages);
      } catch (err) {}
    };
    fetchUnread();

    const handleNewMessage = (msg) => {
      // Only care about private messages to me
      const myId = role === 'admin' ? user.id : (user.employee_db_id || user.id);
      if (msg.receiver_id === myId && msg.receiver_role === role) {
        setUnreadCount(prev => prev + 1);
        setUnreadMessages(prev => [msg, ...prev].slice(0, 5));
      }
    };

    const handleMessagesRead = () => {
      // If someone else read our message, it doesn't affect our unread count.
      // But if we read them, maybe we fetch again or just clear. Let's just refetch to be safe.
      fetchUnread();
    };

    socket.on('receive_message', handleNewMessage);
    // Listen for our own read event to clear badge
    const handleWindowFocus = () => fetchUnread();
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      socket.off('receive_message', handleNewMessage);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [role, user.id, user.employee_db_id]);

  return (
    <header className="h-[64px] bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: Hamburger (Mobile) + Path */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-text-muted hover:text-text-primary transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden sm:flex items-center text-sm font-medium">
          <span className="text-text-secondary capitalize">{role || 'Admin'}</span>
          <span className="text-text-muted mx-2">/</span>
          <span className="text-text-primary capitalize">{window.location.pathname.split('/').pop().replace(/-/g, ' ') || 'Dashboard'}</span>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search..."
            className="w-64 bg-surface border border-border focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary rounded-input py-1.5 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-text-muted"
          />
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-text-muted hover:text-primary relative transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-status-danger-text rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-border shadow-dropdown rounded-card overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border bg-surface flex justify-between items-center">
                <span className="font-semibold text-sm text-text-primary">Notifications</span>
                {unreadCount > 0 && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">{unreadCount} New</span>}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {unreadMessages.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-text-muted flex flex-col items-center">
                    <span className="text-2xl mb-2 grayscale opacity-50">📭</span>
                    No new messages
                  </div>
                ) : (
                  unreadMessages.map(msg => (
                    <div key={msg.id} className="px-4 py-3 border-b border-border hover:bg-surface cursor-pointer transition-colors" onClick={() => {
                        setShowNotifications(false);
                        navigate(`/${role}/communication`);
                    }}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm text-text-primary">{msg.sender_name}</span>
                        <span className="text-[10px] text-text-muted">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-xs text-text-secondary truncate">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 bg-surface border-t border-border">
                <button 
                  className="w-full py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white rounded transition-colors"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate(`/${role}/communication`);
                  }}
                >
                  Open Messages
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-text-primary leading-tight">{user.full_name}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
            {(user.full_name || 'A').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
