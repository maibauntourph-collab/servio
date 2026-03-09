import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

/**
 * 👨‍🏫 ShopContext: SaaS 플랫폼의 핵심! 
 * 샵별 정보(이름, 카테고리, 테마, 용어 등)를 관리합니다.
 */
interface ShopInfo {
    id: string;
    slug: string;
    name: string;
    category: 'MASSAGE' | 'HAIR' | 'NAIL';
    logoUrl?: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        labels: {
            expert: string;   // '테라피스트' vs '디자이너'
            service: string;  // '마사지 코스' vs '헤어 스타일'
            booking: string;  // '힐링 예약' vs '스타일링 예약'
        }
    };
}

interface ShopContextType {
    shop: ShopInfo | null;
    isLoading: boolean;
    error: string | null;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { shopId } = useParams<{ shopId: string }>();
    const [shop, setShop] = useState<ShopInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchShopInfo = async () => {
            if (!shopId) return;

            try {
                setIsLoading(true);
                // 👨‍🏫 백엔드에서 샵 설정을 가져옵니다. (실제 엔드포인트: GET /api/shops/:slug)
                // 현재는 API가 완성되기 전이므로, 성공 시뮬레이션을 수행하고 나중에 실제 API로 교체합니다.
                const res = await api.get(`/shops/${shopId}/config`);
                
                if (res.ok && res.data) {
                    const shopData = res.data;
                    setShop(shopData);
                    
                    // 🎨 실시간 테마 적용: CSS 변수를 업데이트하여 앱 전체 색상을 바꿉니다!
                    document.documentElement.style.setProperty('--primary-color', shopData.theme.primaryColor);
                    document.documentElement.style.setProperty('--secondary-color', shopData.theme.secondaryColor);
                } else {
                    // API 응답 실패 시 기본값 세팅 (임시 로직)
                    const isHair = shopId.toLowerCase().includes('barber') || shopId.toLowerCase().includes('hair');
                    const defaultShop: ShopInfo = {
                        id: shopId,
                        slug: shopId,
                        name: isHair ? 'K-BARBER' : 'LOTUS THERAPY',
                        category: isHair ? 'HAIR' : 'MASSAGE',
                        theme: {
                            primaryColor: isHair ? '#1e293b' : '#2c5e1a',
                            secondaryColor: '#f1f5f9',
                            labels: {
                                expert: isHair ? '디자이너' : '테라피스트',
                                service: isHair ? '헤어 스타일' : '마사지 코스',
                                booking: isHair ? '스타일링 예약' : '힐링 예약',
                            }
                        }
                    };
                    setShop(defaultShop);
                    document.documentElement.style.setProperty('--primary-color', defaultShop.theme.primaryColor);
                }
            } catch (err) {
                console.error('Failed to load shop config:', err);
                setError('샵 정보를 불러오지 못했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchShopInfo();
    }, [shopId]);

    return (
        <ShopContext.Provider value={{ shop, isLoading, error }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
};
