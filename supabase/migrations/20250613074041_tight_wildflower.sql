/*
  # Create Kanban Board Tables

  1. New Tables
    - `boards`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, nullable)
      - `user_id` (uuid, not null, references auth.users)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    - `lists`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `position` (integer, not null, default 0)
      - `board_id` (uuid, not null, references boards)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    - `cards`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, nullable)
      - `position` (integer, not null, default 0)
      - `due_date` (timestamptz, nullable)
      - `list_id` (uuid, not null, references lists)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own boards and related data
*/

-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lists table
CREATE TABLE IF NOT EXISTS lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  position integer NOT NULL DEFAULT 0,
  due_date timestamptz,
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Create policies for boards
CREATE POLICY "Users can view their own boards"
  ON boards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boards"
  ON boards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards"
  ON boards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards"
  ON boards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for lists
CREATE POLICY "Users can view lists in their boards"
  ON lists
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = lists.board_id
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create lists in their boards"
  ON lists
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = lists.board_id
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update lists in their boards"
  ON lists
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = lists.board_id
      AND boards.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = lists.board_id
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete lists in their boards"
  ON lists
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = lists.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Create policies for cards
CREATE POLICY "Users can view cards in their boards"
  ON cards
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cards in their boards"
  ON cards
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards in their boards"
  ON cards
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
      AND boards.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards in their boards"
  ON cards
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
      AND boards.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_board_id ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_lists_position ON lists(position);
CREATE INDEX IF NOT EXISTS idx_cards_list_id ON cards(list_id);
CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(position);