# Mailly A Temp Mail Web Application

A Next.js 14 web application that provides temporary disposable email addresses through the Boomlify Temp Mail API.

## Features

- Create temporary email addresses with configurable expiration (10 minutes, 1 hour, 1 day)
- View and manage multiple temporary inboxes
- Auto-refresh for real-time message updates
- Dark mode support
- Browser notifications for new emails
- Responsive design for mobile and desktop
- Client-side persistence with localStorage

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Boomlify Temp Mail API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Boomlify Temp Mail API key

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy the environment variables template:

```bash
cp .env.local.example .env.local
```

4. Add your Boomlify API key to `.env.local`:

```
BOOMLIFY_API_KEY=your_api_key_here
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                 # Next.js App Router pages
├── components/          # React components
├── lib/                 # Utility functions and API clients
├── types/               # TypeScript type definitions
├── public/              # Static assets
└── .env.local.example   # Environment variables template
```

## Environment Variables

- `BOOMLIFY_API_KEY`: Your Boomlify Temp Mail API key (required)
- `NEXT_PUBLIC_APP_URL`: Application URL (default: http://localhost:3000)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds (default: 60000)
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window (default: 10)

## License

MIT
