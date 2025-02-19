const express = require("express");
const router = express.Router();
const Friend = require("../models/Friend");
const User = require("../models/User");
const jwt = require('jsonwebtoken');
const UserFriend = require("../models/Userfriend"); // Add this line


// Authentication middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: "No authentication token provided" });
        }

        const decoded = jwt.verify(token, 'secret');
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = {
            userId: decoded.userId,
            email: user.email
        };
        next();
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(401).json({ message: "Authentication failed" });
    }
};


// Send friend request 
router.post("/request", authMiddleware, async (req, res) => {
    try {
        const { receiverEmail } = req.body;
        const senderEmail = req.user.email;

        if (senderEmail === receiverEmail) {
            return res.status(400).json({ message: "Cannot send friend request to yourself" });
        }

        // Find or create sender's friend document
        let senderFriend = await UserFriend.findOne({ userId: senderEmail });
        if (!senderFriend) {
            senderFriend = new UserFriend({ userId: senderEmail, friends: [] });
        }

        // Find or create receiver's friend document
        let receiverFriend = await UserFriend.findOne({ userId: receiverEmail });
        if (!receiverFriend) {
            receiverFriend = new UserFriend({ userId: receiverEmail, friends: [] });
        }

        // Check if there's an existing friendship
        const existingFriendship = senderFriend.friends.find(f => f.friendId === receiverEmail);
        if (existingFriendship && existingFriendship.status !== 'rejected') {
            return res.status(400).json({ message: "Friend request already exists" });
        }

        // If rejected, remove the old request
        if (existingFriendship && existingFriendship.status === 'rejected') {
            senderFriend.friends = senderFriend.friends.filter(f => f.friendId !== receiverEmail);
            receiverFriend.friends = receiverFriend.friends.filter(f => f.friendId !== senderEmail);
        }

        // Add new friend request with initiator field
        senderFriend.friends.push({
            friendId: receiverEmail,
            status: 'pending',
            initiator: senderEmail
        });

        receiverFriend.friends.push({
            friendId: senderEmail,
            status: 'pending',
            initiator: senderEmail
        });

        await senderFriend.save();
        await receiverFriend.save();

        res.status(201).json({ message: "Friend request sent successfully" });

    } catch (error) {
        console.error('Friend request error:', error);
        res.status(500).json({ message: "Failed to send friend request" });
    }
});

// Get friend requests
router.get("/requests", authMiddleware, async (req, res) => {
    try {
        const userFriend = await UserFriend.findOne({ userId: req.user.email });
        if (!userFriend) {
            return res.json([]);
        }

        // Only get requests where the user is NOT the initiator
        const pendingRequests = userFriend.friends.filter(f => 
            f.status === 'pending' && f.initiator !== req.user.email
        );
        
        // Populate user details for each request
        const requests = await Promise.all(
            pendingRequests.map(async (request) => {
                const sender = await User.findOne({ email: request.friendId })
                    .select('firstName lastName email profilePicture');
                return {
                    _id: request._id,
                    sender,
                    createdAt: request.createdAt
                };
            })
        );

        res.json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: "Failed to fetch friend requests" });
    }
});

// Add a new route to get sent requests
router.get("/sent-requests", authMiddleware, async (req, res) => {
    try {
        const userFriend = await UserFriend.findOne({ userId: req.user.email });
        if (!userFriend) {
            return res.json([]);
        }

        // Only get requests where the user IS the initiator
        const sentRequests = userFriend.friends.filter(f => 
            f.status === 'pending' && f.initiator === req.user.email
        );
        
        const requests = await Promise.all(
            sentRequests.map(async (request) => {
                const receiver = await User.findOne({ email: request.friendId })
                    .select('firstName lastName email profilePicture');
                return {
                    _id: request._id,
                    receiver,
                    createdAt: request.createdAt
                };
            })
        );

        res.json(requests);
    } catch (error) {
        console.error('Error fetching sent requests:', error);
        res.status(500).json({ message: "Failed to fetch sent requests" });
    }
});

// Search Users with  friendship status check
router.get("/search", authMiddleware, async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email })
            .select('firstName lastName email profilePicture');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check friendship status
        const userFriend = await UserFriend.findOne({
            userId: req.user.email,
            'friends.friendId': email
        });

        let friendshipStatus = "none";
        if (userFriend) {
            const friend = userFriend.friends.find(f => f.friendId === email);
            friendshipStatus = friend ? friend.status : "none";
        }

        // Allow new friend request if previous request was rejected
        if (friendshipStatus === "rejected") {
            friendshipStatus = "none";
        }

        res.json({
            ...user.toObject(),
            friendshipStatus
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: "Error searching for user" });
    }
});



// Accept Friend Request
router.post("/accept", authMiddleware, async (req, res) => {
    try {
        const { requestId } = req.body;
        const userEmail = req.user.email;

        // Find the user's friend document
        const userFriend = await UserFriend.findOne({ userId: userEmail });
        if (!userFriend) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        // Find the friend request in the array
        const friendRequest = userFriend.friends.id(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        // Update status to accepted
        friendRequest.status = 'accepted';

        // Find and update the sender's friend document
        const senderFriend = await UserFriend.findOne({ userId: friendRequest.friendId });
        if (senderFriend) {
            const senderRequest = senderFriend.friends.find(
                f => f.friendId === userEmail
            );
            if (senderRequest) {
                senderRequest.status = 'accepted';
                await senderFriend.save();
            }
        }

        await userFriend.save();
        res.json({ message: "Friend request accepted" });

    } catch (error) {
        console.error('Error accepting request:', error);
        res.status(500).json({ message: "Failed to accept request" });
    }
});
// Reject Friend Request
router.post("/reject", authMiddleware, async (req, res) => {
    try {
        const { requestId } = req.body;
        const userEmail = req.user.email;

        // Find the user's friend document
        const userFriend = await UserFriend.findOne({ userId: userEmail });
        if (!userFriend) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        // Find the friend request in the array
        const friendRequest = userFriend.friends.id(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        // Update status to rejected
        friendRequest.status = 'rejected';

        // Find and update the sender's friend document
        const senderFriend = await UserFriend.findOne({ userId: friendRequest.friendId });
        if (senderFriend) {
            const senderRequest = senderFriend.friends.find(
                f => f.friendId === userEmail
            );
            if (senderRequest) {
                senderRequest.status = 'rejected';
                await senderFriend.save();
            }
        }

        await userFriend.save();
        res.json({ message: "Friend request rejected" });

    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ message: "Failed to reject request" });
    }
});

// Remove Friend
router.post("/remove", authMiddleware, async (req, res) => {
    try {
        const { friendEmail } = req.body;
        const userEmail = req.user.email;

        // Remove friend from user's document
        const userFriend = await UserFriend.findOne({ userId: userEmail });
        if (userFriend) {
            userFriend.friends = userFriend.friends.filter(
                f => f.friendId !== friendEmail
            );
            await userFriend.save();
        }

        // Remove user from friend's document
        const otherFriend = await UserFriend.findOne({ userId: friendEmail });
        if (otherFriend) {
            otherFriend.friends = otherFriend.friends.filter(
                f => f.friendId !== userEmail
            );
            await otherFriend.save();
        }

        res.json({ message: "Friend removed successfully" });
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).json({ message: "Failed to remove friend" });
    }
});
// Remove Friend
router.post("/remove", authMiddleware, async (req, res) => {
    const { friendEmail } = req.body;
    try {
        // Remove friendship entries
        await UserFriend.deleteMany({
            $or: [
                { userId: req.user.email, friendId: friendEmail },
                { userId: friendEmail, friendId: req.user.email }
            ]
        });

        // Remove any existing friend requests
        await Friend.deleteMany({
            $or: [
                { senderId: req.user.email, receiverId: friendEmail },
                { senderId: friendEmail, receiverId: req.user.email }
            ]
        });

        res.json({ message: "Friend removed successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/cancel-request", authMiddleware, async (req, res) => {
    try {
        const { receiverEmail } = req.body;
        const senderEmail = req.user.email;

        // Remove from sender's document
        const senderFriend = await UserFriend.findOne({ userId: senderEmail });
        if (senderFriend) {
            senderFriend.friends = senderFriend.friends.filter(
                f => f.friendId !== receiverEmail
            );
            await senderFriend.save();
        }

        // Remove from receiver's document
        const receiverFriend = await UserFriend.findOne({ userId: receiverEmail });
        if (receiverFriend) {
            receiverFriend.friends = receiverFriend.friends.filter(
                f => f.friendId !== senderEmail
            );
            await receiverFriend.save();
        }

        res.json({ message: "Friend request cancelled successfully" });
    } catch (error) {
        console.error('Error cancelling request:', error);
        res.status(500).json({ message: "Failed to cancel friend request" });
    }
});

// Get Friends List
router.get("/list", authMiddleware, async (req, res) => {
    try {
        const userFriend = await UserFriend.findOne({ userId: req.user.email });
        if (!userFriend) {
            return res.json([]);
        }

        const acceptedFriends = userFriend.friends.filter(f => f.status === 'accepted');
        
        const friendsList = await Promise.all(
            acceptedFriends.map(async (friend) => {
                const friendUser = await User.findOne({ email: friend.friendId })
                    .select('firstName lastName email profilePicture');
                return {
                    _id: friend._id,
                    friendId: friendUser
                };
            })
        );

        res.json(friendsList);
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ message: "Failed to fetch friends list" });
    }
});
module.exports = router;