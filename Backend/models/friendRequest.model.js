import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String,
        maxlength: 100 // Optional message when sending request
    }
}, {
    timestamps: true,
    versionKey: false
});

// Ensure unique friend requests
friendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

// Index for efficient queries
friendRequestSchema.index({ receiver: 1, status: 1 });
friendRequestSchema.index({ sender: 1, status: 1 });

const FriendRequestModel = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequestModel;