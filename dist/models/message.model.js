import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
        index: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent",
        required: true,
    },
    readAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
export default mongoose.model("Message", messageSchema);
//# sourceMappingURL=message.model.js.map