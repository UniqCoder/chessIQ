-- Supabase Schema for ChessIQ

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Matches Table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID REFERENCES auth.users(id) NOT NULL,
  current_turn TEXT DEFAULT 'white',
  board_state TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress',
  winner_side TEXT,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Match Moves Table
CREATE TABLE match_moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  move_number INT NOT NULL,
  played_side TEXT NOT NULL,
  from_square TEXT NOT NULL,
  to_square TEXT NOT NULL,
  piece TEXT NOT NULL,
  captured_piece TEXT,
  promotion_piece TEXT,
  notation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_moves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own matches" 
ON matches FOR ALL 
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can manage their own match moves" 
ON match_moves FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM matches WHERE id = match_moves.match_id AND owner_user_id = auth.uid()
  )
);
