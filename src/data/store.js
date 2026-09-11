// In-memory data store for Books and Reviews
const initialData = require('./initialData.json');

// Deep clone initial data to isolate server runtime state
let books = JSON.parse(JSON.stringify(initialData.books));
let reviews = JSON.parse(JSON.stringify(initialData.reviews));

// Next auto-increment ID trackers
let nextBookId = Math.max(...books.map(b => b.id), 0) + 1;
let nextReviewId = Math.max(...reviews.map(r => r.id), 0) + 1;

const store = {
  // Query books with optional category filtering and property sorting
  getBooks(filters = {}) {
    let result = [...books];

    if (filters.category) {
      const cat = String(filters.category).toLowerCase();
      result = result.filter(b => b.category.toLowerCase() === cat);
    }

    if (filters.sortBy) {
      const field = filters.sortBy;
      const order = (filters.order || 'asc').toLowerCase() === 'desc' ? -1 : 1;
      result.sort((a, b) => {
        if (a[field] < b[field]) return -1 * order;
        if (a[field] > b[field]) return 1 * order;
        return 0;
      });
    }

    return result;
  },

  // Find book by ID
  getBookById(id) {
    const numId = Number(id);
    return books.find(b => b.id === numId) || null;
  },

  // Create a new book entry
  createBook(data) {
    const newBook = {
      id: nextBookId++,
      title: String(data.title || '').trim(),
      author: String(data.author || '').trim(),
      category: String(data.category || 'General').trim(),
      price: Number(data.price) || 0,
      rating: Number(data.rating) || 0,
      inStock: data.inStock !== undefined ? Boolean(data.inStock) : true
    };
    books.push(newBook);
    return newBook;
  },

  // Update existing book fields (PATCH / PUT)
  updateBook(id, data) {
    const book = this.getBookById(id);
    if (!book) return null;

    if (data.title !== undefined) book.title = String(data.title).trim();
    if (data.author !== undefined) book.author = String(data.author).trim();
    if (data.category !== undefined) book.category = String(data.category).trim();
    if (data.price !== undefined) book.price = Number(data.price);
    if (data.rating !== undefined) book.rating = Number(data.rating);
    if (data.inStock !== undefined) book.inStock = Boolean(data.inStock);

    return book;
  },

  // Remove a book by ID and cascade delete its reviews
  deleteBook(id) {
    const numId = Number(id);
    const index = books.findIndex(b => b.id === numId);
    if (index === -1) return false;

    const removed = books.splice(index, 1)[0];
    // Cascade delete reviews for this book
    reviews = reviews.filter(r => r.bookId !== numId);
    return removed;
  },

  // Get reviews, optionally filtered by bookId
  getReviews(filters = {}) {
    let result = [...reviews];
    if (filters.bookId !== undefined) {
      const bId = Number(filters.bookId);
      result = result.filter(r => r.bookId === bId);
    }
    return result;
  },

  // Get a single review by ID
  getReviewById(id) {
    const numId = Number(id);
    return reviews.find(r => r.id === numId) || null;
  },

  // Create a new review for a book
  createReview(data) {
    const newReview = {
      id: nextReviewId++,
      bookId: Number(data.bookId),
      reviewer: String(data.reviewer || '').trim(),
      comment: String(data.comment || '').trim(),
      rating: Number(data.rating) || 5,
      date: data.date || new Date().toISOString().split('T')[0]
    };
    reviews.push(newReview);
    return newReview;
  },

  // Reset in-memory database to initial state
  reset() {
    books = JSON.parse(JSON.stringify(initialData.books));
    reviews = JSON.parse(JSON.stringify(initialData.reviews));
    nextBookId = Math.max(...books.map(b => b.id), 0) + 1;
    nextReviewId = Math.max(...reviews.map(r => r.id), 0) + 1;
  }
};

module.exports = store;
