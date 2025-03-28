import mongoose from 'mongoose';

// Define the schema for the Rating subdocument
const ratingSchema = new mongoose.Schema({
  stars: {
    type: Number,
    required: true,
    min: 0,
    max: 5, // Rating stars should be between 0 and 5
  },
  count: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Define the schema for the Book document
const bookSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true, // Ensure that each book has a unique ID
  },
  image: {
    type: String,
    required: true, // Image URL is required
  },
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: ratingSchema, // Embedding the rating schema as a subdocument
    required: true,
  },
  priceCents: {
    type: Number,
    required: true,
    min: 0, // Ensure price is a positive integer (in cents)
  },
  keywords: {
    type: [String], // Array of strings for keywords
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

// Create a model using the schema
const Book = mongoose.model('Book', bookSchema);

export default Book;
