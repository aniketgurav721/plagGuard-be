# PlagGuard Backend — REST API

PlagGuard API is an Express-based REST API that detects content similarity against live news articles using AI. It handles user authentication, article fetching, plagiarism detection, and content paraphrasing.

## Tech Stack

| Component | Technology             |
|-----------|------------------------|
| Runtime   | Node.js 18.x – 22.x    |
| Framework | Express 4              |
| Database  | MongoDB 6.x+           |
| ORM       | Mongoose               |
| AI        | OpenAI GPT-4o-mini     |
| News API  | [NewsAPI](https://newsapi.org/) |
| Auth      | JWT (jsonwebtoken)     |

## Requirements

| Tool   | Version              |
|--------|----------------------|
| Node.js| **18.x – 22.x** (LTS recommended) |
| npm    | **9.x or higher**    |
| MongoDB| 6.x or higher (local or Atlas) |

## Project Structure

```
plagiarism-backend/
├── config/
│   ├── db.js           # MongoDB connection setup
│   ├── env.js          # Environment validation
│   └── openai.js       # OpenAI client configuration
├── controllers/
│   ├── authController.js         # Sign up / sign in
│   ├── articleController.js      # News article fetching
│   ├── plagiarismController.js   # Plagiarism detection logic
│   └── paraphraseController.js   # Content paraphrasing
├── middlewares/
│   └── authenticate.js # JWT verification middleware
├── models/
│   └── User.js         # Mongoose user schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── articleRoutes.js     # Article endpoints
│   ├── plagiarismRoutes.js  # Plagiarism endpoints
│   └── paraphraseRoute.js   # Paraphrase endpoints
├── server.js           # Express app entry point
├── package.json
└── .env.example
```

## Getting Started

### 1. Install dependencies

```bash
cd plagGuard-be
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable        | Description                              |
|-----------------|------------------------------------------|
| `PORT`          | API server port (default: `5000`)        |
| `CLIENT_URL`    | Frontend origin for CORS (default: `http://localhost:3000`) |
| `MONGODB_URI`   | MongoDB connection string                |
| `JWT_SECRET`    | Secret for signing JWT tokens            |
| `OPENAI_API_KEY`| OpenAI API key                           |
| `NEWSAPI_KEY`   | NewsAPI key from [newsapi.org](https://newsapi.org/register) |

### 3. Ensure MongoDB is running

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in MONGODB_URI
```

### 4. Start the server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000` by default.

## API Endpoints

| Method | Endpoint                              | Auth     | Description                    |
|--------|---------------------------------------|----------|--------------------------------|
| GET    | `/api/health`                         | No       | Health check                   |
| POST   | `/api/auth/signup`                    | No       | Register a new user            |
| POST   | `/api/auth/signin`                    | No       | Sign in and receive JWT        |
| POST   | `/api/articles/fetch-articles`        | No       | Fetch news articles by topic   |
| POST   | `/api/plagiarism/check-plagiarism-all`| No       | Check text against articles    |
| POST   | `/api/paraphrase/paraphrase-text`     | **Yes**  | Paraphrase flagged content     |

## Scripts

| Script  | Command           | Description              |
|---------|-------------------|--------------------------|
| `start` | `node server.js`  | Run production server    |
| `dev`   | `nodemon server.js`| Run with hot reload     |

## Environment Variables Reference

```env
# Server
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/plagguard

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production

# External APIs
OPENAI_API_KEY=sk-...
NEWSAPI_KEY=your-newsapi-key
```

## CORS Configuration

The backend allows requests from the origin specified in `CLIENT_URL`. For multiple origins, use a comma-separated list:

```env
CLIENT_URL=http://localhost:3000,https://yourdomain.com
```

## Troubleshooting

### Backend exits immediately on start

The server validates all required environment variables at startup. Ensure your `.env` includes every key listed in `.env.example`, especially `NEWSAPI_KEY`.

### CORS errors

Set `CLIENT_URL` to match your frontend URL (default: `http://localhost:3000`).

### MongoDB connection fails

- Ensure MongoDB is running locally, or
- Check your `MONGODB_URI` connection string is valid in `.env`

### OpenAI API errors

- Verify `OPENAI_API_KEY` is valid and has credits
- Check API rate limits

## License

ISC
