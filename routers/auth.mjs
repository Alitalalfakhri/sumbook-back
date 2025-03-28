import express from 'express';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { body, validationResult } from 'express-validator';
import EmailUser from '../shemas/EmailUser.mjs';
import GoogleUser from '../shemas/GoogleUser.mjs'
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from "cors";
dotenv.config();

const router = express.Router();


const firebaseConfig = {
  apiKey: "AIzaSyDh1UQ92aWOpYJsCTaYEn66J7V9Pdqvfd4",
  authDomain: "sumbook-ali.firebaseapp.com",
  projectId: "sumbook-ali",
  storageBucket: "sumbook-ali.firebasestorage.app",
  messagingSenderId: "255469526663",
  appId: "1:255469526663:web:60650ecfe8a63c592b2222",
  measurementId: "G-5PDNMHYS02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// POST route for sign-up with email
router.post(
  '/sign-up-email',
  [
    // Validation middleware
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, type } = req.body;

    try {
      // Hash the password before saving it
      const saltRounds = 10; // Number of salt rounds for bcrypt
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data in the database with the hashed password
      const newUser = new EmailUser({
        uid: user.uid,
        email: email,
        password: hashedPassword, // Save the hashed password
        type: type,
        orders: [],
      });

      await newUser.save();

      // Set session data
      req.session.trySession = true;
      req.session.createdAt = new Date();
      req.session.userId = user.uid;
      req.session.type = type;

      res.status(200).json({
        message: 'User created successfully!',
        user: {
          uid: user.uid,
          email: user.email,
        },
      });
    } catch (error) {
      // Handle Firebase authentication errors
      const errorCode = error.code;
      const errorMessage = error.message;

      res.status(500).json({
        errorCode,
        errorMessage,
      });
    }
  }
);

// POST route for sign-up with Google
router.post('/sign-up-google', async (req, res) => {
  const { displayName, email, uid, type } = req.body;

  if (displayName && email && uid) {
    try {
      const newUser = new GoogleUser({
        uid: uid,
        email: email,
        type: type,
        displayName: displayName,
      });

      await newUser.save();

      // Set session data
      req.session.trySession = true;
      req.session.createdAt = new Date();
      req.session.userId = uid;
      req.session.type = type;

      res.status(200).send('User created successfully');
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(400).send('Missing required fields');
  }
});

// GET route for authentication status
router.post('/auth/status', async (req, res) => {
  const { uid, type } = req.body;

  if (!uid || !type) {
    return res.status(400).send({
      error: 'Both uid and type are required',
      loggedIn: false
    });
  }

  try {
    let user = null;

    if (type === "email") {
      user = await EmailUser.findOne({ uid: uid });
    } else if (type === "google") {
      user = await GoogleUser.findOne({ uid: uid });
    } else {
      return res.status(400).send({
        error: 'Invalid type specified',
        loggedIn: false
      });
    }

    if (user) {
      return res.status(200).send({
        loggedIn: true,
        userId: uid,
        type: type,
      });
    } else {
      return res.status(404).send({
        loggedIn: false,
        error: 'User not found'
      });
    }
  } catch (err) {
    console.error('Error checking auth status:', err);
    return res.status(500).send({
      error: 'Internal server error',
      loggedIn: false,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});
// POST route for login with Google
router.post(
  '/login-google',
  [body('uid').trim().notEmpty().isString()],
  async (req, res) => {
    const { uid } = req.body;

    try {
      const user = await GoogleUser.findOne({ uid: uid });

      if (user) {
        // Set session data
        req.session.trySession = true;
        req.session.createdAt = new Date();
        req.session.userId = user.uid;
        req.session.type = user.type;

        res.status(200).json({
          message: 'User logged in successfully',
          user: {
            uid: user.uid,
            email: user.email,
          },
        });
      } else {
        res.status(404).json({
          message: 'User not found',
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'There is no account',
      });
    }
  }
);

// POST route for login with email
router.post(
  '/login-email',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        })) 
      });
    }

    const { email, password } = req.body;

    try {
      // Find the user by email
      const user = await EmailUser.findOne({ email: email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          errorCode: 'USER_NOT_FOUND'
        });
      }

      // Compare the provided password with the hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password',
          errorCode: 'INVALID_PASSWORD'
        });
      }

      // Set session data
      req.session.trySession = true;
      req.session.createdAt = new Date();
      req.session.userId = user.uid;
      req.session.type = user.type;

      // Successful login
      return res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        user: {
          uid: user.uid,
          email: user.email,
          type: user.type
        }
      });

    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred',
        errorCode: 'SERVER_ERROR',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

export default router;
