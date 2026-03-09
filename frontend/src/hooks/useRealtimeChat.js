import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // 프로젝트의 supabase 클라이언트 설정 파일

/**
 * useRealtimeChat - 실시간 채팅 메시지를 관리하는 커스텀 훅입니다.
 * 학생 여러분: 이 훅은 데이터베이스의 변화를 감지하여 상태를 자동으로 업데이트합니다.
 */
export const useRealtimeChat = (userId) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // 1. 초기 메시지 데이터 로드
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .order('created_at', { ascending: true });

            if (error) console.error('메시지 로딩 실패:', error);
            else setMessages(data);
        };

        fetchMessages();

        // 2. 실시간 구독 (교수님 설명: 'INSERT' 이벤트를 감시하여 새로운 메시지가 오면 목록에 즉시 추가합니다.)
        const channel = supabase
            .channel('realtime_messages')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new]);
                }
            )
            .subscribe();

        // 컴포넌트 언마운트 시 구독 해제
        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    /**
     * sendMessage - 새로운 메시지를 전송합니다.
     */
    const sendMessage = async (receiverId, content) => {
        const { error } = await supabase
            .from('messages')
            .insert([
                { sender_id: userId, receiver_id: receiverId, content }
            ]);

        if (error) console.error('메시지 전송 실패:', error);
    };

    return { messages, sendMessage };
};
