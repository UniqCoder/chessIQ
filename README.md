# ChessIQ

A premium, dark-luxury, pass-and-play local chess web application. 
Powered by a custom-built, STL-free C++ chess engine backend and a Next.js frontend with Supabase.

## Architecture
- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion.
- **Backend**: C++ (Compiled to a standalone executable `chessiq_engine.exe`).
- **Bridge**: Next.js API Routes (`/api/chess/route.ts`) spawn the C++ binary via standard input/output (JSON streaming).
- **Database**: Supabase PostgreSQL.

## Prerequisites
- Node.js (v18+)
- C++17 Compiler (g++ or MSVC)
- Supabase Free Tier Account

## Setup Instructions

### 1. Database Setup (Supabase)
1. Create a new Supabase project.
2. Go to the SQL Editor and execute the schema found in `supabase_schema.sql`.
3. Go to Project Settings -> API and copy your URL and Anon Key.
4. In the `frontend` folder, create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Build the C++ Backend
The backend engine must be compiled first because the Next.js API route looks for the executable.

**Using g++ (MinGW on Windows):**
```bash
cd backend
g++ -std=c++17 -Iinclude -o chessiq_engine.exe src/main.cpp src/game.cpp src/board.cpp
```

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Play
1. Open `http://localhost:3000`.
2. Sign up / Sign in.
3. Click "Start Local Match".
4. Pass the device between turns!

## Technical Notes
- The C++ backend strictly avoids STL containers (`<vector>`, `<map>`, etc.) for core game logic, relying on custom stack arrays and manual memory tracking where applicable.
- The UI is designed with a premium graphite/gold palette.
- No AI/Bots are included; this is strictly a local human-vs-human experience.
