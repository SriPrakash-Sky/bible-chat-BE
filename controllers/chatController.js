import db from "../config/db.js";
import db2 from "../config/db2.js";

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
            SELECT
                c.id AS conversation_id,
                c.last_message,
                c.last_message_time,
                cm.unread_count
            FROM conversations c

            JOIN conversation_members my
                ON my.conversation_id = c.id

            JOIN conversation_members other
                ON other.conversation_id = c.id


            JOIN conversation_members cm
                ON cm.conversation_id = c.id
                AND cm.user_id = ?

            WHERE my.user_id = ?
            AND other.user_id != ?

            ORDER BY c.last_message_time DESC
            `,
      [userId, userId, userId],
    );

    const userIds = rows.map((row) => row.user_id);

    // Create ?, ?, ? placeholders
    const placeholders = userIds.map(() => "?").join(",");

    // Get user details from DB2
    const [users] = await db2.query(
      `
      SELECT
          id,
          name
      FROM users
      WHERE id IN (${placeholders})
      `,
      userIds,
    );

    // Convert users into Map for fast lookup
    const userMap = new Map(users.map((user) => [Number(user.id), user]));

    // Combine DB1 + DB2 data
    const conversations = rows.map((conversation) => {
      const user = userMap.get(Number(conversation.user_id));

      return {
        conversation_id: conversation.conversation_id,
        user_id: conversation.user_id,
        name: user?.name || null,
        last_message: conversation.last_message,
        last_message_time: conversation.last_message_time,
        unread_count: conversation.unread_count,
      };
    });

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

import pool from "../config/db.js";
import { socketNotifier } from "../sockets/socketApi.js";
import { handleRemoveNull } from "../utils/helper.js";

export const getConversation = async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;

    if (!sender_id || !receiver_id) {
      return res.status(400).json({
        success: false,
        message: "sender_id and receiver_id are required",
      });
    }

    if (sender_id == receiver_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid users",
      });
    }

    // Check existing conversation
    const [conversation] = await pool.query(
      `
      SELECT
          c.id
      FROM conversations c
      INNER JOIN conversation_members cm1
          ON cm1.conversation_id = c.id
      INNER JOIN conversation_members cm2
          ON cm2.conversation_id = c.id
      WHERE
          c.type='single'
          AND cm1.user_id=?
          AND cm2.user_id=?
      LIMIT 1
      `,
      [sender_id, receiver_id],
    );

    if (conversation.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Conversation already exists",
        conversation_id: conversation[0].id,
      });
    }

    // Create Conversation
    const [result] = await pool.query(
      `
      INSERT INTO conversations
      (
          type,
          created_at,
          updated_at
      )
      VALUES
      (
          'single',
          NOW(),
          NOW()
      )
      `,
    );

    const conversationId = result.insertId;

    // Add Sender
    await pool.query(
      `
      INSERT INTO conversation_members
      (
          conversation_id,
          user_id,
          unread_count
      )
      VALUES
      (
          ?,
          ?,
          0
      )
      `,
      [conversationId, sender_id],
    );

    // Add Receiver
    await pool.query(
      `
      INSERT INTO conversation_members
      (
          conversation_id,
          user_id,
          unread_count
      )
      VALUES
      (
          ?,
          ?,
          0
      )
      `,
      [conversationId, receiver_id],
    );

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      conversation_id: conversationId,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getConversationsList = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
          c.id AS conversation_id,
          c.type,
          c.last_message,
          c.last_message_time,

          cm.unread_count,

          other.user_id

      FROM conversations c

      INNER JOIN conversation_members cm
          ON cm.conversation_id = c.id
          AND cm.user_id = ?

      INNER JOIN conversation_members other
          ON other.conversation_id = c.id
          AND other.user_id <> ?

      ORDER BY
          c.last_message_time DESC,
          c.updated_at DESC
      `,
      [user_id, user_id],
    );

    const userIds = rows.map((row) => Number(row.user_id));

    const placeholders = userIds.map(() => "?").join(",");
    console.log("userIds", userIds);
    // DB2 - Get user details
    const [users] = await db2.query(
      `
      SELECT
          id,
          name
      FROM users
      WHERE id IN (${placeholders})
      `,
      userIds,
    );

    // Convert users to Map
    const userMap = new Map(users.map((user) => [Number(user.id), user]));

    // Merge DB1 + DB2
    const conversations = rows.map((row) => {
      const user = userMap.get(Number(row.user_id));

      return {
        conversation_id: row.conversation_id,
        type: row.type,
        last_message: row.last_message,
        last_message_time: row.last_message_time,
        unread_count: row.unread_count,

        user_id: row.user_id,
        name: user?.name || null,
      };
    });

    await handleRemoveNull(conversations);

    return res.status(200).json({
      success: true,
      total: conversations.length,
      data: conversations,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleChatMessages = async (req, res) => {
  try {
    const { conversation_id, page = 1, limit = 20 } = req.body;

    if (!conversation_id) {
      return res.status(400).json({
        success: false,
        message: "conversation_id is required",
      });
    }

    const pageNo = Number(page);
    const pageLimit = Number(limit);

    const offset = (pageNo - 1) * pageLimit;

    // =========================
    // Total Messages - DB1
    // =========================

    const [countResult] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM messages
      WHERE conversation_id = ?
      `,
      [conversation_id],
    );

    const total = Number(countResult[0].total);

    // =========================
    // Messages - DB1
    // =========================

    const [messages] = await pool.query(
      `
      SELECT
          m.id,
          m.conversation_id,

          m.sender_id,

          m.message,
          m.message_type,

          m.reply_message_id,
          m.is_edited,

          rm.message AS reply_message,

          m.is_read,

          DATE_FORMAT(
              m.created_at,
              '%Y-%m-%d %H:%i:%s'
          ) AS created_at

      FROM messages m

      LEFT JOIN messages rm
          ON rm.id = m.reply_message_id

      WHERE
          m.conversation_id = ?

      ORDER BY
          m.created_at DESC

      LIMIT ?
      OFFSET ?
      `,
      [conversation_id, pageLimit, offset],
    );

    // No messages
    if (!messages.length) {
      return res.status(200).json({
        success: true,
        total,
        page: pageNo,
        limit: pageLimit,
        total_pages: Math.ceil(total / pageLimit),
        data: [],
      });
    }

    // =========================
    // Get Sender IDs
    // =========================

    const senderIds = [
      ...new Set(messages.map((message) => Number(message.sender_id))),
    ];

    // =========================
    // Users - DB2
    // =========================

    const placeholders = senderIds.map(() => "?").join(",");

    const [users] = await db2.query(
      `
      SELECT
          id,
          name
      FROM users
      WHERE id IN (${placeholders})
      `,
      senderIds,
    );

    // =========================
    // User Map
    // =========================

    const userMap = new Map(users.map((user) => [Number(user.id), user]));

    // =========================
    // Merge Messages + Users
    // =========================

    const finalMessages = messages.map((message) => {
      const sender = userMap.get(Number(message.sender_id));

      return {
        id: message.id,
        conversation_id: message.conversation_id,

        sender_id: message.sender_id,
        sender_name: sender?.name || null,

        message: message.message,
        message_type: message.message_type,

        reply_message_id: message.reply_message_id,
        reply_message: message.reply_message,

        is_edited: message.is_edited,
        is_read: message.is_read,

        created_at: message.created_at,
      };
    });

    await handleRemoveNull(finalMessages);

    return res.status(200).json({
      success: true,

      total,

      page: pageNo,

      limit: pageLimit,

      total_pages: Math.ceil(total / pageLimit),

      data: finalMessages,
    });
  } catch (error) {
    console.error("getSingleChatMessages error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const sendMessage = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      conversation_id,
      sender_id,
      receiver_id,
      message,
      message_type = "text",
      reply_message_id = 0,
    } = req.body;

    if (!conversation_id || !sender_id) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "conversation_id and sender_id are required",
      });
    }

    if (message_type === "text" && (!message || message.trim() === "")) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Check Conversation
    const [conversation] = await connection.query(
      `
      SELECT id
      FROM conversations
      WHERE id = ?
      `,
      [conversation_id],
    );

    if (conversation.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check Sender belongs to conversation
    const [member] = await connection.query(
      `
      SELECT id
      FROM conversation_members
      WHERE conversation_id = ?
      AND user_id = ?
      `,
      [conversation_id, sender_id],
    );

    if (member.length === 0) {
      await connection.rollback();

      return res.status(403).json({
        success: false,
        message: "User is not part of this conversation",
      });
    }

    // Insert Message
    const [insert] = await connection.query(
      `
      INSERT INTO messages
      (
        conversation_id,
        sender_id,
        message,
        message_type,
        reply_message_id,
        is_read
      )
      VALUES
      (
        ?, ?, ?, ?, ?, 0
      )
      `,
      [conversation_id, sender_id, message, message_type, reply_message_id],
    );

    let lastMessage = message;

    if (message_type === "image") lastMessage = "📷 Photo";
    if (message_type === "video") lastMessage = "🎥 Video";
    if (message_type === "file") lastMessage = "📄 File";

    // Update Conversation
    await connection.query(
      `
      UPDATE conversations
      SET
        last_message = ?,
        last_message_time = NOW(),
        updated_at = NOW()
      WHERE id = ?
      `,
      [lastMessage, conversation_id],
    );

    // Increase unread count for other users
    await connection.query(
      `
      UPDATE conversation_members
      SET unread_count = unread_count + 1
      WHERE conversation_id = ?
      AND user_id <> ?
      `,
      [conversation_id, sender_id],
    );

    // Get inserted message
    // const [messageData] = await connection.query(
    //   `
    //   SELECT
    //     m.*,
    //     u.name AS sender_name
    //   FROM messages m
    //   INNER JOIN users u
    //     ON u.id = m.sender_id
    //   WHERE m.id = ?
    //   `,
    //   [insert.insertId],
    // );

    await connection.commit();

    // Socket
    // if (global.io) {
    //   global.io
    //     .to(`conversation_${conversation_id}`)
    //     .emit("receive_message", messageData[0]);
    // }

    let newMsg = {
      id: insert.insertId,
      conversation_id,
      sender_id: sender_id,
      receiver_id,
      message,
      created_at: Date.now(),
    };
    console.log("487");
    await socketNotifier.newMessage(newMsg);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: "",
    });
  } catch (error) {
    await connection.rollback();

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

export const editMessage = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { conversation_id, message_id, sender_id, message } = req.body;

    if (!message_id || !sender_id || !message) {
      return res.status(400).json({
        success: false,
        message: "message_id, sender_id and message are required",
      });
    }

    const [rows] = await connection.query(
      `
      SELECT id, sender_id
      FROM messages
      WHERE id=?
      `,
      [message_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (rows[0].sender_id != sender_id) {
      return res.status(403).json({
        success: false,
        message: "You can edit only your own messages",
      });
    }

    await connection.query(
      `
      UPDATE messages
      SET
        message=?,
        is_edited=1,
        updated_at=NOW()
      WHERE id=?
      `,
      [message, message_id],
    );

    const [updated] = await connection.query(
      `
      SELECT *
      FROM messages
      WHERE id=?
      `,
      [message_id],
    );

    await socketNotifier.editMessage({
      conversation_id,
      message_id,
      sender_id,
      message,
    });

    return res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: updated[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

export const replyMessage = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      conversation_id,
      sender_id,
      reply_message_id,
      message,
      message_type = "text",
    } = req.body;

    if (!conversation_id || !sender_id || !reply_message_id || !message) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // Check original message
    const [reply] = await connection.query(
      `
      SELECT id
      FROM messages
      WHERE id=?
      `,
      [reply_message_id],
    );

    if (reply.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reply message not found",
      });
    }

    // Insert reply
    const [insert] = await connection.query(
      `
      INSERT INTO messages
      (
        conversation_id,
        sender_id,
        message,
        message_type,
        reply_message_id,
        is_read
      )
      VALUES
      (
        ?, ?, ?, ?, ?, 0
      )
      `,
      [conversation_id, sender_id, message, message_type, reply_message_id],
    );

    await connection.query(
      `
      UPDATE conversations
      SET
        last_message=?,
        last_message_time=NOW(),
        updated_at=NOW()
      WHERE id=?
      `,
      [message, conversation_id],
    );

    await connection.query(
      `
      UPDATE conversation_members
      SET unread_count=unread_count+1
      WHERE conversation_id=?
      AND user_id<>?
      `,
      [conversation_id, sender_id],
    );

    // const [data] = await connection.query(
    //   `
    //   SELECT
    //     m.*,
    //     u.name AS sender_name,

    //     r.message AS reply_message,
    //     r.sender_id AS reply_sender_id

    //   FROM messages m

    //   INNER JOIN users u
    //   ON u.id=m.sender_id

    //   LEFT JOIN messages r
    //   ON r.id=m.reply_message_id

    //   WHERE m.id=?
    //   `,
    //   [insert.insertId],
    // );

    await connection.commit();

    // let newMsg = {
    //   id: insert.insertId,
    //   sender_id: sender_id,
    //   message,
    //   created_at: Date.now(),
    //   is_read: 0,
    // };
    // await socketNotifier.newMessage(newMsg);

    return res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: [],
    });
  } catch (error) {
    await connection.rollback();

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

export const updateReadStatus = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { conversation_id, user_id } = req.body;

    if (!conversation_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "conversation_id and user_id are required",
      });
    }

    // Mark all received messages as read
    await connection.query(
      `
      UPDATE messages
      SET is_read = 1
      WHERE
          conversation_id = ?
          AND sender_id != ?
          AND is_read = 0
      `,
      [conversation_id, user_id],
    );

    // Reset unread count
    await connection.query(
      `
      UPDATE conversation_members
      SET unread_count = 0
      WHERE
          conversation_id = ?
          AND user_id = ?
      `,
      [conversation_id, user_id],
    );

    await socketNotifier.markRead({ conversation_id, user_id });
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    await connection.rollback();

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

export const deleteMessage = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { message_id, sender_id } = req.body;

    if (!message_id || !sender_id) {
      return res.status(400).json({
        success: false,
        message: "message_id and sender_id are required",
      });
    }

    const [rows] = await connection.query(
      `
      SELECT
        id,
        sender_id,
        conversation_id
      FROM messages
      WHERE id = ?
      `,
      [message_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (rows[0].sender_id != sender_id) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own messages",
      });
    }

    await connection.query(
      `
      DELETE FROM messages
      WHERE id = ?
      `,
      [message_id],
    );

    // Update last message if needed
    const [lastMessage] = await connection.query(
      `
      SELECT message, created_at
      FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [rows[0].conversation_id],
    );

    if (lastMessage.length > 0) {
      await connection.query(
        `
        UPDATE conversations
        SET
          last_message = ?,
          last_message_time = ?
        WHERE id = ?
        `,
        [
          lastMessage[0].message,
          lastMessage[0].created_at,
          rows[0].conversation_id,
        ],
      );
    } else {
      await connection.query(
        `
        UPDATE conversations
        SET
          last_message = NULL,
          last_message_time = NULL
        WHERE id = ?
        `,
        [rows[0].conversation_id],
      );
    }

    if (global.io) {
      global.io
        .to(`conversation_${rows[0].conversation_id}`)
        .emit("message_deleted", {
          message_id,
        });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

export const deleteConversation = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { conversation_id } = req.body;

    if (!conversation_id) {
      return res.status(400).json({
        success: false,
        message: "conversation_id is required",
      });
    }

    // Delete Messages
    await connection.query(
      `
      DELETE FROM messages
      WHERE conversation_id = ?
      `,
      [conversation_id],
    );

    // Delete Members
    await connection.query(
      `
      DELETE FROM conversation_members
      WHERE conversation_id = ?
      `,
      [conversation_id],
    );

    // Delete Conversation
    await connection.query(
      `
      DELETE FROM conversations
      WHERE id = ?
      `,
      [conversation_id],
    );

    await connection.commit();

    if (global.io) {
      global.io
        .to(`conversation_${conversation_id}`)
        .emit("conversation_deleted", {
          conversation_id,
        });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    await connection.rollback();

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

export const updateChatStatus = async (req, res) => {
  try {
    const { user_id, is_online } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    if (is_online) {
      await db2.query(
        `
        UPDATE users
        SET is_online = 1
        WHERE id = ?
        `,
        [user_id],
      );
    } else {
      await db2.query(
        `
        UPDATE users
        SET
          is_online = 0
        WHERE id = ?
        `,
        [user_id],
      );
    }

    return res.json({
      success: true,
      message: "User status updated",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};
