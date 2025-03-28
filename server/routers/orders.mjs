import express from 'express';
import EmailUser from '../shemas/EmailUser.mjs';
import GoogleUser from '../shemas/GoogleUser.mjs';
import mongoose from 'mongoose';
import Order from '../shemas/Order.mjs';
import Book from '../shemas/Book.mjs';
import axios from 'axios';

const router = express.Router();

 

// Function to send message to Telegram bot
async function sendTelegramMessage(message) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN; // Access bot token from .env
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
    });
    console.log('Telegram message sent successfully');
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

// Endpoint to add an order
router.post('/addOrder', async (req, res) => {
  const { itemsArray, price, date, phone, street, city, uid, type, id } = req.body;

  // Validate required fields
  if (!uid || !type || !itemsArray || !price || !date || !phone || !street || !city || !id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    let user;

    // Find the user based on the type
    if (type === "email") {
      user = await EmailUser.findOne({ uid: uid });
    } else if (type === "google") {
      user = await GoogleUser.findOne({ uid: uid });
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch all books
    const books = await Book.find();
    console.log('Books fetched:', books); // Debugging log

    // Add book names to itemsArray
    const updatedItemsArray = itemsArray.map(item => {
      const book = books.find(book => book.id === item.bookId);
      console.log('Book found for item:', book); // Debugging log

      if (book) {
        item.name = book.name; // Add the book name to the item
      } else {
        console.warn(`No book found for bookId: ${item.bookId}`); // Debugging log
      }
      return item; // Return the updated item
    });

    console.log('Updated itemsArray:', updatedItemsArray); // Debugging log

    
    const newOrder = new Order({
      itemsArray: updatedItemsArray, // Use the updated array
      price: price,
      date: date,
      phone: phone,
      street: street,
      city: city,
      uid: uid,
      id: id,
    });

    // Save the order
    await newOrder.save();

    // Add the order to the user's orders array
    user.orders.push(newOrder); // Assuming `orders` is an array of order IDs in the user schema
    await user.save();

    const telegramMessage =
      `New order received:\n
    Order ID: ${newOrder.id}\n
    User ID: ${newOrder.uid}\n
    Total Price: ${newOrder.price}\n
    Date: ${newOrder.date}\n
    Address: ${newOrder.street}, ${newOrder.city}\n
    Phone: ${newOrder.phone}\n
    Items:\n${newOrder.itemsArray.reduce((acc, item) => acc + `- ${item.name}, Quantity: ${item.quantity}\n \n`, '')}`;

    
    await sendTelegramMessage(telegramMessage);

    // Send success response
    res.status(200).json({ message: 'Order added successfully', order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Endpoint to fetch orders and books
router.post("/api/orders", async (req, res) => {
  const { uid } = req.body;
  const orders = await Order.find({ uid: uid });
  const books = await Book.find();
 

  if (orders && books) {
    res.status(200).json({ orders: orders, books: books });
  } else if (orders.length === 0) {
    res.send("No orders found");
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

export default router;