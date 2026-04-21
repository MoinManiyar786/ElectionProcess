# Election Process Education Assistant

An interactive, AI-powered web application that helps users understand the U.S. election process, timelines, and steps. Built with TypeScript, Express, and Google Gemini AI.

## Features

- **Interactive Timeline** — Step-by-step walkthrough of the entire election process (8 phases), from voter registration to inauguration, with expandable details and key dates.
- **AI Chat Assistant** — Powered by Google Gemini AI. Ask any question about elections and get accurate, non-partisan answers with session persistence.
- **Knowledge Quiz** — 20+ questions across beginner, intermediate, and advanced difficulties with explanations, scoring, and grading.
- **FAQ Section** — Curated frequently asked questions with instant answers.
- **Election Glossary** — Searchable glossary of key election terms with related term links.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 18+ / TypeScript 5 |
| **Backend** | Express 4 with strict middleware pipeline |
| **AI** | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| **Validation** | Zod schema validation on all inputs |
| **Security** | Helmet, CORS, rate limiting, CSP, DOMPurify |
| **Logging** | Winston (structured JSON in production) |
| **Caching** | In-memory cache with TTL and auto-cleanup |
| **Testing** | Jest, Supertest, ts-jest |
| **Frontend** | Vanilla HTML/CSS/JS (no framework — fast, accessible) |

## Project Structure

```
election/
├── src/
│   ├── config/          # Environment config with Zod validation
│   ├── data/            # Election phases, quiz questions, glossary, FAQs
│   ├── middleware/       # Security (helmet, cors, rate limit), logging, error handling
│   ├── routes/           # API routes (election, chat, quiz)
│   ├── services/         # AI service (Gemini), quiz service
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Cache, logger, sanitization, validation schemas
│   ├── app.ts            # Express app factory
│   └── server.ts         # Server entry point with graceful shutdown
├── public/
│   ├── css/styles.css    # WCAG 2.1 AA compliant styles
│   ├── js/app.js         # Frontend SPA logic
│   └── index.html        # Accessible HTML with ARIA landmarks
├── tests/
│   ├── unit/             # Unit tests for data, services, utils
│   ├── integration/      # API integration tests with Supertest
│   └── accessibility/    # Automated accessibility audits
├── package.json
├── tsconfig.json
├── jest.config.ts
├── .eslintrc.json
├── .prettierrc
├── .env.example
└── README.md
```

## Setup & Installation

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9+ (comes with Node.js)
- **Google AI API Key** (free at [Google AI Studio](https://aistudio.google.com/apikey))

### 1. Clone and install

```bash
cd election
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your Google AI API key:

```env
GOOGLE_AI_API_KEY=your_actual_api_key_here
PORT=3000
NODE_ENV=development
```

### 3. Build the project

```bash
npm run build
```

### 4. Start the server

```bash
# Production
npm start

# Development (with ts-node, no build needed)
npm run dev
```

Open **http://localhost:3000** in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the compiled server |
| `npm run dev` | Run in development mode (ts-node) |
| `npm test` | Run all tests with coverage |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run test:accessibility` | Run accessibility tests only |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Type-check without emitting |
| `npm run clean` | Remove build artifacts |

## API Documentation

### Health Check

```
GET /api/health
```

### Election Data

```
GET /api/election/phases          # All election phases (ordered)
GET /api/election/phases/:id      # Single phase by ID
GET /api/election/faqs            # All FAQs (?q=search&category=filter)
GET /api/election/glossary        # All glossary terms (?q=search)
GET /api/election/glossary/:term  # Single glossary term
```

### AI Chat

```
POST /api/chat/session            # Create new chat session
POST /api/chat/message            # Send message (body: { message, sessionId? })
GET  /api/chat/session/:sessionId # Get session history
```

### Quiz

```
POST /api/quiz/start              # Start quiz (body: { difficulty?, category?, count? })
POST /api/quiz/submit/:sessionId  # Submit answer (body: { questionId, selectedIndex, timeTaken })
GET  /api/quiz/results/:sessionId # Get quiz results
GET  /api/quiz/session/:sessionId # Get session status
GET  /api/quiz/categories         # Available categories and difficulties
```

All responses follow the format:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": 1234567890
}
```

## Security Measures

- **Helmet** — Sets secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- **CORS** — Configurable cross-origin resource sharing
- **Rate Limiting** — Global (100 req/15min) and API-specific (30 req/min for chat)
- **Input Sanitization** — DOMPurify strips XSS from all user inputs
- **Zod Validation** — Schema-based validation on every API input
- **Content Security Policy** — Restrictive CSP prevents script injection
- **JSON Body Limit** — 10kb max request body size
- **Graceful Shutdown** — SIGTERM/SIGINT handlers for clean server termination
- **Error Sanitization** — Stack traces hidden in production responses

## Accessibility (WCAG 2.1 AA)

- Skip-to-content link
- Semantic HTML landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`)
- ARIA roles, labels, and live regions throughout
- `aria-expanded`, `aria-pressed`, `aria-controls` on all interactive elements
- Keyboard navigation (Tab, Enter, Space, Escape, Ctrl+1-5 shortcuts)
- Screen reader announcements via live region
- Focus-visible styles with 3px outline
- `prefers-reduced-motion` support
- `prefers-color-scheme: dark` support
- `forced-colors` (Windows High Contrast) support
- Print stylesheet
- Minimum contrast ratios meeting AA standards
- Form labels and `aria-describedby` hints

## Testing

The project includes 100+ test cases across three categories:

### Unit Tests

- Election phases data integrity
- Quiz questions validation
- Glossary and FAQ data
- Cache operations and TTL
- Input validation schemas
- Sanitization (XSS prevention)
- Quiz service business logic

### Integration Tests

- All API endpoints
- Request validation and error responses
- Security header presence
- Quiz workflow (start → answer → results)
- 404 handling

### Accessibility Tests

- HTML document structure
- ARIA landmarks and attributes
- Form labels and descriptions
- Screen reader support
- CSS accessibility features (focus, reduced motion, dark mode, high contrast)

Run all tests:

```bash
npm test
```

## Google Services Integration

This project uses **Google Gemini AI** (`@google/generative-ai`) for the interactive chat assistant:

- **Model**: Gemini 2.0 Flash — optimized for speed and quality
- **Safety filters**: Medium threshold on all harm categories
- **System prompt**: Non-partisan election education focus
- **Session management**: Multi-turn conversations with history
- **Response caching**: Identical first-message queries are cached
- **Rate limiting**: Dedicated rate limiter for AI endpoints

### Getting an API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy the key to your `.env` file

## License

MIT
