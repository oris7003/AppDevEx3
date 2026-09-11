// Comprehensive automated test runner for all 10 stages and REST endpoints
const app = require('../server');

async function runTests() {
  console.log('--- Starting Educational Game API & Validation Tests ---');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // Stage 1: GET /api/books
    {
      const res = await fetch(`${baseUrl}/api/books`, {
        headers: { 'X-Stage-Id': '1' }
      });
      const data = await res.json();
      assert(res.status === 200, 'Stage 1 HTTP status is 200 OK');
      assert(data.validation && data.validation.success === true, 'Stage 1 validation succeeds');
      assert(Array.isArray(data.data) && data.data.length > 0, 'Stage 1 returns books list');
    }

    // Stage 1 - Failure case: Wrong method POST
    {
      const res = await fetch(`${baseUrl}/api/books`, {
        method: 'POST',
        headers: { 'X-Stage-Id': '1' },
        body: JSON.stringify({ title: 'Test' })
      });
      const data = await res.json();
      assert(data.validation && data.validation.success === false, 'Stage 1 rejects incorrect method (POST instead of GET)');
    }

    // Stage 2: GET /api/books/2 (Route Parameter)
    {
      const res = await fetch(`${baseUrl}/api/books/2`, {
        headers: { 'X-Stage-Id': '2' }
      });
      const data = await res.json();
      assert(res.status === 200, 'Stage 2 HTTP status is 200 OK');
      assert(data.validation && data.validation.success === true, 'Stage 2 validation succeeds');
      assert(data.data.id === 2, 'Stage 2 returns book with ID 2');
    }

    // Stage 3: GET /api/books?category=Science (Query Parameter)
    {
      const res = await fetch(`${baseUrl}/api/books?category=Science`, {
        headers: { 'X-Stage-Id': '3' }
      });
      const data = await res.json();
      assert(res.status === 200, 'Stage 3 HTTP status is 200 OK');
      assert(data.validation && data.validation.success === true, 'Stage 3 validation succeeds');
      assert(data.data.every(b => b.category.toLowerCase() === 'science'), 'Stage 3 actually filters by category');
    }

    // Stage 4: GET /api/books?category=Fiction&sortBy=price&order=asc (Multi-query parameters)
    {
      const res = await fetch(`${baseUrl}/api/books?category=Fiction&sortBy=price&order=asc`, {
        headers: { 'X-Stage-Id': '4' }
      });
      const data = await res.json();
      assert(res.status === 200, 'Stage 4 HTTP status is 200 OK');
      assert(data.validation && data.validation.success === true, 'Stage 4 validation succeeds');
      assert(data.data.length >= 2, 'Stage 4 returns multiple fiction books');
      assert(data.data[0].price <= data.data[1].price, 'Stage 4 confirms sorting by price ascending');
    }

    // Stage 5: GET /api/books/999 (Error Handling & 404 inspection)
    {
      const res = await fetch(`${baseUrl}/api/books/999`, {
        headers: { 'X-Stage-Id': '5' }
      });
      const data = await res.json();
      assert(res.status === 404, 'Stage 5 HTTP status is genuinely 404 Not Found');
      assert(data.validation && data.validation.success === true, 'Stage 5 validation succeeds when observing 404');
    }

    // Stage 6: POST /api/books (Create Resource with Body)
    {
      const newBook = {
        title: 'The Pragmatic Programmer',
        author: 'Andy Hunt',
        category: 'Technology',
        price: 45
      };
      const res = await fetch(`${baseUrl}/api/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Stage-Id': '6'
        },
        body: JSON.stringify(newBook)
      });
      const data = await res.json();
      assert(res.status === 201, 'Stage 6 HTTP status is 201 Created');
      assert(data.validation && data.validation.success === true, 'Stage 6 validation succeeds');
      assert(data.data.title === newBook.title, 'Stage 6 confirms book created with title');
    }

    // Stage 7: PATCH /api/books/1 (Route Param + Body)
    {
      const updateData = { price: 29.99, inStock: false };
      const res = await fetch(`${baseUrl}/api/books/1`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Stage-Id': '7'
        },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      assert(res.status === 200, 'Stage 7 HTTP status is 200 OK');
      assert(data.validation && data.validation.success === true, 'Stage 7 validation succeeds');
      assert(data.data.price === 29.99 && data.data.inStock === false, 'Stage 7 verifies in-memory state updated');
    }

    // Stage 8: GET /api/books/1/reviews (Relational Nested Route)
    {
      const res = await fetch(`${baseUrl}/api/books/1/reviews`, {
        headers: { 'X-Stage-Id': '8' }
      });
      const data = await res.json();
      assert(res.status === 200, 'Stage 8 HTTP status is 200 OK');
      assert(data.validation && data.validation.success === true, 'Stage 8 validation succeeds');
      assert(Array.isArray(data.data) && data.data.length > 0, 'Stage 8 returns reviews for book 1');
    }

    // Stage 9: POST /api/books/2/reviews (Relational Nested Route + Body)
    {
      const reviewData = {
        reviewer: 'Alice',
        comment: 'Mind-expanding cosmological perspective!',
        rating: 5
      };
      const res = await fetch(`${baseUrl}/api/books/2/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Stage-Id': '9'
        },
        body: JSON.stringify(reviewData)
      });
      const data = await res.json();
      assert(res.status === 201, 'Stage 9 HTTP status is 201 Created');
      assert(data.validation && data.validation.success === true, 'Stage 9 validation succeeds');
      assert(data.data.reviewer === 'Alice', 'Stage 9 confirms review created for book 2');
    }

    // Stage 10: DELETE /api/books/3 (Route Parameter + DELETE)
    {
      const res = await fetch(`${baseUrl}/api/books/3`, {
        method: 'DELETE',
        headers: { 'X-Stage-Id': '10' }
      });
      const data = await res.json();
      assert(res.status === 200, 'Stage 10 HTTP status is 200 OK');
      assert(data.validation && data.validation.success === true, 'Stage 10 validation succeeds');

      // Verify deletion in subsequent GET request
      const verifyRes = await fetch(`${baseUrl}/api/books/3`);
      assert(verifyRes.status === 404, 'Stage 10 verifies book 3 is no longer in memory');
    }

    console.log(`\nTest Results: ${passed} passed, ${failed} failed.`);
    server.close();

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution exception:', err);
    server.close();
    process.exit(1);
  }
}

runTests();
