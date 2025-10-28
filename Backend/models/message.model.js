import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    messageType: {
        type: String,
        enum: ['text', 'emoji'],
        default: 'text'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    chatId: {
        type: String,
        required: true // Will be a combination of both user IDs
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message" // For replying to specific messages
    }
}, {
    timestamps: true,
    versionKey: false
});

// Index for efficient chat queries
messageSchema.index({ chatId: 1, createdAt: 1 });
messageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;