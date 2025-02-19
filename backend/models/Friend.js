// models/Friend.js
const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true,
        ref: 'User'
    },
    receiverId: {
        type: String,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
}, { timestamps: true });

// Ensure unique friend requests
FriendSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

module.exports = mongoose.model("Friend", FriendSchema);