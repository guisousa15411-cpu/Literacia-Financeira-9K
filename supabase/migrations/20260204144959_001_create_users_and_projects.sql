/*
  # Create Users and Projects Foundation

  1. New Tables
    - `users_profile` - Extended user data
      - `id` (uuid, primary key, foreign key to auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `projects` - Collaboration projects
      - `id` (uuid, primary key)
      - `owner_id` (uuid, foreign key to users_profile)
      - `name` (text)
      - `description` (text)
      - `icon` (text)
      - `color` (text)
      - `is_archived` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `project_members` - Team collaboration
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `role` (text: owner, editor, viewer)
      - `joined_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - All tables locked down by default

  3. Indexes
    - Foreign key indexes for performance
*/

-- Users profile table
CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '📁',
  color text DEFAULT 'slate',
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project members table for collaboration
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  role text DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
