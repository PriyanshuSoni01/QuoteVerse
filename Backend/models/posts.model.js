import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxlength: 500 // Limit for quotes/poems
    },
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    type: {
        type: String,
        enum: ['quote', 'poem', 'thought'],
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    likesCount: {
        type: Number,
        default: 0
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            required: true,
            maxlength: 200
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    commentsCount: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        maxlength: 20
    }]
}, {
    timestamps: true,
    versionKey: false
});

// Index for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likesCount: -1 });

const PostModel = mongoose.model("Post", postSchema);

export default PostModel;