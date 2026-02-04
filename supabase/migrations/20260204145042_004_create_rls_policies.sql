/*
  # Create RLS Policies

  1. Security Policies
    - Users can only read their own profile
    - Users can only view projects they own or are members of
    - Team members can collaboratively access project files
    - Activity log is visible to all project members
    - Comments follow project member permissions

  2. All tables are now protected with row-level security
*/

-- Users profile policies
CREATE POLICY "Users can read own profile"
  ON users_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view projects they are members of"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Project owners can update their projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Project owners can delete their projects"
  ON projects FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Project members policies
CREATE POLICY "Users can view project members"
  ON project_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND (projects.owner_id = auth.uid() OR projects.id IN (
        SELECT project_id FROM project_members
        WHERE project_members.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Project owners can manage members"
  ON project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update member roles"
  ON project_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can remove members"
  ON project_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Files policies
CREATE POLICY "Project members can view files"
  ON files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = files.project_id
      AND (projects.owner_id = auth.uid() OR projects.id IN (
        SELECT project_id FROM project_members
        WHERE project_members.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Project editors can create files"
  ON files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = auth.uid()
      WHERE p.id = files.project_id
      AND (p.owner_id = auth.uid() OR pm.role IN ('owner', 'editor'))
    )
  );

CREATE POLICY "Project editors can update files"
  ON files FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = auth.uid()
      WHERE p.id = files.project_id
      AND (p.owner_id = auth.uid() OR pm.role IN ('owner', 'editor'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = auth.uid()
      WHERE p.id = files.project_id
      AND (p.owner_id = auth.uid() OR pm.role IN ('owner', 'editor'))
    )
  );

CREATE POLICY "Project owners can delete files"
  ON files FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = files.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- File versions policies
CREATE POLICY "Project members can view versions"
  ON file_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM files f
      JOIN projects p ON p.id = f.project_id
      WHERE f.id = file_versions.file_id
      AND (p.owner_id = auth.uid() OR p.id IN (
        SELECT project_id FROM project_members
        WHERE project_members.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Project editors can create versions"
  ON file_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM files f
      JOIN projects p ON p.id = f.project_id
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = auth.uid()
      WHERE f.id = file_versions.file_id
      AND (p.owner_id = auth.uid() OR pm.role IN ('owner', 'editor'))
    )
  );

-- Comments policies
CREATE POLICY "Project members can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM files f
      JOIN projects p ON p.id = f.project_id
      WHERE f.id = comments.file_id
      AND (p.owner_id = auth.uid() OR p.id IN (
        SELECT project_id FROM project_members
        WHERE project_members.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Project members can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM files f
      JOIN projects p ON p.id = f.project_id
      WHERE f.id = comments.file_id
      AND (p.owner_id = auth.uid() OR p.id IN (
        SELECT project_id FROM project_members
        WHERE project_members.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Activity log policies
CREATE POLICY "Project members can view activity"
  ON activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = activity_log.project_id
      AND (projects.owner_id = auth.uid() OR projects.id IN (
        SELECT project_id FROM project_members
        WHERE project_members.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Authenticated users can create activity"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
