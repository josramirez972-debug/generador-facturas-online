import { PaletteConfig } from '../types/invoice';

export const PALETTES: PaletteConfig[] = [
  {
    id: 'minimalist',
    name: 'Paleta 1 — Minimalista',
    description: 'Sobria, atemporal y de alto contraste editorial.',
    primary: '#111111',
    secondary: '#3A3A3A',
    lightSurface: '#F3F3F3',
    background: '#FFFFFF',
    swatches: [
      { label: 'Negro', hex: '#111111' },
      { label: 'Gris oscuro', hex: '#3A3A3A' },
      { label: 'Gris claro', hex: '#F3F3F3' },
      { label: 'Blanco', hex: '#FFFFFF' },
    ],
  },
  {
    id: 'professional-blue',
    name: 'Paleta 2 — Profesional Azul',
    description: 'Corporativa, confiable e ideal para consultoría y tecnología.',
    primary: '#1E3A5F',
    secondary: '#3B5F8A',
    lightSurface: '#F1F3F5',
    background: '#FFFFFF',
    swatches: [
      { label: 'Azul oscuro', hex: '#1E3A5F' },
      { label: 'Azul medio', hex: '#3B5F8A' },
      { label: 'Gris claro', hex: '#F1F3F5' },
      { label: 'Blanco', hex: '#FFFFFF' },
    ],
  },
  {
    id: 'elegant-green',
    name: 'Paleta 3 — Elegante Verde',
    description: 'Distinguida, orgánica y serena para estudios creativos y firmas.',
    primary: '#23483A',
    secondary: '#4F7565',
    lightSurface: '#F4F2ED',
    background: '#FFFFFF',
    swatches: [
      { label: 'Verde oscuro', hex: '#23483A' },
      { label: 'Verde medio', hex: '#4F7565' },
      { label: 'Beige claro', hex: '#F4F2ED' },
      { label: 'Blanco', hex: '#FFFFFF' },
    ],
  },
];

export function getPaletteById(id: string): PaletteConfig {
  return PALETTES.find((p) => p.id === id) || PALETTES[0];
}
