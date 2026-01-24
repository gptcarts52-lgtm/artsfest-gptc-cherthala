# ArtsFest GPTC Cherthala

A Next.js 14 application for the Arts Festival at GPTC Cherthala.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # App Router pages and layouts
│   ├── api/            # API routes
│   ├── (auth)/         # Route groups
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # Reusable components
│   └── ui/            # UI components
├── lib/               # Utility functions
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

Copy `.env.local` and configure your environment variables.