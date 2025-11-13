// src/utils/layoutProfiles.ts

/**
 * Layout Profiles - Test türlerine özel sayfa düzeni profilleri
 * Tema dosyaları (PNG) bu profillerin arka planına uygulanır.
 */

export type LayoutType = 'classic' | 'leaf' | 'exam' | 'formal';

export interface LayoutProfile {
  layoutName: string;
  questionAlignment: 'left' | 'center' | 'justify';
  headerPosition: 'top-left' | 'top-center' | 'top-right';
  showLogo: boolean;
  showFooter: boolean;
  questionNumberStyle: 'circle' | 'square' | 'bold' | 'roman';
  defaultFont: string;
  fontSize: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  spacing: number;
  background?: string; // fallback color
  backgroundImage?: string; // 📌 PNG dosyasının yolu
  lineHeight?: number;
}

export const layoutProfiles: Record<LayoutType, LayoutProfile> = {
  classic: {
    layoutName: 'Klasik Test',
    questionAlignment: 'left',
    headerPosition: 'top-center',
    showLogo: true,
    showFooter: true,
    questionNumberStyle: 'circle',
    defaultFont: 'Times New Roman',
    fontSize: 14,
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 30,
    marginRight: 30,
    spacing: 5,
    background: '#FFFFFF',
    backgroundImage: '/themes/classic-light.png', // 📘 varsayılan tema görseli
    lineHeight: 1.5,
  },

  leaf: {
    layoutName: 'Yaprak Test',
    questionAlignment: 'center',
    headerPosition: 'top-left',
    showLogo: false,
    showFooter: true,
    questionNumberStyle: 'square',
    defaultFont: 'Poppins',
    fontSize: 13,
    marginTop: 25,
    marginBottom: 25,
    marginLeft: 20,
    marginRight: 20,
    spacing: 4,
    background: '#F9FAFB',
    backgroundImage: '/themes/leaf-green.png', // 🍃 yeşil yaprak teması
    lineHeight: 1.6,
  },

  exam: {
    layoutName: 'Deneme Sınavı',
    questionAlignment: 'justify',
    headerPosition: 'top-center',
    showLogo: true,
    showFooter: true,
    questionNumberStyle: 'bold',
    defaultFont: 'Roboto',
    fontSize: 15,
    marginTop: 50,
    marginBottom: 45,
    marginLeft: 25,
    marginRight: 25,
    spacing: 6,
    background: '#FFFFFF',
    backgroundImage: '/themes/exam-blue.png', // 🧠 deneme sınavı teması
    lineHeight: 1.4,
  },

  formal: {
    layoutName: 'Yazılı Sınav',
    questionAlignment: 'left',
    headerPosition: 'top-right',
    showLogo: true,
    showFooter: false,
    questionNumberStyle: 'roman',
    defaultFont: 'Georgia',
    fontSize: 14,
    marginTop: 60,
    marginBottom: 50,
    marginLeft: 40,
    marginRight: 40,
    spacing: 5,
    background: '#FAFAF9',
    backgroundImage: '/themes/formal-burgundy.png', // 🏫 yazılı sınav teması
    lineHeight: 1.8,
  },
};
