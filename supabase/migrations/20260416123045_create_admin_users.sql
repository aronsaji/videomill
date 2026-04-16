/*
  # Admin Users Table

  ## Overview
  Creates a table for admin users with elevated privileges.

  ## Tables
  1. `admin_users`
     - `email` (text, primary key) - Admin user email
     - `created_at` (timestamp)

  ## Data
  - Adds Saji1982@gmail.com as the initial admin

  ## Security
  - RLS enabled
  - Only authenticated users can read (to check if they are admin)
  - No insert/update/delete from frontend (managed by backend only)
*/

CREATE TABLE IF NOT EXISTS admin_users (
  email text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can check admin status"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO admin_users (email) VALUES ('Saji1982@gmail.com')
  ON CONFLICT (email) DO NOTHING;

INSERT INTO admin_users (email) VALUES ('saji1982@gmail.com')
  ON CONFLICT (email) DO NOTHING;
