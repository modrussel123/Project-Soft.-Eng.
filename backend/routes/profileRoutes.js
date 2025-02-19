const express = require('express');
const User = require('../models/User');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log("✅ 'uploads/' directory created!");
}

// ✅ Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR); // ✅ Save images in 'uploads/' folder
    },
    filename: (req, file, cb) => {
        cb(null, req.user.userId + path.extname(file.originalname));
    }
});

// Add allowed file types
const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff'
];

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB in bytes
    },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only images and GIF files are allowed. Supported formats: JPG, PNG, GIF, WebP, BMP, TIFF'));
        }
    }
});

// ✅ Middleware to check authentication
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), 'secret');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Invalid token:', error.message);
        res.status(400).json({ error: 'Invalid token' });
    }
};

// ✅ Fetch user profile
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('firstName lastName email profilePicture');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Upload or update profile picture
router.post('/upload-profile', authMiddleware, (req, res) => {
    upload.single('profilePicture')(req, res, async (err) => {
        try {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'File size cannot exceed 5MB' });
                }
                return res.status(400).json({ error: err.message });
            } else if (err) {
                return res.status(400).json({ 
                    error: 'Invalid file type. Supported formats: JPG, PNG, GIF, WebP, BMP, TIFF' 
                });
            }

            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            const filePath = `uploads/${req.file.filename}`;
            const user = await User.findByIdAndUpdate(
                req.user.userId,
                { profilePicture: filePath },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ message: "Profile picture updated", profilePicture: user.profilePicture });
        } catch (error) {
            console.error("Profile upload error:", error.message);
            res.status(500).json({ error: error.message });
        }
    });
});

// ✅ Delete profile picture
router.delete('/delete-profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.userId, { profilePicture: "" }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ message: "Profile picture removed", profilePicture: user.profilePicture });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//  handle name updates
router.put('/update-name', authMiddleware, async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { firstName, lastName },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            firstName: user.firstName,
            lastName: user.lastName
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
