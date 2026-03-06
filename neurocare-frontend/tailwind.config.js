/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nc-cream':     '#F7F3EE',
        'nc-beige':     '#EDE8E0',
        'nc-card':      '#FDFAF6',
        'nc-blue-deep': '#3A6FA0',
        'nc-blue-mid':  '#5B8DB8',
        'nc-blue-soft': '#A8C8E8',
        'nc-blue-tint': '#E8F2FB',
        'nc-green-deep':'#3D7A5A',
        'nc-green-mid': '#5A9A72',
        'nc-green-tint':'#E8F5EE',
        'nc-lavender':  '#8B7EC8',
        'nc-lav-tint':  '#EDE8F8',
        'nc-amber':     '#C49A3A',
        'nc-amber-tint':'#F5EDDA',
        'nc-terra':     '#B5705A',
        'nc-terra-tint':'#F5E8E4',
        'nc-grey-dark': '#5C5652',
        'nc-grey-mid':  '#8C8480',
        'nc-grey-pale': '#EAE6E2',
      },
      fontFamily: {
        'nunito': ['Nunito', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      transitionDuration: {
        'safe': '400ms',
        'med': '600ms',
        'slow': '900ms',
      },
      borderRadius: {
        'xl2': '20px',
        'xl3': '28px',
        'xl4': '36px',
      },
    },
  },
  plugins: [],
}
