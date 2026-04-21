/*
  # Comments table for YouTube engagement
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  platform text NOT NULL DEFAULT 'youtube',
  comment_id text,  -- YouTube comment ID
  author_name text,
  author_channel_id text,
  text_content text NOT NULL,
  like_count integer DEFAULT 0,
  sentiment text,  -- positive, negative, neutral
  ai_reply text,   -- AI-generert svar
  replied_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for querying unreplied comments
CREATE INDEX IF NOT EXISTS idx_comments_video_replied 
ON comments(video_id, replied_at) 
WHERE replied_at IS NULL;