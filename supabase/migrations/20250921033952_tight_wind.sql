/*
  # Create proposals table

  1. New Tables
    - `proposals`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `freelancer_id` (uuid, foreign key to users)
      - `cover_letter` (text)
      - `proposed_budget` (integer)
      - `timeline` (text)
      - `status` (text) - 'pending', 'accepted', 'rejected'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `proposals` table
    - Add policies for freelancers to create and view their proposals
    - Add policies for clients to view and manage proposals on their projects
*/

CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cover_letter text NOT NULL,
  proposed_budget integer NOT NULL CHECK (proposed_budget > 0),
  timeline text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one proposal per freelancer per project
  UNIQUE(project_id, freelancer_id)
);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Policy for freelancers to create proposals
CREATE POLICY "Freelancers can create proposals"
  ON proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    freelancer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'freelancer'
    ) AND
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND status = 'open'
      AND client_id != auth.uid()
    )
  );

-- Policy for freelancers to view their own proposals
CREATE POLICY "Freelancers can view own proposals"
  ON proposals
  FOR SELECT
  TO authenticated
  USING (
    freelancer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'freelancer'
    )
  );

-- Policy for freelancers to update their own pending proposals
CREATE POLICY "Freelancers can update own pending proposals"
  ON proposals
  FOR UPDATE
  TO authenticated
  USING (
    freelancer_id = auth.uid() AND
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'freelancer'
    )
  );

-- Policy for freelancers to delete their own pending proposals
CREATE POLICY "Freelancers can delete own pending proposals"
  ON proposals
  FOR DELETE
  TO authenticated
  USING (
    freelancer_id = auth.uid() AND
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'freelancer'
    )
  );

-- Policy for clients to view proposals on their projects
CREATE POLICY "Clients can view proposals on own projects"
  ON proposals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND client_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'client'
    )
  );

-- Policy for clients to update proposal status on their projects
CREATE POLICY "Clients can update proposal status on own projects"
  ON proposals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND client_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'client'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS proposals_project_id_idx ON proposals(project_id);
CREATE INDEX IF NOT EXISTS proposals_freelancer_id_idx ON proposals(freelancer_id);
CREATE INDEX IF NOT EXISTS proposals_status_idx ON proposals(status);
CREATE INDEX IF NOT EXISTS proposals_created_at_idx ON proposals(created_at DESC);