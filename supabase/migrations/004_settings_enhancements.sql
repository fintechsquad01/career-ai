-- Settings enhancements: avatars bucket, notification preferences, delete tool_results policy

-- ============================================
-- AVATARS STORAGE BUCKET (public for display)
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Users can upload/update their own avatar
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '/'))[1]
);
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '/'))[1]
);
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (
  bucket_id = 'avatars'
);

-- ============================================
-- NOTIFICATION PREFERENCES ON PROFILES
-- ============================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{"marketing": true, "product_updates": true}';

-- ============================================
-- ALLOW USERS TO DELETE OWN TOOL RESULTS
-- ============================================
CREATE POLICY "Users delete own tool results" ON tool_results
  FOR DELETE USING (auth.uid() = user_id);
