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
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run migrations (dev)
- `npm run prisma:seed` - Seed the database
- `npm run db:setup` - Run migrations and seed

## Deployment

### Vercel + Supabase

1. Create a PostgreSQL database on **Supabase**.
2. Get the connection string and set `DATABASE_URL` in Vercel environment variables.
3. Set `JWT_SECRET` for authentication.
4. Vercel will automatically run `prisma generate` via the `postinstall` script.
5. To push the schema to production:
   ```bash
   npx prisma db push
   ```
6. To seed the database:
   ```bash
   npx tsx prisma/seed.ts
   ```

## Environment Variables

Copy `.env.example` and configure your environment variables.