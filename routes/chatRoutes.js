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
        senderId: 0,
        receiverId: 0
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
        conversation_id: 0
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
        message:"Hello",
        message_type:"text"
      }
    }
  */

  sendMessage,
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
        message_id:1,
        sender_id:1,
        message:"Hello"
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
