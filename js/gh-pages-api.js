
// Live In-Browser API & Validation Engine for GitHub Pages
(function() {
  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  // Activate only on GitHub Pages or static hosting environments without Express port
  if (isLocalHost && window.location.port) {
    return;
  }

  console.log('[GitHub Pages] In-browser API & validation simulator active.');

  let books = [
    { id: 1, title: "Clean Code", author: "Robert C. Martin", category: "Technology", price: 38.5, rating: 4.7, inStock: true },
    { id: 2, title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", price: 24.99, rating: 4.8, inStock: true },
    { id: 3, title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", price: 18.0, rating: 4.6, inStock: false },
    { id: 4, title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", category: "History", price: 27.5, rating: 4.9, inStock: true },
    { id: 5, title: "1984", author: "George Orwell", category: "Fiction", price: 14.99, rating: 4.8, inStock: true },
    { id: 6, title: "Cosmos", author: "Carl Sagan", category: "Science", price: 29.0, rating: 4.9, inStock: true },
    { id: 7, title: "The Hobbit", author: "J.R.R. Tolkien", category: "Fiction", price: 21.0, rating: 4.7, inStock: true }
  ];

  let reviews = [
    { id: 1, bookId: 1, reviewer: "Alice Johnson", comment: "Essential principles every developer should master.", rating: 5, date: "2026-01-15" },
    { id: 2, bookId: 1, reviewer: "Bob Smith", comment: "Practical advice that immediately improved my code quality.", rating: 4, date: "2026-02-10" },
    { id: 3, bookId: 2, reviewer: "Charlie Davis", comment: "Brilliant explanation of complex cosmological concepts.", rating: 5, date: "2026-03-01" },
    { id: 4, bookId: 4, reviewer: "Dana White", comment: "A thought-provoking perspective on human evolution.", rating: 5, date: "2026-04-12" },
    { id: 5, bookId: 5, reviewer: "Evan Lee", comment: "Chilling and timeless masterpiece.", rating: 5, date: "2026-05-08" }
  ];

  let nextBookId = 8;
  let nextReviewId = 6;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function(resource, init = {}) {
    const urlStr = typeof resource === 'string' ? resource : resource.url;
    if (!urlStr.includes('/api/')) {
      return originalFetch(resource, init);
    }

    const method = (init.method || 'GET').toUpperCase();
    const headers = init.headers || {};
    const stageId = parseInt(headers['X-Stage-Id'] || headers['x-stage-id'] || '0', 10);

    const parsed = new URL(urlStr, window.location.origin);
    const path = parsed.pathname.substring(parsed.pathname.indexOf('/api/'));
    const query = Object.fromEntries(parsed.searchParams.entries());

    let body = {};
    if (init.body) {
      try { body = JSON.parse(init.body); } catch(e) {}
    }

    function makeResponse(status, data, solved = false) {
      const headersInit = new Headers({
        'Content-Type': 'application/json',
        'X-Stage-Solved': solved ? 'true' : 'false',
        'X-Stage-Id': String(stageId)
      });
      return new Response(JSON.stringify(data), {
        status,
        headers: headersInit
      });
    }

    // Reset store
    if (path === '/api/reset' && method === 'POST') {
      books = [
        { id: 1, title: "Clean Code", author: "Robert C. Martin", category: "Technology", price: 38.5, rating: 4.7, inStock: true },
        { id: 2, title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", price: 24.99, rating: 4.8, inStock: true },
        { id: 3, title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", price: 18.0, rating: 4.6, inStock: false },
        { id: 4, title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", category: "History", price: 27.5, rating: 4.9, inStock: true },
        { id: 5, title: "1984", author: "George Orwell", category: "Fiction", price: 14.99, rating: 4.8, inStock: true },
        { id: 6, title: "Cosmos", author: "Carl Sagan", category: "Science", price: 29.0, rating: 4.9, inStock: true },
        { id: 7, title: "The Hobbit", author: "J.R.R. Tolkien", category: "Fiction", price: 21.0, rating: 4.7, inStock: true }
      ];
      return makeResponse(200, { message: 'נתוני השרת אופסו בהצלחה' }, true);
    }

    // Stage 1: GET /api/books
    if (stageId === 1) {
      if (method === 'GET' && path === '/api/books') {
        return makeResponse(200, {
          total: books.length,
          data: books,
          validation: { stageId: 1, success: true, message: 'מצוין! שלפת בהצלחה את כל רשימת הספרים באמצעות GET /api/books.' }
        }, true);
      }
      return makeResponse(400, { validation: { stageId: 1, success: false, message: 'עבור שלב 1 נדרש GET /api/books.' } });
    }

    // Stage 2: GET /api/books/2
    if (stageId === 2) {
      if (method === 'GET' && path === '/api/books/2') {
        const b = books.find(x => x.id === 2);
        return makeResponse(200, {
          data: b,
          validation: { stageId: 2, success: true, message: 'מעולה! השתמשת בהצלחה ב-Route Parameter לשליפת ספר מזהה 2.' }
        }, true);
      }
      return makeResponse(400, { validation: { stageId: 2, success: false, message: 'עבור שלב 2 נדרש GET /api/books/2.' } });
    }

    // Stage 3: GET /api/books?category=Science
    if (stageId === 3) {
      const cat = (query.category || '').toLowerCase();
      if (method === 'GET' && path === '/api/books' && cat === 'science') {
        const filtered = books.filter(b => b.category.toLowerCase() === 'science');
        return makeResponse(200, {
          total: filtered.length,
          data: filtered,
          validation: { stageId: 3, success: true, message: 'כל הכבוד! הסינון הוחל בהצלחה והוחזרו רק ספרי מדע.' }
        }, true);
      }
      return makeResponse(400, { validation: { stageId: 3, success: false, message: 'נדרש Query Parameter: category=Science.' } });
    }

    // Stage 4: GET /api/books?category=Fiction&sortBy=price&order=asc
    if (stageId === 4) {
      const cat = (query.category || '').toLowerCase();
      const sortBy = (query.sortBy || query.sort || '').toLowerCase();
      if (method === 'GET' && path === '/api/books' && cat === 'fiction' && sortBy === 'price') {
        let list = books.filter(b => b.category.toLowerCase() === 'fiction');
        list.sort((a, b) => a.price - b.price);
        return makeResponse(200, {
          total: list.length,
          data: list,
          validation: { stageId: 4, success: true, message: 'מצוין! שילבת בהצלחה סינון ומיון מרובי פרמטרים המשפיעים על התוצאות בפועל.' }
        }, true);
      }
      return makeResponse(400, { validation: { stageId: 4, success: false, message: 'נדרש שילוב category=Fiction ו-sortBy=price.' } });
    }

    // Stage 5: GET /api/books/999 (404 inspection)
    if (stageId === 5) {
      if (method === 'GET' && (path === '/api/books/999' || path === '/api/books/9999')) {
        return makeResponse(404, {
          error: 'Not Found',
          message: 'Book with ID 999 was not found',
          validation: { stageId: 5, success: true, message: 'מעולה! בחנת בהצלחה תגובת שגיאה אמיתית 404 Not Found מהשרת.' }
        }, true);
      }
      return makeResponse(400, { validation: { stageId: 5, success: false, message: 'עבור שלב 5 יש לפנות למשאב שאינו קיים כגון /api/books/999.' } });
    }

    // Stage 6: POST /api/books
    if (stageId === 6) {
      if (method === 'POST' && path === '/api/books' && body.title && body.author) {
        const created = { id: nextBookId++, title: body.title, author: body.author, category: body.category || 'General', price: Number(body.price) || 20, rating: 5, inStock: true };
        books.push(created);
        return makeResponse(201, {
          message: 'Book created successfully',
          data: created,
          validation: { stageId: 6, success: true, message: 'יפה מאוד! הספר החדש נוצר בהצלחה בזיכרון השרת עם קוד סטטוס 201 Created.' }
        }, true);
      }
      return makeResponse(400, { validation: { stageId: 6, success: false, message: 'נדרש POST /api/books עם שדות title ו-author ב-Body.' } });
    }

    // Stage 7: PATCH /api/books/1
    if (stageId === 7) {
      if ((method === 'PATCH' || method === 'PUT') && path === '/api/books/1') {
        const b = books.find(x => x.id === 1);
        if (body.price !== undefined) b.price = Number(body.price);
        if (body.inStock !== undefined) b.inStock = Boolean(body.inStock);
        return makeResponse(200, {
          message: 'Book updated successfully',
          data: b,
          validation: { stageId: 7, success: true, message: 'מצוין! הפרטים עודכנו בהצלחה בזיכרון השרת באמצעות שילוב של נתיב וגוף בקשה.' }
        }, true);
      }
      return makeResponse(400, { validation: { stageId: 7, success: false, message: 'נדרש PATCH /api/books/1 עם שדות לעדכון.' } });
    }

    // Stage 8: GET /api/books/1/reviews
    if (stageId === 8) {
      if (method === 'GET' && path === '/api/books/1/reviews') {
        const revs = reviews.filter(r => r.bookId === 1);
        return makeResponse(200, {
          bookId: 1,
          total: revs.length,
          data: revs,
          validation: { stageId: 8, success: true, message: 'נפלא! הבנת את עקרון המשאבים המקושרים ב-REST ונשלפו כל ביקורות הספר.' }
        }, true);
      }
      return makeResponse(400, { validation: { stageId: 8, success: false, message: 'נדרש GET /api/books/1/reviews עבור שלב 8.' } });
    }

    // Stage 9: POST /api/books/2/reviews
    if (stageId === 9) {
      if (method === 'POST' && path === '/api/books/2/reviews' && body.reviewer && body.comment) {
        const newRev = { id: nextReviewId++, bookId: 2, reviewer: body.reviewer, comment: body.comment, rating: Number(body.rating) || 5, date: '2026-09-12' };
        reviews.push(newRev);
        return makeResponse(201, {
          message: 'Review added successfully',
          data: newRev,
          validation: { stageId: 9, success: true, message: 'מעולה! הביקורת נוספה בהצלחה לספר בזיכרון השרת עם קוד סטטוס 201.' }
        }, true);
      }
      return makeResponse(400, { validation: { stageId: 9, success: false, message: 'נדרש POST /api/books/2/reviews עם reviewer ו-comment.' } });
    }

    // Stage 10: DELETE /api/books/3
    if (stageId === 10) {
      if (method === 'DELETE' && path === '/api/books/3') {
        const idx = books.findIndex(b => b.id === 3);
        if (idx !== -1) books.splice(idx, 1);
        return makeResponse(200, {
          message: 'Book deleted successfully',
          id: 3,
          validation: { stageId: 10, success: true, message: 'מצוין! הספר נמחק בהצלחה מזיכרון השרת, והשלמת את כל שלבי המשחק בהצלחה!' }
        }, true);
      }
      return makeResponse(400, { validation: { stageId: 10, success: false, message: 'נדרש DELETE /api/books/3 עבור שלב 10.' } });
    }

    return makeResponse(404, { error: 'Not Found', message: 'Endpoint not found on GitHub Pages simulated API' });
  };
})();
