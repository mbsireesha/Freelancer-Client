/*
  # Create projects table

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `budget` (integer)
      - `category` (text)
      - `skills` (text array)
      - `deadline` (date)
      - `status` (text) - 'open', 'in_progress', 'completed', 'cancelled'
      - `client_id` (uuid, foreign key to users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `projects` table
    - Add policies for public viewing of open projects
    - Add policies for clients to manage their own projects
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  budget integer NOT NULL CHECK (budget > 0),
  category text NOT NULL,
  skills text[] DEFAULT '{}',
  deadline date NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy for public viewing of open projects
CREATE POLICY "Open projects are publicly viewable"
  ON projects
  FOR SELECT
  TO anon, authenticated
  USING (status = 'open');

-- Policy for authenticated users to view all projects
CREATE POLICY "Authenticated users can view all projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for clients to create projects
CREATE POLICY "Clients can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'client'
    )
  );

-- Policy for clients to update their own projects
CREATE POLICY "Clients can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'client'
    )
  );

-- Policy for clients to delete their own projects
CREATE POLICY "Clients can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (
    client_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'client'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS projects_client_id_idx ON projects(client_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_category_idx ON projects(category);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS projects_skills_idx ON projects USING GIN(skills);