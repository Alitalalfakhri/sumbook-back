import express from 'express';

const router = express.Router();

import Book from '../shemas/Book.mjs';

router.get("/api/books", async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

async function findBooks(query){
  const books = await Book.find({ name: { $regex: query, $options: 'i' } });
  return books
}

router.get("/search" , async (req, res) =>{
  const input = req.query
  
  
  if(!input){
    return res.status(400).json({
      message:"Please enter a query"
    })
  }
  const result = await findBooks(input.name);
  if(result.length === 0){
    res.send([])
  }else if(result.length > 0){
    res.status(200).json(result)
  }
})


export default router;