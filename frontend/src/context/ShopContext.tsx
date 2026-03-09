import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

/**
 * 👨‍🏫 ShopContext: 샵별 정보(이름, 타입, 테마 등)를 관리하는 전역 상태
 */
interface ShopInfo {
    id: string;
    name: string;
    type: 'massage' | 'hair';
    themeColor: string;
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
            if (!shopId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                // 👨‍🏫 실제로는 백엔드의 GET /api/shops/:id 호출
                // 여기서는 우선 URL 파라미터 기반으로 기본값 설정
                const isHair = shopId.toLowerCase().includes('barber') || shopId.toLowerCase().includes('hair');

                setShop({
                    id: shopId,
                    name: isHair ? 'K-BARBER' : 'MASSAGE & HEALING',
                    type: isHair ? 'hair' : 'massage',
                    themeColor: isHair ? '#1a1a1a' : '#fdf8f4',
                });
            } catch (err) {
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
