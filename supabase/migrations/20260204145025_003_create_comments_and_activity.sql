/*
  # Create Comments and Activity Schema

  1. New Tables
    - `comments` - File comments
      - `id` (uuid, primary key)
      - `file_id` (uuid, foreign key)
      - `author_id` (uuid, foreign key)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `activity_log` - Audit trail
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `action` (text)
      - `resource_type` (text)
      - `resource_id` (uuid)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Tables locked down by default

  3. Indexes
    - Foreign keys and query optimization
*/

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_comments_file_id ON comments(file_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_activity_log_project_id ON activity_log(project_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);
