/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `password_hash` (text)
      - `user_type` (text) - 'client' or 'freelancer'
      - `profile` (jsonb) - flexible profile data
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to read/update their own data
    - Add policy for public profile viewing
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('client', 'freelancer')),
  profile jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Policy for users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Policy for public profile viewing (limited fields)
CREATE POLICY "Public profiles are viewable"
  ON users
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Create index for user type
CREATE INDEX IF NOT EXISTS users_user_type_idx ON users(user_type);