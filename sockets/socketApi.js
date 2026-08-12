import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const SOCKET_SERVER = process.env.SOCKET_SERVER_URL;

export const socketNotifier = {
  // ── existing ────────────────────────────────────────────────────────────────
  conversationUpdate: (data) =>
    axios
      .post(`${SOCKET_SERVER}/emit/conversation_update`, data)
      .catch(console.error),
  block: (data) =>
    axios.post(`${SOCKET_SERVER}/emit/block`, data).catch(console.error),
  newMessage: (data) =>
    axios.post(`${SOCKET_SERVER}/emit/send-message`, data).catch(console.error),
  markRead: (data) =>
    axios.post(`${SOCKET_SERVER}/emit/mark-read`, data).catch(console.error),
  editMessage: (data) =>
    axios.post(`${SOCKET_SERVER}/emit/edit-message`, data).catch(console.error),
  unsendMessage: (data) =>
    axios
      .post(`${SOCKET_SERVER}/emit/unsend-message`, data)
      .catch(console.error),

  // ── call events ─────────────────────────────────────────────────────────────
  incomingCall: (data) =>
    axios
      .post(`${SOCKET_SERVER}/emit/incoming-call`, data)
      .catch(console.error),
  acceptCall: (data) =>
    axios.post(`${SOCKET_SERVER}/emit/accept-call`, data).catch(console.error),
  rejectCall: (data) =>
    axios.post(`${SOCKET_SERVER}/emit/reject-call`, data).catch(console.error),
  endCall: (data) =>
    axios.post(`${SOCKET_SERVER}/emit/end-call`, data).catch(console.error),
};
