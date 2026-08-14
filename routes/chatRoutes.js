import express from "express";

import {
  getConversation,
  getConversationsList,
  getSingleChatMessages,
  sendMessage,
  deleteConversation,
  deleteMessage,
  updateReadStatus,
  editMessage,
  updateChatStatus,
  replyMessage,
} from "../controllers/chatController.js";

const router = express.Router();

router.post(
  "/create-conversation",
  /* 
  #swagger.tags = ['Chat']
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        app_id: 0,
        post_id: 0,
        sender_id: 0,
        receiver_id: 0
      }
    }
        #swagger.responses[200] = {
    description: "Conversation created successfully",
    schema: {
      "success": true,
      "message": "Conversation created successfully",
      "conversation_id": 4
    }
  }
  */ getConversation,
);

router.post(
  "/conversation-list",
  /* 
  #swagger.tags = ['Chat']
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        user_id: 0
      }
    }
  */ getConversationsList,
);

router.post(
  "/single-conversation",
  /* 
  #swagger.tags = ['Chat']
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        user_id: 0,
        conversation_id: 0,
        page: 1
      }
    }
       #swagger.responses[200] = {
    description: "Conversation created successfully",
    schema:{
      "success": true,
      "message": "Single convo",
      "total": 1,
      "total_pages": 1,
      "data": [
        {
          "id": 55,
          "conversation_id": 3,
          "sender_id": 1,
          "sender_name": "name",
          "message": "Hello",
          "message_type": "text",
          "reply_message_id": 0,
          "reply_message": "",
          "is_edited": 0,
          "is_read": 0,
          "created_at": "2026-08-12 12:04:06"
        }
      ]
    }
  }
  */ getSingleChatMessages,
);

router.post(
  "/send-message",

  /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'Send Message'

    #swagger.parameters['body'] = {
      in:'body',
      required:true,
      schema:{
        conversation_id:1,
        sender_id:1,
        receiver_id:1,
        message:"Hello",
        message_type:"text"
      }
    }
       #swagger.responses[200] = {
    description: "Conversation created successfully",
    schema: {
        "success": true,
        "message": "Message sent successfully",
        "data": []
      }
  }
  */

  sendMessage,
);

router.post(
  "/reply-message",

  /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'Reply Message'

    #swagger.parameters['body'] = {
      in:'body',
      required:true,
      schema:{
        conversation_id:1,
        sender_id:1,
        reply_message_id:1,
        message:"Hello",
        message_type:"text"
      }
    }
       #swagger.responses[200] = {
    description: "Reply sent successfully",
    schema: {
        "success": true,
        "message": "Reply sent successfully",
        "data": []
      }
  }
  */

  replyMessage,
);

router.post(
  "/edit-message",

  /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'Send Message'

    #swagger.parameters['body'] = {
      in:'body',
      required:true,
      schema:{
        conversation_id:1,
        message_id:1,
        sender_id:1,
        message:"Hello"
      }
    }
    #swagger.responses[200] = {
    description: "Conversation created successfully",
    schema: {
        "success": true,
        "message": "Message updated",
        "data": []
      }
  }
  */

  editMessage,
);

router.post(
  "/read-message",

  /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'Update Read Status'

    #swagger.parameters['body'] = {
      in:'body',
      required:true,
      schema:{
        conversation_id:1,
        user_id:2
      }
    }
          #swagger.responses[200] = {
    description: "Successfully",
    schema: {
        "success": true,
        "message": "Messages marked as read",
        "data": []
      }
  }
  */

  updateReadStatus,
);

router.post(
  "/delete-message",

  /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'Delete Message'

    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        message_id: 1,
        sender_id: 1
      }
    }
  */

  deleteMessage,
);

router.post(
  "/delete-conversation",

  /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'Delete Conversation'

    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        conversation_id: 1
      }
    }
  */

  deleteConversation,
);

router.post(
  "/online-status",

  /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'Delete Conversation'

    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        user_id: 1,
        is_online : 1
      }
    }
  */

  updateChatStatus,
);
export default router;
