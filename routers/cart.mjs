// routers/cart.mjs
import express from 'express';
import { books } from '../data/books.mjs'; // Import books data

const router = express.Router();

// Function to analyze cart
function analyseCart(array) {
  const result = [
    { category: "Marketing", quantity: 0 },
    { category: "Business", quantity: 0 },
    { category: "Self-Development", quantity: 0 },
    { category: "Stories", quantity: 0 }
  ];
  const userCart = [];

  array.forEach((item) => {
    const matchingItem = books.find(book => book.id === item.bookId);

    if (matchingItem) {
      userCart.push({
        bookName: matchingItem.name,
        category: matchingItem.category,
      });

      // Update the quantity for the matching category
      result.forEach(category => {
        if (category.category === matchingItem.category) {
          category.quantity += item.quantity;
        }
      });
    } else {
      console.log(`No match found for bookId: ${item.bookId}`);
    }
  });

  function calculatePercentages() {
    let totalQuantity = 0;

    // Calculate the total quantity of all items in the cart
    result.forEach(item => {
      totalQuantity += item.quantity;
    });

    // Calculate the percentage for each category
    result.forEach(category => {
      if (totalQuantity > 0) {
        category.quantity = (category.quantity / totalQuantity) * 100;
      } else {
        category.quantity = 0;  // Avoid division by zero if the total is 0
      }
    });
  }

  calculatePercentages();
  return result;
}

// POST /checkout - Calculate and return analysis result
router.post('/checkout', (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).send('Invalid request body');
  }

  const analysisResult = analyseCart(req.body);
  res.send(analysisResult);
});

// GET /checkout - Return the current analysis result
router.get('/checkout', (req, res) => {
  const analysisResult = analyseCart(req.body); // If you want to persist the result across requests, you could store it in a variable
  res.send(analysisResult);
});

export default router;
