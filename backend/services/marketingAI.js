/**
 * marketingService - GPS 기반의 AI 마케팅 로직을 담당하는 서비스 클래스입니다.
 * 학생 여러분: 이 로직은 사용자의 현재 위치를 확인하여 특정 범위 내에 있을 때 자동 알림을 트리거합니다.
 */
class MarketingAI {
    /**
     * getDistance - 두 좌표 사이의 거리를 계산합니다 (Haversine formula).
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // 지구의 반지름 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * processMarketingTriggers - 사용자의 위치 정보를 바탕으로 마케팅 알림을 전송해야 할지 결정합니다.
     * 교수님 설명: "실시간성"을 위해 유저가 5km 이내 진입 시에만 한정적으로 발동하게 설계합니다.
     */
    async checkAndTriggerCampaign(userProfile, userLocation, activeCampaigns) {
        const results = [];

        for (const campaign of activeCampaigns) {
            const distance = this.calculateDistance(
                userLocation.lat, userLocation.lng,
                campaign.shop_lat, campaign.shop_lng
            );

            // 설정된 반경(target_radius_km) 이내에 사용자가 위치할 경우
            if (distance <= campaign.target_radius_km) {
                results.push({
                    campaignId: campaign.id,
                    message: `${campaign.title}: 현재 매장과 가깝습니다! 방문 시 특별 할인을 받아보세요.`,
                    distance: distance.toFixed(2)
                });
            }
        }

        return results; // 트리거된 캠페인 목록 반환
    }
}

export const marketingAI = new MarketingAI();
