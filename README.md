# HTTP & REST Educational Game - Assignment 3

**Course:** Web Application Development  
**Submitters:** 
- Ori (oris7003)
- Yoav (yoav7000)  
**GitHub Pages:** https://oris7003.github.io/AppDevEx3/

---

An interactive educational web game built to practice and demonstrate client-server communication, HTTP methods, and RESTful API architecture.

## Installation & Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### Setup
1. Clone the repository and install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```
*(Or run in development mode with `npm run dev`)*

3. Open in browser:
- Main game: [http://localhost:3000](http://localhost:3000)
- Resource schemas: [http://localhost:3000/schemas](http://localhost:3000/schemas)

### Running Tests
To run the automated test suite covering all 10 stages and API endpoints:
```bash
npm test
```

## Key Features
- **Real REST API:** Built with Express.js supporting full CRUD operations on books and nested reviews (`GET`, `POST`, `PATCH`, `DELETE`).
- **Server-Side Validation:** Stage solutions are validated strictly on the server (`src/validation/stageValidator.js`) via the `X-Stage-Id` header; client code contains no answers.
- **10 Interactive Stages:** Covers collection fetching, route params, query filtering & sorting, 404 inspection, JSON body creation, partial updates, and nested relations.
- **Server-Side Rendering (SSR):** Rendered using EJS templates for both the main dashboard and resource schemas (`/schemas`).
- **In-Memory Store:** Complete in-memory store with support for instant state reset (`/api/reset`).

## Project Structure
- `server.js` - Express server setup and routing entry point
- `src/routes/` - REST API routes (`/api`) and view routes (`/`, `/schemas`)
- `src/data/` - In-memory data store and initial JSON dataset
- `src/validation/` - Server-side stage definitions and validation middleware
- `views/` - EJS templates and layout partials
- `public/` - Static assets (CSS styling and Vanilla JS client app)
- `test/` - Automated test suite for all stages
