const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema({
    friendId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "cancelled"],
        default: "pending"
    },
    initiator: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const UserFriendSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    friends: [FriendSchema]
});

// Add a pre-save middleware to update the updatedAt field
FriendSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("UserFriend", UserFriendSchema);