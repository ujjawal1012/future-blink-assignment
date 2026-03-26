import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
