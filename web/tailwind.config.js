/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      // --- Semi Design colors (preserved for backward compat) ---
      'semi-color-white': 'var(--semi-color-white)',
      'semi-color-black': 'var(--semi-color-black)',
      'semi-color-primary': 'var(--semi-color-primary)',
      'semi-color-primary-hover': 'var(--semi-color-primary-hover)',
      'semi-color-primary-active': 'var(--semi-color-primary-active)',
      'semi-color-primary-disabled': 'var(--semi-color-primary-disabled)',
      'semi-color-primary-light-default':
        'var(--semi-color-primary-light-default)',
      'semi-color-primary-light-hover': 'var(--semi-color-primary-light-hover)',
      'semi-color-primary-light-active':
        'var(--semi-color-primary-light-active)',
      'semi-color-secondary': 'var(--semi-color-secondary)',
      'semi-color-secondary-hover': 'var(--semi-color-secondary-hover)',
      'semi-color-secondary-active': 'var(--semi-color-secondary-active)',
      'semi-color-secondary-disabled': 'var(--semi-color-secondary-disabled)',
      'semi-color-secondary-light-default':
        'var(--semi-color-secondary-light-default)',
      'semi-color-secondary-light-hover':
        'var(--semi-color-secondary-light-hover)',
      'semi-color-secondary-light-active':
        'var(--semi-color-secondary-light-active)',
      'semi-color-tertiary': 'var(--semi-color-tertiary)',
      'semi-color-tertiary-hover': 'var(--semi-color-tertiary-hover)',
      'semi-color-tertiary-active': 'var(--semi-color-tertiary-active)',
      'semi-color-tertiary-light-default':
        'var(--semi-color-tertiary-light-default)',
      'semi-color-tertiary-light-hover':
        'var(--semi-color-tertiary-light-hover)',
      'semi-color-tertiary-light-active':
        'var(--semi-color-tertiary-light-active)',
      'semi-color-default': 'var(--semi-color-default)',
      'semi-color-default-hover': 'var(--semi-color-default-hover)',
      'semi-color-default-active': 'var(--semi-color-default-active)',
      'semi-color-info': 'var(--semi-color-info)',
      'semi-color-info-hover': 'var(--semi-color-info-hover)',
      'semi-color-info-active': 'var(--semi-color-info-active)',
      'semi-color-info-disabled': 'var(--semi-color-info-disabled)',
      'semi-color-info-light-default': 'var(--semi-color-info-light-default)',
      'semi-color-info-light-hover': 'var(--semi-color-info-light-hover)',
      'semi-color-info-light-active': 'var(--semi-color-info-light-active)',
      'semi-color-success': 'var(--semi-color-success)',
      'semi-color-success-hover': 'var(--semi-color-success-hover)',
      'semi-color-success-active': 'var(--semi-color-success-active)',
      'semi-color-success-disabled': 'var(--semi-color-success-disabled)',
      'semi-color-success-light-default':
        'var(--semi-color-success-light-default)',
      'semi-color-success-light-hover': 'var(--semi-color-success-light-hover)',
      'semi-color-success-light-active':
        'var(--semi-color-success-light-active)',
      'semi-color-danger': 'var(--semi-color-danger)',
      'semi-color-danger-hover': 'var(--semi-color-danger-hover)',
      'semi-color-danger-active': 'var(--semi-color-danger-active)',
      'semi-color-danger-light-default':
        'var(--semi-color-danger-light-default)',
      'semi-color-danger-light-hover': 'var(--semi-color-danger-light-hover)',
      'semi-color-danger-light-active': 'var(--semi-color-danger-light-active)',
      'semi-color-warning': 'var(--semi-color-warning)',
      'semi-color-warning-hover': 'var(--semi-color-warning-hover)',
      'semi-color-warning-active': 'var(--semi-color-warning-active)',
      'semi-color-warning-light-default':
        'var(--semi-color-warning-light-default)',
      'semi-color-warning-light-hover': 'var(--semi-color-warning-light-hover)',
      'semi-color-warning-light-active':
        'var(--semi-color-warning-light-active)',
      'semi-color-focus-border': 'var(--semi-color-focus-border)',
      'semi-color-disabled-text': 'var(--semi-color-disabled-text)',
      'semi-color-disabled-border': 'var(--semi-color-disabled-border)',
      'semi-color-disabled-bg': 'var(--semi-color-disabled-bg)',
      'semi-color-disabled-fill': 'var(--semi-color-disabled-fill)',
      'semi-color-shadow': 'var(--semi-color-shadow)',
      'semi-color-link': 'var(--semi-color-link)',
      'semi-color-link-hover': 'var(--semi-color-link-hover)',
      'semi-color-link-active': 'var(--semi-color-link-active)',
      'semi-color-link-visited': 'var(--semi-color-link-visited)',
      'semi-color-border': 'var(--semi-color-border)',
      'semi-color-nav-bg': 'var(--semi-color-nav-bg)',
      'semi-color-overlay-bg': 'var(--semi-color-overlay-bg)',
      'semi-color-fill-0': 'var(--semi-color-fill-0)',
      'semi-color-fill-1': 'var(--semi-color-fill-1)',
      'semi-color-fill-2': 'var(--semi-color-fill-2)',
      'semi-color-bg-0': 'var(--semi-color-bg-0)',
      'semi-color-bg-1': 'var(--semi-color-bg-1)',
      'semi-color-bg-2': 'var(--semi-color-bg-2)',
      'semi-color-bg-3': 'var(--semi-color-bg-3)',
      'semi-color-bg-4': 'var(--semi-color-bg-4)',
      'semi-color-text-0': 'var(--semi-color-text-0)',
      'semi-color-text-1': 'var(--semi-color-text-1)',
      'semi-color-text-2': 'var(--semi-color-text-2)',
      'semi-color-text-3': 'var(--semi-color-text-3)',
      'semi-color-highlight-bg': 'var(--semi-color-highlight-bg)',
      'semi-color-highlight': 'var(--semi-color-highlight)',
      'semi-color-data-0': 'var(--semi-color-data-0)',
      'semi-color-data-1': 'var(--semi-color-data-1)',
      'semi-color-data-2': 'var(--semi-color-data-2)',
      'semi-color-data-3': 'var(--semi-color-data-3)',
      'semi-color-data-4': 'var(--semi-color-data-4)',
      'semi-color-data-5': 'var(--semi-color-data-5)',
      'semi-color-data-6': 'var(--semi-color-data-6)',
      'semi-color-data-7': 'var(--semi-color-data-7)',
      'semi-color-data-8': 'var(--semi-color-data-8)',
      'semi-color-data-9': 'var(--semi-color-data-9)',
      'semi-color-data-10': 'var(--semi-color-data-10)',
      'semi-color-data-11': 'var(--semi-color-data-11)',
      'semi-color-data-12': 'var(--semi-color-data-12)',
      'semi-color-data-13': 'var(--semi-color-data-13)',
      'semi-color-data-14': 'var(--semi-color-data-14)',
      'semi-color-data-15': 'var(--semi-color-data-15)',
      'semi-color-data-16': 'var(--semi-color-data-16)',
      'semi-color-data-17': 'var(--semi-color-data-17)',
      'semi-color-data-18': 'var(--semi-color-data-18)',
      'semi-color-data-19': 'var(--semi-color-data-19)',

      // --- shadcn/ui colors (HSL CSS variables) ---
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
      sidebar: {
        DEFAULT: 'hsl(var(--sidebar-background))',
        foreground: 'hsl(var(--sidebar-foreground))',
        primary: 'hsl(var(--sidebar-primary))',
        'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
        accent: 'hsl(var(--sidebar-accent))',
        'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
        border: 'hsl(var(--sidebar-border))',
        ring: 'hsl(var(--sidebar-ring))',
      },
      chart: {
        1: 'hsl(var(--chart-1))',
        2: 'hsl(var(--chart-2))',
        3: 'hsl(var(--chart-3))',
        4: 'hsl(var(--chart-4))',
        5: 'hsl(var(--chart-5))',
      },
      // basic colors needed by tailwind utilities
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      // Standard Tailwind colors (needed for Avatar, Tag, Typography, etc.)
      red: {
        50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171',
        500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a',
      },
      orange: {
        50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
        500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407',
      },
      amber: {
        50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
        500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03',
      },
      yellow: {
        50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15',
        500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12', 950: '#422006',
      },
      lime: {
        50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d', 300: '#bef264', 400: '#a3e635',
        500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f', 800: '#3f6212', 900: '#365314', 950: '#1a2e05',
      },
      green: {
        50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80',
        500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16',
      },
      teal: {
        50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf',
        500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e',
      },
      cyan: {
        50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee',
        500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344',
      },
      sky: {
        50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8',
        500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e', 950: '#082f49',
      },
      blue: {
        50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
        500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
      },
      indigo: {
        50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8',
        500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
      },
      violet: {
        50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
        500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
      },
      purple: {
        50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc',
        500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764',
      },
      pink: {
        50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6',
        500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843', 950: '#500724',
      },
      gray: {
        50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af',
        500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712',
      },
      slate: {
        50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
        500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617',
      },
      zinc: {
        50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa',
        500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b',
      },
      emerald: {
        50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
        500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22',
      },
      rose: {
        50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
        500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519',
      },
    },
    extend: {
      borderRadius: {
        // Semi border radius (preserved)
        'semi-border-radius-extra-small':
          'var(--semi-border-radius-extra-small)',
        'semi-border-radius-small': 'var(--semi-border-radius-small)',
        'semi-border-radius-medium': 'var(--semi-border-radius-medium)',
        'semi-border-radius-large': 'var(--semi-border-radius-large)',
        'semi-border-radius-circle': 'var(--semi-border-radius-circle)',
        'semi-border-radius-full': 'var(--semi-border-radius-full)',
        // shadcn/ui border radius
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(16px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'shimmer': {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-up': 'fade-up 0.4s ease-out',
        'fade-down': 'fade-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
