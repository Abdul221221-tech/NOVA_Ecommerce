-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_id TEXT,
  icon TEXT,
  href TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
