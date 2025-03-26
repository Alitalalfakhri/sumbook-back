import express from 'express';
import cors from 'cors';
import { books } from './data/books.mjs'; // Make sure this file exists and exports books correctly.
import cartRouter from './routers/cart.mjs';
import mongoose from 'mongoose';
import Book from './shemas/Book.mjs';
import booksRouter from './routers/books.mjs';
import authentication from './routers/auth.mjs';
import ordersRouter from './routers/orders.mjs';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bodyParser from 'body-parser';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';

dotenv.config()


const app = express();

const corsOptions = {
  origin: [
    'https://sumbook-front-end.vercel.app', 
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight

app.use(express.json());
app.use(bodyParser.json())
app.use(cookieParser())

app.use(session({
  secret: process.env.SESSION_SECRET || "dwkqjqiojkm",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: "mongodb+srv://alitalalfakhri0009:5HDPv8IIAXjF6BPh@cluster0.6s52p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    secure: true,         // Must be true for production
    sameSite: 'none',     // Required for cross-domain
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000,
    domain: '.railway.app' // Important for cross-subdomain
  }
}));
app.use(authentication)
app.use(cartRouter)
app.use(booksRouter)
app.use(ordersRouter)

const port = process.env.PORT || 4000;

async function connectDb() {
  try {
    mongoose.connect("mongodb+srv://alitalalfakhri0009:5HDPv8IIAXjF6BPh@cluster0.6s52p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    console.log("Connected to MongoDB")
  } catch (err) {
    console.error(err)
  }
}

connectDb()




app.get('/', (req, res) => {
 
  res.send('home ');
});




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
