/**
 * Theme management system
 * 
 * Central registry and management for all PDF themes
 */

import { ThemeType, ThemeConfig, ThemePlugin } from '../../../types/themes';
import { classicTheme } from './classic';
import { yaprakTestTheme } from './yaprakTest';
import { denemeSinaviTheme } from './denemeSinavi';
import { yaziliSinavTheme } from './yaziliSinav';
import { tyt2024Theme } from './tyt2024';
import { yks2025Theme } from './yks2025';

/**
 * Theme registry containing all available themes
 */
const themeRegistry = new Map<ThemeType, ThemePlugin>([
  ['classic', classicTheme],
  ['yaprak-test', yaprakTestTheme],
  ['deneme-sinavi', denemeSinaviTheme],
  ['yazili-sinav', yaziliSinavTheme],
  ['tyt-2024', tyt2024Theme],
  ['yks-2025', yks2025Theme]
]);

/**
 * Gets a theme by its type
 * 
 * @param themeType - Type of theme to retrieve
 * @returns Theme plugin or undefined if not found
 * 
 * @example
 * ```typescript
 * const theme = getTheme('yaprak-test');
 * if (theme) {
 *   // Use theme for PDF generation
 * }
 * ```
 */
export const getTheme = (themeType: ThemeType): ThemePlugin | undefined => {
  return themeRegistry.get(themeType);
};

/**
 * Gets theme configuration by type
 * 
 * @param themeType - Type of theme
 * @returns Theme configuration
 */
export const getThemeConfig = (themeType: ThemeType): ThemeConfig | undefined => {
  const theme = getTheme(themeType);
  return theme?.config;
};

/**
 * Gets all available themes
 * 
 * @returns Array of all theme configurations
 */
export const getAllThemes = (): ThemeConfig[] => {
  return Array.from(themeRegistry.values()).map(theme => theme.config);
};

/**
 * Registers a new theme
 * 
 * @param theme - Theme plugin to register
 * 
 * @example
 * ```typescript
 * registerTheme(customTheme);
 * ```
 */
export const registerTheme = (theme: ThemePlugin): void => {
  themeRegistry.set(theme.config.id, theme);
};

/**
 * Checks if a theme exists
 * 
 * @param themeType - Theme type to check
 * @returns True if theme exists
 */
export const hasTheme = (themeType: ThemeType): boolean => {
  return themeRegistry.has(themeType);
};

/**
 * Gets default theme (classic)
 * 
 * @returns Default theme plugin
 */
export const getDefaultTheme = (): ThemePlugin => {
  return classicTheme;
};