import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#FF5A5F',
        'deep-text': '#222222',
        'body-text': '#484848',
        'muted-text': '#717171',
        surface: '#FFFFFF',
        'app-bg': '#F7F7F7',
        border: '#EBEBEB',
        success: '#008A05',
        warning: '#FFB400',
        error: '#D93025',
        'hover-surface': '#F2F2F2',
        'data-blue': '#0369A1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        h1: ['36px', { lineHeight: '1.1', fontWeight: '700' }],
        h2: ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        h3: ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        salary: ['36px', { lineHeight: '1.1', fontWeight: '700' }],
        body: ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        label: ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        metadata: ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};

export default config;
