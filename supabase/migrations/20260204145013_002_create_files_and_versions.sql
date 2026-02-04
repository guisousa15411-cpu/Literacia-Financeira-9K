/*
  # Create Files and Versions Schema

  1. New Tables
    - `files` - Document files in projects
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `name` (text)
      - `type` (text: document, spreadsheet, presentation)
      - `created_by` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `file_versions` - Version history
      - `id` (uuid, primary key)
      - `file_id` (uuid, foreign key)
      - `version_number` (integer)
      - `content` (text)
      - `created_by` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Tables locked down by default

  3. Indexes
    - Foreign keys and file history lookups
*/

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text DEFAULT 'document' CHECK (type IN ('document', 'spreadsheet', 'presentation')),
  created_by uuid NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- File versions table
CREATE TABLE IF NOT EXISTS file_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content text DEFAULT '',
  created_by uuid NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(file_id, version_number)
);

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_files_project_id ON files(project_id);
CREATE INDEX idx_files_created_by ON files(created_by);
CREATE INDEX idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX idx_file_versions_created_by ON file_versions(created_by);
