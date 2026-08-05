import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
    },
    receiverId: {
      type: String,
    },
    message: String,
    isRead: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model("Message", messageSchema);
