// Schema definitions for resources in the system
const resourceSchemas = [
  {
    name: 'Book',
    endpoint: '/api/books',
    description: 'Represents a book in the library catalog',
    fields: [
      { name: 'id', type: 'Number', required: false, description: 'Auto-generated unique primary key' },
      { name: 'title', type: 'String', required: true, description: 'Title of the book' },
      { name: 'author', type: 'String', required: true, description: 'Author of the book' },
      { name: 'category', type: 'String', required: true, description: 'Genre category (e.g. Science, Fiction, History)' },
      { name: 'price', type: 'Number', required: true, description: 'Price in USD' },
      { name: 'rating', type: 'Number', required: false, description: 'Rating score between 1.0 and 5.0' },
      { name: 'inStock', type: 'Boolean', required: false, description: 'Inventory availability status' }
    ]
  },
  {
    name: 'Review',
    endpoint: '/api/reviews',
    nestedEndpoint: '/api/books/:id/reviews',
    description: 'Represents a reader review linked to a specific book',
    fields: [
      { name: 'id', type: 'Number', required: false, description: 'Auto-generated unique review ID' },
      { name: 'bookId', type: 'Number', required: true, description: 'Foreign key referencing associated Book.id' },
      { name: 'reviewer', type: 'String', required: true, description: 'Name of the reviewer' },
      { name: 'comment', type: 'String', required: true, description: 'Review commentary text' },
      { name: 'rating', type: 'Number', required: true, description: 'Score integer from 1 to 5' },
      { name: 'date', type: 'String', required: false, description: 'Publication date in YYYY-MM-DD format' }
    ]
  }
];

module.exports = resourceSchemas;
