// Server-side stage definitions and solution validation criteria
// NOTE: Solution criteria are strictly kept on the server and not exposed to the client.

const stageDefinitions = [
  {
    id: 1,
    title: 'הצגת קטלוג הספרים המלא',
    titleEn: 'Fetch Complete Books Catalog',
    description: 'המערכת מעוניינת להציג את רשימת כל הספרים הקיימים בקטלוג הספרייה. הרכב ושלח בקשת GET לנתיב אוסף הספרים המתאים לפי עקרונות REST.',
    descriptionEn: 'The system needs to retrieve the full catalog of books. Send an HTTP GET request to the books collection endpoint.',
    concepts: ['HTTP GET', 'Collection Endpoint', '200 OK'],
    validate(req) {
      if (req.method !== 'GET') {
        return { valid: false, message: `שיטת הבקשה שגויה: התקבלה ${req.method}, נדרשת שיטת GET.` };
      }
      const cleanPath = req.path.replace(/\/+$/, '');
      if (cleanPath !== '/api/books' && cleanPath !== '/books') {
        return { valid: false, message: `נתיב שגוי: התקבל ${req.path}, נדרש נתיב האוסף /api/books.` };
      }
      return { valid: true, message: 'מצוין! שלפת בהצלחה את כל רשימת הספרים באמצעות GET /api/books.' };
    }
  },
  {
    id: 2,
    title: 'שליפת פריט בודד לפי מזהה',
    titleEn: 'Fetch Single Item via Route Parameter',
    description: 'לקוח בחר לצפות בפרטי הספר בעל מזהה 2 ("A Brief History of Time"). השתמש ב-Route Parameter כדי לשלוף פריט זה.',
    descriptionEn: 'A user clicked on book ID 2. Use a route parameter to fetch this specific resource.',
    concepts: ['Route Parameters', 'Single Resource', '200 OK'],
    validate(req) {
      if (req.method !== 'GET') {
        return { valid: false, message: `שיטת הבקשה שגויה: נדרשת שיטת GET.` };
      }
      const cleanPath = req.path.replace(/\/+$/, '');
      if (cleanPath !== '/api/books/2' && cleanPath !== '/books/2') {
        return { valid: false, message: `נתיב שגוי: התקבל ${req.path}. על הנתיב להכיל Route Parameter עם מזהה הספר: /api/books/2.` };
      }
      return { valid: true, message: 'מעולה! השתמשת בהצלחה ב-Route Parameter לשליפת ספר מזהה 2.' };
    }
  },
  {
    id: 3,
    title: 'סינון תוצאות באמצעות Query Parameter',
    titleEn: 'Filter Resources with Query Parameter',
    description: 'המשתמש מעוניין לצפות אך ורק בספרים מקטגוריית "Science". השתמש ב-Query Parameter מתאים לסינון התוצאות בצד השרת.',
    descriptionEn: 'Filter the catalog to retrieve only books where category is Science using a query parameter.',
    concepts: ['Query Parameters', 'Server-side Filtering', '200 OK'],
    validate(req) {
      if (req.method !== 'GET') {
        return { valid: false, message: `שיטת הבקשה שגויה: נדרשת שיטת GET.` };
      }
      const cleanPath = req.path.replace(/\/+$/, '');
      if (cleanPath !== '/api/books' && cleanPath !== '/books') {
        return { valid: false, message: `נתיב שגוי: סינון אוסף נעשה בנתיב /api/books בשילוב פרמטרים.` };
      }
      const cat = req.query.category || req.query.Category;
      if (!cat || cat.toLowerCase() !== 'science') {
        return { valid: false, message: 'חסר או שגוי Query Parameter: נדרש פרמטר category=Science.' };
      }
      return { valid: true, message: 'כל הכבוד! הסינון הוחל בהצלחה והוחזרו רק ספרי מדע.' };
    }
  },
  {
    id: 4,
    title: 'שילוב מספר Query Parameters (סינון ומיון)',
    titleEn: 'Multi-Query Parameters: Filtering & Sorting',
    description: 'מנהל החנות מבקש להציג ספרים מקטגוריית "Fiction", כשהם ממוינים לפי מחיר ("price") בסדר עולה ("asc"). שלב שני Query Parameters באותה בקשה.',
    descriptionEn: 'Combine multiple query parameters to filter category=Fiction and sort by price ascending.',
    concepts: ['Multiple Query Parameters', 'Filtering & Sorting', 'Combined Concept'],
    validate(req) {
      if (req.method !== 'GET') {
        return { valid: false, message: `שיטת הבקשה שגויה: נדרשת שיטת GET.` };
      }
      const cleanPath = req.path.replace(/\/+$/, '');
      if (cleanPath !== '/api/books' && cleanPath !== '/books') {
        return { valid: false, message: `נתיב שגוי: יש לפנות ל-/api/books עם פרמטרי השאילתה.` };
      }
      const cat = req.query.category;
      const sortBy = req.query.sortBy || req.query.sort;
      if (!cat || cat.toLowerCase() !== 'fiction') {
        return { valid: false, message: 'חסר Query Parameter לסינון הקטגוריה: category=Fiction.' };
      }
      if (!sortBy || sortBy.toLowerCase() !== 'price') {
        return { valid: false, message: 'חסר Query Parameter למיון לפי מחיר: sortBy=price.' };
      }
      return { valid: true, message: 'מצוין! שילבת בהצלחה סינון ומיון מרובי פרמטרים המשפיעים על התוצאות בפועל.' };
    }
  },
  {
    id: 5,
    title: 'טיפול בשגיאות ובחינת קוד סטטוס 404',
    titleEn: 'Error Handling: 404 Not Found Inspection',
    description: 'משתמש מנסה לפתוח ספר בעל מזהה 999 שאינו קיים במערכת. שלח בקשת GET לנתיב זה, ובחן את קוד הסטטוס (404 Not Found) ומבנה תשובת השגיאה ב-JSON.',
    descriptionEn: 'Request non-existent book ID 999 to observe and inspect the 404 Not Found error response.',
    concepts: ['HTTP 404 Not Found', 'Error Payloads', 'Client Error Handling'],
    validate(req) {
      if (req.method !== 'GET') {
        return { valid: false, message: `שיטת הבקשה שגויה: נדרשת שיטת GET.` };
      }
      const cleanPath = req.path.replace(/\/+$/, '');
      if (cleanPath !== '/api/books/999' && cleanPath !== '/books/999') {
        return { valid: false, message: `נתיב שגוי: עבור שלב זה יש לפנות למשאב שאינו קיים, למשל /api/books/999.` };
      }
      return { valid: true, message: 'מעולה! בחנת בהצלחה תגובת שגיאה אמיתית 404 Not Found מהשרת.' };
    }
  },
  {
    id: 6,
    title: 'יצירת משאב חדש באמצעות POST ו-Body',
    titleEn: 'Create Resource with POST & Request Body',
    description: 'הוסף ספר חדש לקטלוג הספרייה. שלח בקשת POST לנתיב האוסף /api/books יחד עם Request Body ב-JSON הכולל: title, author, category, price.',
    descriptionEn: 'Create a new book using POST /api/books with a JSON body containing title, author, category, and price.',
    concepts: ['HTTP POST', 'Request Body (JSON)', '201 Created', 'State Mutation'],
    validate(req) {
      if (req.method !== 'POST') {
        return { valid: false, message: `שיטת הבקשה שגויה: ליצירת משאב נדרשת שיטת POST.` };
      }
      const cleanPath = req.path.replace(/\/+$/, '');
      if (cleanPath !== '/api/books' && cleanPath !== '/books') {
        return { valid: false, message: `נתיב שגוי: יצירת פריט נעשית מול אוסף הספרים /api/books.` };
      }
      const body = req.body || {};
      if (!body.title || !body.author) {
        return { valid: false, message: 'גוף הבקשה (Body) חייב לכלול לפחות title ו-author.' };
      }
      if (body.price === undefined) {
        return { valid: false, message: 'גוף הבקשה (Body) צריך לכלול גם שדה price מספרי.' };
      }
      return { valid: true, message: 'יפה מאוד! הספר החדש נוצר בהצלחה בזיכרון השרת עם קוד סטטוס 201 Created.' };
    }
  },
  {
    id: 7,
    title: 'עדכון משאב קיים (PATCH/PUT + Route Param + Body)',
    titleEn: 'Update Resource with Route Param & Body',
    description: 'מחירו של ספר מספר 1 עודכן ל-29.99 והמלאי אזל (inStock: false). שלח בקשת PATCH לנתיב הספר הספציפי עם Body מתאים לעדכון השדות.',
    descriptionEn: 'Update book #1 price to 29.99 and inStock to false using PATCH with route param and body.',
    concepts: ['HTTP PATCH / PUT', 'Route Parameter + Body', 'Combined Concept', '200 OK'],
    validate(req) {
      if (req.method !== 'PATCH' && req.method !== 'PUT') {
        return { valid: false, message: `שיטת הבקשה שגויה: לעדכון משאב יש להשתמש ב-PATCH או ב-PUT.` };
      }
      const cleanPath = req.path.replace(/\/+$/, '');
      if (cleanPath !== '/api/books/1' && cleanPath !== '/books/1') {
        return { valid: false, message: `נתיב שגוי: עדכון ספר 1 מתבצע בנתיב /api/books/1.` };
      }
      const body = req.body || {};
      if (body.price === undefined && body.inStock === undefined) {
        return { valid: false, message: 'גוף הבקשה צריך לכלול שדה price לעדכון ו/או inStock.' };
      }
      return { valid: true, message: 'מצוין! הפרטים עודכנו בהצלחה בזיכרון השרת באמצעות שילוב של נתיב וגוף בקשה.' };
    }
  },
  {
    id: 8,
    title: 'שליפת משאב מקושר (Nested Relational Route)',
    titleEn: 'Fetch Relational Reviews via Nested Route',
    description: 'קרא את כל הביקורות השייכות לספר מספר 1. עליך להשתמש בנתיב מקונן המבטא את הקשר ההיררכי בין ספר לביקורות שלו.',
    descriptionEn: 'Fetch all reviews for book 1 using a RESTful nested endpoint /api/books/1/reviews.',
    concepts: ['Nested Routes', 'Resource Relations', '200 OK'],
    validate(req) {
      if (req.method !== 'GET') {
        return { valid: false, message: `שיטת הבקשה שגויה: נדרשת שיטת GET.` };
      }
      const cleanPath = req.path.replace(/\/+$/, '');
      if (cleanPath !== '/api/books/1/reviews' && cleanPath !== '/books/1/reviews') {
        return { valid: false, message: `נתיב שגוי: שליפת ביקורות מקושרות לספר 1 מתבצעת בנתיב /api/books/1/reviews.` };
      }
      return { valid: true, message: 'נפלא! הבנת את עקרון המשאבים המקושרים ב-REST ונשלפו כל ביקורות הספר.' };
    }
  },
  {
    id: 9,
    title: 'הוספת ביקורת למשאב מקושר (Nested Route + POST + Body)',
    titleEn: 'Create Nested Review via POST and Body',
    description: 'משתמשת בשם "Alice" מעוניינת להוסיף ביקורת חדשה עבור ספר מספר 2 עם דירוג 5. שלח בקשת POST לנתיב הביקורות המקונן של ספר 2 יחד עם Body מתאים.',
    descriptionEn: 'Post a new review for book 2 with reviewer, comment, and rating in body to /api/books/2/reviews.',
    concepts: ['POST Nested Route', 'Relational Creation', 'Combined Concept', '201 Created'],
    validate(req) {
      if (req.method !== 'POST') {
        return { valid: false, message: `שיטת הבקשה שגויה: ליצירת ביקורת נדרשת שיטת POST.` };
      }
      const cleanPath = req.path.replace(/\/+$/, '');
      if (cleanPath !== '/api/books/2/reviews' && cleanPath !== '/books/2/reviews') {
        return { valid: false, message: `נתיב שגוי: הוספת ביקורת לספר 2 מתבצעת בנתיב /api/books/2/reviews.` };
      }
      const body = req.body || {};
      if (!body.reviewer || !body.comment) {
        return { valid: false, message: 'גוף הבקשה חייב לכלול שדות reviewer ו-comment.' };
      }
      return { valid: true, message: 'מעולה! הביקורת נוספה בהצלחה לספר בזיכרון השרת עם קוד סטטוס 201.' };
    }
  },
  {
    id: 10,
    title: 'מחיקת משאב (DELETE עם Route Parameter)',
    titleEn: 'Delete Resource with DELETE & Route Param',
    description: 'ספר מספר 3 הוסר מרשימת הספרייה לצמיתות. שלח בקשת DELETE עם מזהה הספר ב-Route Parameter כדי למחוק אותו מהשרת.',
    descriptionEn: 'Delete book #3 using HTTP DELETE /api/books/3 and verify item removal.',
    concepts: ['HTTP DELETE', 'Route Parameter', 'State Mutation', '200 OK'],
    validate(req) {
      if (req.method !== 'DELETE') {
        return { valid: false, message: `שיטת הבקשה שגויה: למחיקת משאב נדרשת שיטת DELETE.` };
      }
      const cleanPath = req.path.replace(/\/+$/, '');
      if (cleanPath !== '/api/books/3' && cleanPath !== '/books/3') {
        return { valid: false, message: `נתיב שגוי: למחיקת ספר 3 יש לפנות ב-DELETE ל-/api/books/3.` };
      }
      return { valid: true, message: 'מצוין! הספר נמחק בהצלחה מזיכרון השרת, והשלמת את כל שלבי המשחק בהצלחה!' };
    }
  }
];

// Helper to retrieve public safe view of stages for the frontend
function getPublicStages() {
  return stageDefinitions.map(s => ({
    id: s.id,
    title: s.title,
    titleEn: s.titleEn,
    description: s.description,
    descriptionEn: s.descriptionEn,
    concepts: s.concepts
  }));
}

module.exports = {
  stageDefinitions,
  getPublicStages
};
