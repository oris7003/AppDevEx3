// REST API routes for Books collection and items
const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET /api/books - Retrieve books with optional category and sorting query parameters
router.get('/books', (req, res) => {
  const { category, sortBy, order } = req.query;
  const books = store.getBooks({ category, sortBy, order });
  res.status(200).json({
    total: books.length,
    filters: { category: category || null, sortBy: sortBy || null, order: order || 'asc' },
    data: books
  });
});

// GET /api/books/:id - Retrieve a specific book by ID
router.get('/books/:id', (req, res) => {
  const { id } = req.params;
  const book = store.getBookById(id);

  if (!book) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Book with ID ${id} was not found`
    });
  }

  res.status(200).json({ data: book });
});

// POST /api/books - Create a new book
router.post('/books', (req, res) => {
  const { title, author, category, price, rating, inStock } = req.body;

  // Basic validation for required book fields
  if (!title || !author) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Title and author are required fields'
    });
  }

  const newBook = store.createBook({ title, author, category, price, rating, inStock });
  res.status(201).json({
    message: 'Book created successfully',
    data: newBook
  });
});

// PATCH /api/books/:id - Partially update an existing book
router.patch('/books/:id', (req, res) => {
  const { id } = req.params;
  const updatedBook = store.updateBook(id, req.body);

  if (!updatedBook) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Book with ID ${id} was not found`
    });
  }

  res.status(200).json({
    message: 'Book updated successfully',
    data: updatedBook
  });
});

// PUT /api/books/:id - Update an existing book
router.put('/books/:id', (req, res) => {
  const { id } = req.params;
  const updatedBook = store.updateBook(id, req.body);

  if (!updatedBook) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Book with ID ${id} was not found`
    });
  }

  res.status(200).json({
    message: 'Book updated successfully',
    data: updatedBook
  });
});

// DELETE /api/books/:id - Remove a book by ID
router.delete('/books/:id', (req, res) => {
  const { id } = req.params;
  const deleted = store.deleteBook(id);

  if (!deleted) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Book with ID ${id} was not found`
    });
  }

  res.status(200).json({
    message: 'Book deleted successfully',
    data: deleted
  });
});

// Relational Reviews Endpoints

// GET /api/books/:id/reviews - Retrieve all reviews for a specific book
router.get('/books/:id/reviews', (req, res) => {
  const { id } = req.params;
  const book = store.getBookById(id);

  if (!book) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Cannot retrieve reviews: Book with ID ${id} was not found`
    });
  }

  const reviews = store.getReviews({ bookId: id });
  res.status(200).json({
    bookId: Number(id),
    bookTitle: book.title,
    total: reviews.length,
    data: reviews
  });
});

// POST /api/books/:id/reviews - Create a new review for a specific book
router.post('/books/:id/reviews', (req, res) => {
  const { id } = req.params;
  const book = store.getBookById(id);

  if (!book) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Cannot add review: Book with ID ${id} was not found`
    });
  }

  const { reviewer, comment, rating } = req.body;
  if (!reviewer || !comment) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Reviewer name and comment are required fields'
    });
  }

  const newReview = store.createReview({
    bookId: id,
    reviewer,
    comment,
    rating: rating !== undefined ? Number(rating) : 5
  });

  res.status(201).json({
    message: `Review added successfully for book "${book.title}"`,
    data: newReview
  });
});

// GET /api/reviews - Retrieve all reviews
router.get('/reviews', (req, res) => {
  const reviews = store.getReviews();
  res.status(200).json({
    total: reviews.length,
    data: reviews
  });
});

// GET /api/reviews/:id - Retrieve a specific review by ID
router.get('/reviews/:id', (req, res) => {
  const { id } = req.params;
  const review = store.getReviewById(id);

  if (!review) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Review with ID ${id} was not found`
    });
  }

  res.status(200).json({ data: review });
});

// POST /api/reset - Reset the in-memory data store to initial state
router.post('/reset', (req, res) => {
  store.reset();
  res.status(200).json({
    message: 'Data store reset to initial seed values'
  });
});

module.exports = router;
