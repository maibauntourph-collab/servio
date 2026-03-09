/**
 * 👨‍🏫 프리미엄 마사지 & 힐링 프로그램 데이터 (2026-03-08 최종 업데이트)
 *
 * 🔑 업데이트 내역:
 *   - 바버샵 데이터 전면 삭제 -> 마사지/테라피 프로그램으로 교체
 *   - 아로마, 건식, 스웨디시, 스톤 테라피 등 다양한 세션 구성
 *   - 100% 고유한 Unsplash Photo ID (마사지/스파/힐링 테마)
 *   - 한국어/영어/따갈로그어/세부아노어 4개 국어 완벽 대응
 */

export interface Treatment {
    id: number;
    ko: string;
    en: string;
    tl: string;
    ceb: string;
    price: number;
    desc_ko: string;
    desc_en: string;
    desc_tl: string;
    desc_ceb: string;
    category: string;
    therapist: string;
    img: string;
    duration: number;
}

const getImg = (id: string) => `https://images.unsplash.com/${id}?q=80&w=600&auto=format&fit=crop`;

const T = ["Master Kim", "Therapist Lee", "Manager Park", "Therapist Choi", "Senior Jung"];

export const treatments: Treatment[] = [
    {
        id: 1,
        ko: "아로마 힐링 테라피", en: "Aroma Healing Therapy", tl: "Aroma Healing Therapy", ceb: "Aroma Healing Therapy",
        price: 1500,
        desc_ko: "천연 에센셜 오일을 사용한 심신 안정과 피로 회복",
        desc_en: "Relaxation and fatigue recovery using natural essential oils",
        desc_tl: "Relaxation at pagbawi ng pagkapagod gamit ang natural essential oils",
        desc_ceb: "Relaxation ug pagkaayo sa kakapoy gamit ang natural essential oils",
        category: "Oil", therapist: T[0], img: getImg("photo-1600334129128-685c5582fd35"), duration: 60
    },
    {
        id: 2,
        ko: "시그니처 스웨디시", en: "Signature Swedish", tl: "Signature Swedish", ceb: "Signature Swedish",
        price: 1800,
        desc_ko: "부드러운 터치로 혈액 순환을 돕는 유러피안 마사지",
        desc_en: "European massage that improves blood circulation with gentle touch",
        desc_tl: "European massage na nagpapabuti ng sirkulasyon ng dugo",
        desc_ceb: "European massage nga nagpalambo sa sirkulasyon sa dugo",
        category: "Oil", therapist: T[1], img: getImg("photo-1544161515-4ab6ce6db874"), duration: 90
    },
    {
        id: 3,
        ko: "전통 건식 타이", en: "Traditional Dry Thai", tl: "Traditional Dry Thai", ceb: "Traditional Dry Thai",
        price: 1200,
        desc_ko: "오일 없이 지압과 스트레칭으로 뭉친 근육을 완화",
        desc_en: "Relieve muscle tension through acupressure and stretching without oil",
        desc_tl: "Alisin ang tensyon sa kalamnan sa pamamagitan ng acupressure at stretching",
        desc_ceb: "Kuhaa ang tensyon sa kaunuran pinaagi sa acupressure ug stretching",
        category: "Dry", therapist: T[2], img: getImg("photo-1519823551278-64ac92734fb1"), duration: 60
    },
    {
        id: 4,
        ko: "딥 티슈 디톡스", en: "Deep Tissue Detox", tl: "Deep Tissue Detox", ceb: "Deep Tissue Detox",
        price: 2000,
        desc_ko: "심부 근육까지 전달되는 강력한 압으로 만성 통증 케어",
        desc_en: "Chronic pain care with strong pressure reaching deep muscles",
        desc_tl: "Pag-aalaga sa talamak na sakit na may malakas na pressure",
        desc_ceb: "Pag-atiman sa laygay nga kasakit nga adunay kusog nga pressure",
        category: "Deep", therapist: T[3], img: getImg("photo-1515377905703-c4788e51af15"), duration: 90
    },
    {
        id: 5,
        ko: "핫 스톤 스파", en: "Hot Stone Spa", tl: "Hot Stone Spa", ceb: "Hot Stone Spa",
        price: 2500,
        desc_ko: "따뜻한 현무암을 이용해 체온을 높이고 긴장을 해소",
        desc_en: "Warm basalt stones to raise body temperature and relieve tension",
        desc_tl: "Mainit na mga bato upang mapataas ang temperatura ng katawan",
        desc_ceb: "Mainit nga mga bato aron mapataas ang temperatura sa lawas",
        category: "Special", therapist: T[4], img: getImg("photo-1570172619666-4890c2730623"), duration: 100
    },
    {
        id: 6,
        ko: "풋 리플렉솔로지", en: "Foot Reflexology", tl: "Foot Reflexology", ceb: "Foot Reflexology",
        price: 1000,
        desc_ko: "발의 반사구를 자극하여 전신 건강을 증진하는 발 마사지",
        desc_en: "Massage stimulating reflex points in the feet for overall health",
        desc_tl: "Masahe na nagpapasigla sa mga reflex point sa paa",
        desc_ceb: "Masahe nga nagdasig sa mga reflex point sa tiil",
        category: "Part", therapist: T[1], img: getImg("photo-1519415391522-630e25114691"), duration: 45
    }
];

export const categories = [...new Set(treatments.map(t => t.category))];
