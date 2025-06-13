/*
  # Create Kanban Application Schema

  1. New Tables
    - `boards`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `lists`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `position` (integer, default 0)
      - `board_id` (uuid, foreign key to boards)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `cards`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `position` (integer, default 0)
      - `due_date` (timestamp, optional)
      - `list_id` (uuid, foreign key to lists)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Cascade deletes for data integrity

  3. Performance
    - Add indexes on foreign keys and position columns
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own boards" ON boards;
DROP POLICY IF EXISTS "Users can create their own boards" ON boards;
DROP POLICY IF EXISTS "Users can update their own boards" ON boards;
DROP POLICY IF EXISTS "Users can delete their own boards" ON boards;

DROP POLICY IF EXISTS "Users can view lists in their boards" ON lists;
DROP POLICY IF EXISTS "Users can create lists in their boards" ON lists;
DROP POLICY IF EXISTS "Users can update lists in their boards" ON lists;
DROP POLICY IF EXISTS "Users can delete lists in their boards" ON lists;

DROP POLICY IF EXISTS "Users can view cards in their boards" ON cards;
DROP POLICY IF EXISTS "Users can create cards in their boards" ON cards;
DROP POLICY IF EXISTS "Users can update cards in their boards" ON cards;
DROP POLICY IF EXISTS "Users can delete cards in their boards" ON cards;

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
  position integer DEFAULT 0 NOT NULL,
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  position integer DEFAULT 0 NOT NULL,
  due_date timestamptz,
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_board_id ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_lists_position ON lists(position);
CREATE INDEX IF NOT EXISTS idx_cards_list_id ON cards(list_id);
CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(position);

-- Enable Row Level Security
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Boards policies
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

-- Lists policies
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

-- Cards policies
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