/** @type {import('tailwindcss').Config} */
// Configuración del sistema visual (Tailwind):
// - Colores tomados del diseño oficial (design.md).
// - Tipografía Manrope.
// - Radios y sombras para tarjetas/botones.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'surface': '#f7f9fb',
        'surface-dim': '#d8dadc',
        'surface-bright': '#f7f9fb',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'surface-container-highest': '#e0e3e5',
        'on-surface': '#191c1e',
        'on-surface-variant': '#44474c',
        'inverse-surface': '#2d3133',
        'inverse-on-surface': '#eff1f3',
        'outline': '#75777d',
        'outline-variant': '#c5c6cd',
        'surface-tint': '#515f74',
        'primary': '#071629',
        'on-primary': '#ffffff',
        'primary-container': '#1d2b3e',
        'on-primary-container': '#8492a9',
        'inverse-primary': '#b9c7e0',
        'secondary': '#006b5f',
        'on-secondary': '#ffffff',
        'secondary-container': '#9cefdf',
        'on-secondary-container': '#0b6f63',
        'tertiary': '#280f00',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#462000',
        'on-tertiary-container': '#da7823',
        'error': '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        'primary-fixed': '#d5e3fd',
        'primary-fixed-dim': '#b9c7e0',
        'on-primary-fixed': '#0d1c2e',
        'on-primary-fixed-variant': '#3a485c',
        'secondary-fixed': '#9ff2e2',
        'secondary-fixed-dim': '#83d5c6',
        'on-secondary-fixed': '#00201c',
        'on-secondary-fixed-variant': '#005047',
        'tertiary-fixed': '#ffdcc5',
        'tertiary-fixed-dim': '#ffb783',
        'on-tertiary-fixed': '#301400',
        'on-tertiary-fixed-variant': '#713700',
        'background': '#f7f9fb',
        'on-background': '#191c1e',
        'surface-variant': '#e0e3e5',
        'teal-accent': '#2dd4bf',
        'outline-subtle': '#c5c6cd',
        'academic-orange': '#fb923c',
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        'card': '0px 4px 20px rgba(51, 65, 85, 0.05)',
      },
      spacing: {
        'gutter': '20px',
      }
    },
  },
  plugins: [],
}
