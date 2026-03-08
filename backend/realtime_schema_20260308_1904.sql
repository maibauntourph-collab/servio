-- 1. Messages 테이블: 고객과 매장 간의 실시간 채팅을 저장합니다.
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id),
  receiver_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Notifications 테이블: 실시간 마케팅 알림 및 결제 확인 정보를 저장합니다.
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT CHECK (type IN ('marketing', 'payment', 'system')) DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 설정: 보안을 최우선으로!
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 메시지 정책: 내가 보내거나 받은 메시지만 볼 수 있습니다.
CREATE POLICY "Users can view their own messages" ON messages 
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages 
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 알림 정책: 나의 알림만 볼 수 있습니다.
CREATE POLICY "Users can view their own notifications" ON notifications 
FOR SELECT USING (auth.uid() = user_id);

-- Supabase Realtime 활성화 (교수님 설명: 이 설정이 있어야 앱이 새로고침 없이 데이터를 실시간으로 가져옵니다.)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
