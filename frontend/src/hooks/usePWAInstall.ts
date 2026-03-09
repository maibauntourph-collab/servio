import { useState, useEffect } from 'react';

// 👨‍🏫 PWA 설치 이벤트를 제어하기 위한 인터페이스
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export const usePWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            // 👨‍🏫 브라우저의 기본 설치 팝업을 막고 이벤트를 저장합니다.
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
            console.log('✅ PWA Install Prompt stands by...');
        };

        window.addEventListener('beforeinstallprompt', handler);

        // 👨‍🏫 이미 설치되어 있거나 앱 모드로 실행 중인지 확인
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstallable(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const install = async () => {
        if (!deferredPrompt) {
            // 👨‍🏫 유저 요청: 이미 홈 화면에 있어도 설치 방법을 모를 수 있으므로, 재차 클릭해도 항상 설치 안내 방식을 띄움.
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

            if (isIOS) {
                alert('📱 [아이폰 설치 가이드]\n\n1. 화면 하단의 공유(보내기) 버튼 ⍗ 을 누릅니다.\n2. 아래로 스와이프하여 "홈 화면에 추가"를 선택하세요.\n3. 우측 상단의 "추가"를 누르면 앱이 생성됩니다!');
            } else {
                alert('✨ [안드로이드/PC 설치 가이드]\n\n홈 화면 바로가기가 생성되지 않았다면:\n- 모바일 크롬: 우측 상단 옵션 메뉴 (⋮) ➔ "홈 화면에 추가" 또는 "앱 설치" 클릭\n- PC 스토어: 주소창 우측 끝의 "앱 다운로드" 아이콘 ⬇ 클릭');
            }
            return;
        }

        // 👨‍🏫 저장된 설치 팝업 실행
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`👤 User installation choice: ${outcome}`);

        // 👨‍🏫 사용 후 초기화
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    return { isInstallable, install };
};
