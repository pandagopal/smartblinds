/**
 * Controller for vendor chat with platform admins
 */
const { pool } = require('../../config/db');
const ErrorResponse = require('../../utils/errorResponse');
const dbInit = require('../../utils/dbInit');

// Import table modules
const vendorChats = require('../../tables/vendorChats');

/**
 * @desc    Get all chats for a vendor
 * @route   GET /api/vendor/chats
 * @access  Private/Vendor
 */
const getVendorChats = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    // Check permission
    const hasPermission = await dbInit.checkPermission(
      req.user.id,
      'chat',
      'view'
    );

    if (!hasPermission) {
      return next(new ErrorResponse('Not authorized to view chats', 403));
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        vendorChats.getVendorChatsSQL,
        [
          vendorId,
          parseInt(limit),
          (parseInt(page) - 1) * parseInt(limit)
        ]
      );

      // Get total count for pagination
      const countResult = await client.query(
        vendorChats.getVendorChatCountSQL,
        [vendorId]
      );

      const totalCount = parseInt(countResult.rows[0].count);

      // Get overall unread count
      const unreadCountResult = await client.query(
        vendorChats.getUnreadCountSQL,
        [vendorId, 'vendor']
      );

      const totalUnreadCount = parseInt(unreadCountResult.rows[0].count);

      res.json({
        success: true,
        count: totalCount,
        unreadCount: totalUnreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          hasMore: parseInt(page) * parseInt(limit) < totalCount
        },
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a specific chat
 * @route   GET /api/vendor/chats/:id
 * @access  Private/Vendor
 */
const getChatById = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const chatId = req.params.id;

    // Check permission
    const hasPermission = await dbInit.checkPermission(
      req.user.id,
      'chat',
      'view'
    );

    if (!hasPermission) {
      return next(new ErrorResponse('Not authorized to view chats', 403));
    }

    const client = await pool.connect();

    try {
      // Get chat details
      const chatResult = await client.query(
        vendorChats.getChatByIdSQL,
        [chatId, 'vendor']
      );

      if (chatResult.rows.length === 0) {
        return next(new ErrorResponse('Chat not found', 404));
      }

      const chat = chatResult.rows[0];

      // Verify that this chat belongs to the vendor
      if (chat.vendor_id !== vendorId) {
        return next(new ErrorResponse('Not authorized to access this chat', 403));
      }

      // Get messages for this chat
      const messagesResult = await client.query(
        vendorChats.getChatMessagesSQL,
        [chatId, 100, 0] // Get latest 100 messages
      );

      // Mark messages as read
      await client.query(
        vendorChats.markMessagesReadSQL,
        [chatId, 'vendor']
      );

      res.json({
        success: true,
        data: {
          chat: chat,
          messages: messagesResult.rows
        }
      });
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new chat
 * @route   POST /api/vendor/chats
 * @access  Private/Vendor
 */
const createChat = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const { subject, message, relatedEntityType, relatedEntityId } = req.body;

    if (!subject || !message) {
      return next(new ErrorResponse('Please provide subject and message', 400));
    }

    // Check permission
    const hasPermission = await dbInit.checkPermission(
      req.user.id,
      'chat',
      'edit'
    );

    if (!hasPermission) {
      return next(new ErrorResponse('Not authorized to create chats', 403));
    }

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Create chat
      const chatResult = await client.query(
        vendorChats.createChatSQL,
        [
          vendorId,
          subject,
          'active',
          relatedEntityType || null,
          relatedEntityId || null
        ]
      );

      const chat = chatResult.rows[0];

      // Add the initial message
      const messageResult = await client.query(
        vendorChats.addMessageSQL,
        [
          chat.id,
          vendorId,
          'vendor',
          message,
          '[]' // No attachments
        ]
      );

      // Update the chat's last_message_at
      await client.query(
        vendorChats.updateChatLastMessageSQL,
        [chat.id]
      );

      // Commit transaction
      await client.query('COMMIT');

      // Log activity
      await dbInit.logActivity(
        req.user.id,
        vendorId,
        'CHAT_MESSAGE_SENT',
        `Created new chat: ${subject}`,
        {
          chatId: chat.id,
          relatedEntityType,
          relatedEntityId
        },
        chat.id,
        'chat',
        req.ip
      );

      res.status(201).json({
        success: true,
        data: {
          chat: chat,
          message: messageResult.rows[0]
        }
      });
    } catch (err) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add a message to a chat
 * @route   POST /api/vendor/chats/:id/messages
 * @access  Private/Vendor
 */
const addMessage = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const chatId = req.params.id;
    const { message, attachments } = req.body;

    if (!message) {
      return next(new ErrorResponse('Please provide a message', 400));
    }

    // Check permission
    const hasPermission = await dbInit.checkPermission(
      req.user.id,
      'chat',
      'edit'
    );

    if (!hasPermission) {
      return next(new ErrorResponse('Not authorized to send messages', 403));
    }

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Verify chat exists and belongs to vendor
      const chatResult = await client.query(
        'SELECT * FROM blinds.vendor_chats WHERE id = $1 AND vendor_id = $2',
        [chatId, vendorId]
      );

      if (chatResult.rows.length === 0) {
        return next(new ErrorResponse('Chat not found or not authorized', 404));
      }

      // Add message
      const messageResult = await client.query(
        vendorChats.addMessageSQL,
        [
          chatId,
          vendorId,
          'vendor',
          message,
          JSON.stringify(attachments || [])
        ]
      );

      // Update the chat's last_message_at
      await client.query(
        vendorChats.updateChatLastMessageSQL,
        [chatId]
      );

      // If chat was closed/archived, reopen it
      if (chatResult.rows[0].status !== 'active') {
        await client.query(
          vendorChats.updateChatStatusSQL,
          [chatId, 'active']
        );
      }

      // Commit transaction
      await client.query('COMMIT');

      // Log activity
      await dbInit.logActivity(
        req.user.id,
        vendorId,
        'CHAT_MESSAGE_SENT',
        `Sent message in chat: ${chatResult.rows[0].subject}`,
        {
          chatId,
          hasAttachments: attachments && attachments.length > 0
        },
        chatId,
        'chat',
        req.ip
      );

      res.status(201).json({
        success: true,
        data: messageResult.rows[0]
      });
    } catch (err) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Close/Archive a chat
 * @route   PUT /api/vendor/chats/:id
 * @access  Private/Vendor
 */
const updateChatStatus = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const chatId = req.params.id;
    const { status } = req.body;

    if (!status || !['active', 'closed', 'archived'].includes(status)) {
      return next(new ErrorResponse('Please provide a valid status (active, closed, or archived)', 400));
    }

    // Check permission
    const hasPermission = await dbInit.checkPermission(
      req.user.id,
      'chat',
      'edit'
    );

    if (!hasPermission) {
      return next(new ErrorResponse('Not authorized to update chat status', 403));
    }

    const client = await pool.connect();

    try {
      // Verify chat exists and belongs to vendor
      const chatResult = await client.query(
        'SELECT * FROM blinds.vendor_chats WHERE id = $1 AND vendor_id = $2',
        [chatId, vendorId]
      );

      if (chatResult.rows.length === 0) {
        return next(new ErrorResponse('Chat not found or not authorized', 404));
      }

      // Update status
      const result = await client.query(
        vendorChats.updateChatStatusSQL,
        [chatId, status]
      );

      // Log activity
      await dbInit.logActivity(
        req.user.id,
        vendorId,
        'SETTINGS_CHANGED',
        `Updated chat status to ${status}: ${chatResult.rows[0].subject}`,
        {
          chatId,
          previousStatus: chatResult.rows[0].status,
          newStatus: status
        },
        chatId,
        'chat',
        req.ip
      );

      res.json({
        success: true,
        data: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Search chats
 * @route   GET /api/vendor/chats/search
 * @access  Private/Vendor
 */
const searchChats = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const { query, page = 1, limit = 20 } = req.query;

    if (!query) {
      return next(new ErrorResponse('Please provide a search query', 400));
    }

    // Check permission
    const hasPermission = await dbInit.checkPermission(
      req.user.id,
      'chat',
      'view'
    );

    if (!hasPermission) {
      return next(new ErrorResponse('Not authorized to search chats', 403));
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        vendorChats.searchChatsSQL,
        [
          'vendor', // User type
          vendorId,
          `%${query}%`,
          parseInt(limit),
          (parseInt(page) - 1) * parseInt(limit)
        ]
      );

      // Get total count matching the search
      const countResult = await client.query(
        `SELECT COUNT(*) FROM blinds.vendor_chats vc
         JOIN blinds.vendor ON vc.vendor_id = vendor.id
         LEFT JOIN chat_messages cm ON vc.id = cm.chat_id
         WHERE
           vc.vendor_id = $1 AND
           (
             vc.subject ILIKE $2 OR
             vendor.name ILIKE $2 OR
             vendor.email ILIKE $2 OR
             cm.message ILIKE $2 OR
             vc.related_entity_id ILIKE $2
           )`,
        [vendorId, `%${query}%`]
      );

      const totalCount = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        count: totalCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          hasMore: parseInt(page) * parseInt(limit) < totalCount
        },
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get unread message count
 * @route   GET /api/vendor/chats/unread
 * @access  Private/Vendor
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const vendorId = req.user.id;

    // Check permission
    const hasPermission = await dbInit.checkPermission(
      req.user.id,
      'chat',
      'view'
    );

    if (!hasPermission) {
      return next(new ErrorResponse('Not authorized to view chats', 403));
    }

    const client = await pool.connect();

    try {
      // Get unread count
      const countResult = await client.query(
        vendorChats.getUnreadCountSQL,
        [vendorId, 'vendor']
      );

      const totalUnreadCount = parseInt(countResult.rows[0].count);

      // Get chats with unread messages
      const chatsResult = await client.query(
        vendorChats.getChatsWithUnreadSQL,
        [vendorId, 'vendor']
      );

      res.json({
        success: true,
        unreadCount: totalUnreadCount,
        chats: chatsResult.rows
      });
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVendorChats,
  getChatById,
  createChat,
  addMessage,
  updateChatStatus,
  searchChats,
  getUnreadCount
};
