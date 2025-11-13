export interface ThemeVariant {
  id: string;
  name: string;
  color: string; // Tailwind renk önizlemesi için
  accents: string; // PDF render’da kullanılacak ana renk
}

export const themeVariants: Record<string, ThemeVariant[]> = {
  classic: [
    { id: 'blue', name: 'Klasik Mavi', color: 'bg-blue-200', accents: '#2563eb' },
    { id: 'gray', name: 'Gri Minimal', color: 'bg-gray-300', accents: '#6b7280' },
    { id: 'orange', name: 'Sıcak Turuncu', color: 'bg-orange-200', accents: '#ea580c' },
    { id: 'teal', name: 'Modern Turkuaz', color: 'bg-teal-200', accents: '#0d9488' },
  ],

  leaf: [
    { id: 'green', name: 'Doğal Yeşil', color: 'bg-green-200', accents: '#16a34a' },
    { id: 'lime', name: 'Canlı Lime', color: 'bg-lime-200', accents: '#65a30d' },
    { id: 'brown', name: 'Toprak Kahverengi', color: 'bg-amber-300', accents: '#92400e' },
    { id: 'orange', name: 'Sonbahar Turuncusu', color: 'bg-orange-300', accents: '#ea580c' },
  ],

  exam: [
    { id: 'dark', name: 'Koyu Kontrast', color: 'bg-gray-800', accents: '#ffffff' },
    { id: 'blue', name: 'Klasik Mavi', color: 'bg-blue-300', accents: '#1e3a8a' },
    { id: 'gold', name: 'Altın Sarısı', color: 'bg-yellow-200', accents: '#ca8a04' },
    { id: 'red', name: 'Enerjik Kırmızı', color: 'bg-red-200', accents: '#dc2626' },
  ],

  formal: [
    { id: 'blackWhite', name: 'Siyah Beyaz', color: 'bg-gray-100', accents: '#111827' },
    { id: 'burgundy', name: 'Bordo Kurumsal', color: 'bg-red-200', accents: '#7f1d1d' },
    { id: 'navy', name: 'Koyu Lacivert', color: 'bg-blue-900', accents: '#1e3a8a' },
    { id: 'gray', name: 'Gri Zarif', color: 'bg-gray-300', accents: '#6b7280' },
  ],
};
