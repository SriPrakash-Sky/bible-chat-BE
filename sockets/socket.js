// import db from "../config/db.js";
// import { openConvo, updateUserStatus } from "./socketApi.js";

// const onlineUsers = new Map();

// const chatSocket = (io) => {
//   io.on("connection", (socket) => {
//     console.log("Socket Connected :", socket.id);

//     /*
//       User Connected
//     */
//     socket.on("join", async (user_id) => {
//       try {
//         user_id = Number(user_id);

//         socket.user_id = user_id;

//         onlineUsers.set(user_id, socket.id);

//         socket.join(`user_${user_id}`);

//         await updateUserStatus(user_id, true);

//         // Send existing online users to this user
//         socket.emit("online_users", Array.from(onlineUsers.keys()));

//         // Notify everyone that this user came online
//         io.emit("user_online", {
//           user_id,
//         });

//         console.log(`${user_id} Online`);

//         console.log("Online Users :", Array.from(onlineUsers.keys()));
//       } catch (err) {
//         console.log(err);
//       }
//     });

//     /*
//       Open Conversation
//     */
//     socket.on("join_conversation", async (data) => {
//       try {
//         const { conversation_id, user_id } = data;

//         socket.join(`conversation_${conversation_id}`);

//         console.log(`${user_id} joined conversation ${conversation_id}`);

//         /*
//           Mark Sent -> Delivered
//         */

//         await openConvo(user_id, conversation_id);
//       } catch (err) {
//         console.log(err);
//       }
//     });

//     /*
//       Leave Conversation
//     */

//     socket.on("leave_conversation", (conversation_id) => {
//       socket.leave(`conversation_${conversation_id}`);
//     });

//     /*
//       Typing
//     */

//     socket.on("typing", (data) => {
//       socket.to(`conversation_${data.conversation_id}`).emit("typing", {
//         user_id: data.user_id,
//       });
//     });

//     /*
//       Stop Typing
//     */

//     socket.on("stop_typing", (data) => {
//       socket.to(`conversation_${data.conversation_id}`).emit("stop_typing", {
//         user_id: data.user_id,
//       });
//     });

//     /*
//       Read Receipt
//     */

//     socket.on("messages_read", (data) => {
//       io.to(`conversation_${data.conversation_id}`).emit("messages_read", {
//         conversation_id: data.conversation_id,
//       });
//     });

//     /*
//       Disconnect
//     */

//     socket.on("disconnect", async () => {
//       try {
//         if (socket.user_id) {
//           onlineUsers.delete(socket.user_id);

//           await updateUserStatus(user_id, false);

//           io.emit("user_offline", {
//             user_id: socket.user_id,
//             last_seen: new Date(),
//           });

//           console.log(`${socket.user_id} Offline`);
//         }

//         console.log("Socket Disconnected");
//       } catch (err) {
//         console.log(err);
//       }
//     });
//   });
// };

// export default chatSocket;

// export { onlineUsers };
