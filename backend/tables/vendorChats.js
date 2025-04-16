/**
 * PostgreSQL schema and queries for vendor_chats table
 * This enables chat between vendors and platform admins
 */

// Table creation SQL for chat conversations
const createChatTableSQL = `
CREATE TABLE IF NOT EXISTS vendor_chats (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES users(id),
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  related_entity_type VARCHAR(50), -- 'order', 'product', etc.
  related_entity_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_chats_vendor ON vendor_chats(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_chats_related ON vendor_chats(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_vendor_chats_updated ON vendor_chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_chats_status ON vendor_chats(status);
`;

// Table creation SQL for chat messages
const createMessageTableSQL = `
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES vendor_chats(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  sender_type VARCHAR(20) NOT NULL, -- 'vendor', 'admin', 'system'
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON chat_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
`;

// Create a new chat conversation
const createChatSQL = `
INSERT INTO blinds.vendor_chats (
  vendor_id, subject, status, related_entity_type, related_entity_id
) VALUES ($1, $2, $3, $4, $5)
RETURNING *;
`;

// Get all chats for a vendor
const getVendorChatsSQL = `
SELECT vc.*,
  COUNT(DISTINCT cm.id) as message_count,
  COUNT(DISTINCT CASE WHEN cm.is_read = FALSE AND cm.sender_type != 'vendor' THEN cm.id END) as unread_count,
  MAX(cm.created_at) as last_message_time,
  (
    SELECT cm2.message
    FROM blinds.chat_messages cm2
    WHERE cm2.chat_id = vc.id
    ORDER BY cm2.created_at DESC
    LIMIT 1
  ) as last_message
FROM blinds.vendor_chats vc
LEFT JOIN blinds.chat_messages cm ON vc.id = cm.chat_id
WHERE vc.vendor_id = $1
GROUP BY vc.id
ORDER BY
  CASE WHEN vc.status = 'active' THEN 0 ELSE 1 END,
  MAX(cm.created_at) DESC
LIMIT $2 OFFSET $3;
`;

// Get chat by ID
const getChatByIdSQL = `
SELECT vc.*,
  COUNT(DISTINCT cm.id) as message_count,
  COUNT(DISTINCT CASE WHEN cm.is_read = FALSE AND cm.sender_type != $2 THEN cm.id END) as unread_count,
  vendor.name as vendor_name,
  vendor.email as vendor_email
FROM blinds.vendor_chats vc
LEFT JOIN blinds.chat_messages cm ON vc.id = cm.chat_id
JOIN users vendor ON vc.vendor_id = vendor.id
WHERE vc.id = $1
GROUP BY vc.id, vendor.name, vendor.email;
`;

// Update chat status
const updateChatStatusSQL = `
UPDATE blinds.vendor_chats
SET
  status = $2,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
`;

// Add a message to a chat
const addMessageSQL = `
INSERT INTO blinds.chat_messages (
  chat_id, sender_id, sender_type, message, attachments
) VALUES ($1, $2, $3, $4, $5)
RETURNING *;
`;

// Update last_message_at in the chat
const updateChatLastMessageSQL = `
UPDATE blinds.vendor_chats
SET
  last_message_at = CURRENT_TIMESTAMP,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
`;

// Get messages for a chat
const getChatMessagesSQL = `
SELECT cm.*,
  u.name as sender_name,
  u.email as sender_email
FROM blinds.chat_messages cm
JOIN blinds.users u ON cm.sender_id = user_id
WHERE cm.chat_id = $1
ORDER BY cm.created_at
LIMIT $2 OFFSET $3;
`;

// Mark messages as read
const markMessagesReadSQL = `
UPDATE blinds.chat_messages
SET is_read = TRUE
WHERE chat_id = $1 AND sender_type != $2 AND is_read = FALSE
RETURNING id;
`;

// Get unread message count for a user
const getUnreadCountSQL = `
SELECT COUNT(*)
FROM blinds.chat_messages cm
JOIN vendor_chats vc ON cm.chat_id = vc.id
WHERE
  cm.is_read = FALSE AND
  cm.sender_type != $2 AND
  ((vc.vendor_id = $1 AND $2 = 'vendor') OR ($2 = 'admin'))
`;

// Get chats with new messages for a user
const getChatsWithUnreadSQL = `
SELECT vc.id, vc.subject, COUNT(cm.id) as unread_count
FROM blinds.vendor_chats vc
JOIN blinds.chat_messages cm ON vc.id = cm.chat_id
WHERE
  cm.is_read = FALSE AND
  cm.sender_type != $2 AND
  ((vc.vendor_id = $1 AND $2 = 'vendor') OR ($2 = 'admin'))
GROUP BY vc.id, vc.subject
ORDER BY MAX(cm.created_at) DESC;
`;

// Search chats
const searchChatsSQL = `
SELECT vc.*,
  COUNT(DISTINCT cm.id) as message_count,
  MAX(cm.created_at) as last_message_time,
  vendor.name as vendor_name,
  vendor.email as vendor_email,
  (
    SELECT cm2.message
    FROM blinds.chat_messages cm2
    WHERE cm2.chat_id = vc.id
    ORDER BY cm2.created_at DESC
    LIMIT 1
  ) as last_message
FROM blinds.vendor_chats vc
LEFT JOIN blinds.chat_messages cm ON vc.id = cm.chat_id
JOIN users vendor ON vc.vendor_id = vendor.id
LEFT JOIN blinds.chat_messages searchmsg ON vc.id = searchmsg.chat_id
WHERE
  (($1 = 'admin') OR vc.vendor_id = $2) AND
  (
    vc.subject ILIKE $3 OR
    vendor.name ILIKE $3 OR
    vendor.email ILIKE $3 OR
    searchmsg.message ILIKE $3 OR
    vc.related_entity_id ILIKE $3
  )
GROUP BY vc.id, vendor.name, vendor.email
ORDER BY MAX(cm.created_at) DESC
LIMIT $4 OFFSET $5;
`;

// Get total chat count for a vendor
const getVendorChatCountSQL = `
SELECT COUNT(*)
FROM blinds.vendor_chats
WHERE vendor_id = $1;
`;

module.exports = {
  createChatTableSQL,
  createMessageTableSQL,
  createChatSQL,
  getVendorChatsSQL,
  getChatByIdSQL,
  updateChatStatusSQL,
  addMessageSQL,
  updateChatLastMessageSQL,
  getChatMessagesSQL,
  markMessagesReadSQL,
  getUnreadCountSQL,
  getChatsWithUnreadSQL,
  searchChatsSQL,
  getVendorChatCountSQL
};
