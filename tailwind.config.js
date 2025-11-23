/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#0891B2', // Vibrant Cyan (bright, energetic)
                    secondary: '#F97316', // Bright Orange (warm accent)
                    tertiary: '#0E7490', // Deep Teal (sophisticated)
                    dark: '#1E293B', // Slate Gray (modern dark)
                    light: '#E0F2FE', // Sky Blue (subtle background)
                }
            },
            fontFamily: {
                sans: ['Poppins', 'Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
