import React from 'react';
import { Outlet, Navigate, useParams } from 'react-router-dom';
import { ShopProvider, useShop } from '../context/ShopContext';

/**
 * 👨‍🏫 ShopLayout: URL에서 :shopId를 감지하고 ShopProvider를 적용합니다.
 */
const ShopLayoutInternal: React.FC = () => {
    const { shop, isLoading, error } = useShop();

    if (isLoading) return <div className="flex items-center justify-center h-screen">Loading Shop...</div>;
    if (error || !shop) return <Navigate to="/" replace />;

    return <Outlet />;
};

const ShopLayout: React.FC = () => {
    const { shopId } = useParams<{ shopId: string }>();

    if (!shopId) return <Navigate to="/massage01" replace />; // 기본값으로 리다이렉트

    return (
        <ShopProvider>
            <ShopLayoutInternal />
        </ShopProvider>
    );
};

export default ShopLayout;
