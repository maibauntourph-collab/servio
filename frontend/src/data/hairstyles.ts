/**
 * 👨‍🏫 헤어스타일 임시 데이터 파일 (2026-03-10 생성)
 * 빌드 오류 해결을 위한 샘플 데이터를 포함하고 있습니다.
 */

export interface Hairstyle {
    id: number;
    category: string;
    ko: string;
    en: string;
    tl: string;
    ceb: string;
    price: number;
    duration: number;
    img: string;
    designer: string;
}

export const categories = ["Cut", "Perm", "Color", "Treatment"];

export const hairstyles: Hairstyle[] = [
    {
        id: 1,
        category: "Cut",
        ko: "크롭 컷",
        en: "Crop Cut",
        tl: "Crop Cut",
        ceb: "Crop Cut",
        price: 500,
        duration: 30,
        img: "https://images.unsplash.com/photo-1621605815841-aa17a94939b6?auto=format&fit=crop&q=80&w=400",
        designer: "Master J"
    },
    {
        id: 2,
        category: "Perm",
        ko: "쉐도우 펌",
        en: "Shadow Perm",
        tl: "Shadow Perm",
        ceb: "Shadow Perm",
        price: 1500,
        duration: 90,
        img: "https://images.unsplash.com/photo-1593702288056-7927b442d0fa?auto=format&fit=crop&q=80&w=400",
        designer: "Sophia"
    }
];
