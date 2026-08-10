// "use strict";

// const API_URL = process.env.API_URL;

// const updateUserStatus = async (user_id, is_online) => {
//   try {
//     const response = await fetch(`${API_URL}/chat/online-status`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         user_id,
//         is_online,
//       }),
//     });

//     const data = await response.json();

//     console.log("Status API:", data);

//     return data;
//   } catch (error) {
//     console.error("Status API error:", error.message);

//     throw error;
//   }
// };

// const openConvo = async (user_id, conversation_id) => {
//   try {
//     const response = await fetch(`${API_URL}/chat/read-message`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         user_id,
//         conversation_id,
//       }),
//     });

//     const data = await response.json();

//     console.log("Read message API:", data);

//     return data;
//   } catch (error) {
//     console.error("Read message API error:", error.message);

//     throw error;
//   }
// };

// module.exports = {
//   updateUserStatus,
//   openConvo,
// };
