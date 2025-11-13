// src/utils/themeConfigs.ts

/**
 * Theme Configurations - Tema varyantları (renk, font, arka plan)
 * Her tema, bir test türü layout’una bağlıdır.
 */

import { LayoutType } from './layoutProfiles';

export interface ThemeVariant {
  id: string;
  name: string;
  layoutType: LayoutType;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  background: string;
  borderRadius: string;
  preview: string; // küçük görsel (UI'da önizleme için)
}

export const themeConfigs: Record<string, ThemeVariant> = {
  // 🌿 Yaprak Test Temaları
  'leaf-green': {
    id: 'leaf-green',
    name: 'Yaprak Yeşili',
    layoutType: 'leaf',
    primaryColor: '#22c55e',
    secondaryColor: '#16a34a',
    accentColor: '#86efac',
    fontFamily: 'Poppins',
    background: '#f0fdf4',
    borderRadius: '12px',
    preview: '/themes/leaf-green.png'
  },
  'leaf-purple': {
    id: 'leaf-purple',
    name: 'Mor Yaprak',
    layoutType: 'leaf',
    primaryColor: '#9333ea',
    secondaryColor: '#7e22ce',
    accentColor: '#d8b4fe',
    fontFamily: 'Poppins',
    background: '#faf5ff',
    borderRadius: '12px',
    preview: '/themes/leaf-purple.png'
  },

  // 📘 Klasik Test Temaları
  'classic-blue': {
    id: 'classic-blue',
    name: 'Klasik Mavi',
    layoutType: 'classic',
    primaryColor: '#2563eb',
    secondaryColor: '#1d4ed8',
    accentColor: '#bfdbfe',
    fontFamily: 'Times New Roman',
    background: '#f9fafb',
    borderRadius: '8px',
    preview: '/themes/classic-blue.png'
  },
  'classic-gray': {
    id: 'classic-gray',
    name: 'Klasik Gri',
    layoutType: 'classic',
    primaryColor: '#6b7280',
    secondaryColor: '#4b5563',
    accentColor: '#d1d5db',
    fontFamily: 'Times New Roman',
    background: '#f3f4f6',
    borderRadius: '8px',
    preview: '/themes/classic-gray.png'
  },

  // 🧾 Deneme Sınavı Temaları
  'exam-navy': {
    id: 'exam-navy',
    name: 'Koyu Mavi Deneme',
    layoutType: 'exam',
    primaryColor: '#1e3a8a',
    secondaryColor: '#1e40af',
    accentColor: '#93c5fd',
    fontFamily: 'Roboto',
    background: '#f1f5f9',
    borderRadius: '10px',
    preview: '/themes/exam-navy.png'
  },
  'exam-red': {
    id: 'exam-red',
    name: 'Kırmızı Deneme',
    layoutType: 'exam',
    primaryColor: '#dc2626',
    secondaryColor: '#b91c1c',
    accentColor: '#fecaca',
    fontFamily: 'Roboto',
    background: '#fef2f2',
    borderRadius: '10px',
    preview: '/themes/exam-red.png'
  },

  // 📝 Yazılı Sınav Temaları
  'formal-brown': {
    id: 'formal-brown',
    name: 'Klasik Kahverengi',
    layoutType: 'formal',
    primaryColor: '#92400e',
    secondaryColor: '#78350f',
    accentColor: '#fde68a',
    fontFamily: 'Georgia',
    background: '#fffbeb',
    borderRadius: '6px',
    preview: '/themes/formal-brown.png'
  },
  'formal-teal': {
    id: 'formal-teal',
    name: 'Modern Turkuaz',
    layoutType: 'formal',
    primaryColor: '#0d9488',
    secondaryColor: '#0f766e',
    accentColor: '#99f6e4',
    fontFamily: 'Georgia',
    background: '#ecfeff',
    borderRadius: '6px',
    preview: '/themes/formal-teal.png'
  },
};

/**
 * Temaları layout türüne göre gruplayalım
 */
export const themesByLayout: Record<LayoutType, ThemeVariant[]> = {
  classic: Object.values(themeConfigs).filter(t => t.layoutType === 'classic'),
  leaf: Object.values(themeConfigs).filter(t => t.layoutType === 'leaf'),
  exam: Object.values(themeConfigs).filter(t => t.layoutType === 'exam'),
  formal: Object.values(themeConfigs).filter(t => t.layoutType === 'formal')
};
