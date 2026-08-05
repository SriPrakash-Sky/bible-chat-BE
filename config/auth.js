// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import * as userService from "../services/userService.js";
// import { sendResponse } from "../utils/helper.js";
// dotenv.config();

// export const auth = async (req, res, next) => {
//   try {
//     const token = req.header("auth-token");

//     if (!token) {
//       sendResponse(res, 403, false, [], "Access denied");
//       return;
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const existingUser = await userService.findUserById(decoded?.id);

//     if (!existingUser || existingUser?.login_count !== decoded?.login_count) {
//       sendResponse(
//         res,
//         403,
//         false,
//         [],
//         "Session expired. Login again to continue",
//       );
//       return;
//     }

//     next();
//   } catch (error) {
//     console.log(error);
//     sendResponse(res, 403, false, [], "Invalid token");
//     return;
//   }
// };
