const crypto = require('crypto');
const db = require('../config/db');

// Use a static 32-byte key for demo purposes (in production this should be in .env)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // Must be 256 bits (32 chars)
const ALGORITHM = 'aes-256-cbc';

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
};

const decrypt = (text, iv) => {
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedText = Buffer.from(text, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), ivBuffer);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

const getPublicMessages = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, 
        CASE WHEN m.sender_role = 'admin' THEN 'Admin' ELSE e.full_name END as sender_name
      FROM messages m
      LEFT JOIN employees e ON m.sender_id = e.id AND m.sender_role = 'employee'
      WHERE m.receiver_id IS NULL
      ORDER BY m.created_at ASC
    `);

    const decryptedRows = rows.map(r => ({
      ...r,
      content: decrypt(r.encrypted_content, r.iv),
      encrypted_content: undefined,
      iv: undefined
    }));

    res.json(decryptedRows);
  } catch (error) {
    console.error('Error fetching public messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

const getPrivateChatHistory = async (req, res) => {
  try {
    const { contactId, contactRole } = req.params;
    const myId = req.user.role === 'admin' ? req.user.id : (req.user.employee_db_id || req.user.id);
    const myRole = req.user.role;

    const [rows] = await db.query(`
      SELECT m.*, 
        CASE WHEN m.sender_role = 'admin' THEN 'Admin' ELSE e.full_name END as sender_name
      FROM messages m
      LEFT JOIN employees e ON m.sender_id = e.id AND m.sender_role = 'employee'
      WHERE (m.sender_id = ? AND m.sender_role = ? AND m.receiver_id = ? AND m.receiver_role = ?)
         OR (m.sender_id = ? AND m.sender_role = ? AND m.receiver_id = ? AND m.receiver_role = ?)
      ORDER BY m.created_at ASC
    `, [myId, myRole, contactId, contactRole, contactId, contactRole, myId, myRole]);

    const decryptedRows = rows.map(r => ({
      ...r,
      content: decrypt(r.encrypted_content, r.iv),
      encrypted_content: undefined,
      iv: undefined
    }));

    res.json(decryptedRows);
  } catch (error) {
    console.error('Error fetching private messages:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
};

const getContacts = async (req, res) => {
  try {
    // Both Admin and Employees can see all other employees to chat
    // Admin is also a contact for employees
    const [employees] = await db.query('SELECT id, full_name, department_id, email FROM employees WHERE status = "Approved"');
    
    // Admin mock user
    let contacts = [];
    if (req.user.role === 'employee') {
      contacts.push({ id: 1, full_name: 'Administrator', role: 'admin', isOnline: true }); // Assuming admin id is 1
    }

    employees.forEach(e => {
      // Don't add yourself
      if (!(req.user.role === 'employee' && (req.user.employee_db_id || req.user.id) == e.id)) {
        contacts.push({ id: e.id, full_name: e.full_name, role: 'employee', email: e.email });
      }
    });

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts' });
  }
};

const saveMessage = async (myId, myRole, receiverId, receiverRole, content) => {
    const { encryptedData, iv } = encrypt(content);
    const [result] = await db.query(`
      INSERT INTO messages (sender_id, sender_role, receiver_id, receiver_role, encrypted_content, iv)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [myId, myRole, receiverId || null, receiverRole || null, encryptedData, iv]);
    
    const [inserted] = await db.query(`
      SELECT m.*, 
        CASE WHEN m.sender_role = 'admin' THEN 'Admin' ELSE e.full_name END as sender_name
      FROM messages m
      LEFT JOIN employees e ON m.sender_id = e.id AND m.sender_role = 'employee'
      WHERE m.id = ?
    `, [result.insertId]);

    const row = inserted[0];
    return {
      ...row,
      content: decrypt(row.encrypted_content, row.iv),
      encrypted_content: undefined,
      iv: undefined
    };
};

const getUnreadMessages = async (req, res) => {
  try {
    const myId = req.user.role === 'admin' ? req.user.id : (req.user.employee_db_id || req.user.id);
    const myRole = req.user.role;

    const [rows] = await db.query(`
      SELECT m.*, 
        CASE WHEN m.sender_role = 'admin' THEN 'Admin' ELSE e.full_name END as sender_name
      FROM messages m
      LEFT JOIN employees e ON m.sender_id = e.id AND m.sender_role = 'employee'
      WHERE m.receiver_id = ? AND m.receiver_role = ? AND m.is_read = FALSE
      ORDER BY m.created_at DESC
    `, [myId, myRole]);

    const decryptedRows = rows.map(r => ({
      ...r,
      content: decrypt(r.encrypted_content, r.iv),
      encrypted_content: undefined,
      iv: undefined
    }));

    res.json({
      count: decryptedRows.length,
      messages: decryptedRows.slice(0, 5) // Send only top 5 for dropdown
    });
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    res.status(500).json({ message: 'Error fetching unread messages' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const myId = req.user.role === 'admin' ? req.user.id : (req.user.employee_db_id || req.user.id);
    const myRole = req.user.role;
    const { contactId, contactRole } = req.params;

    await db.query(`
      UPDATE messages 
      SET is_read = TRUE 
      WHERE receiver_id = ? AND receiver_role = ? 
        AND sender_id = ? AND sender_role = ? 
        AND is_read = FALSE
    `, [myId, myRole, contactId, contactRole]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
};

module.exports = {
  getPublicMessages,
  getPrivateChatHistory,
  getContacts,
  saveMessage,
  getUnreadMessages,
  markAsRead,
  encrypt,
  decrypt
};
