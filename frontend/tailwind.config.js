/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0A0A0A",
                foreground: "#FAFAFA",
                primary: {
                    DEFAULT: "#D4AF37",
                    foreground: "#0A0A0A"
                },
                muted: {
                    DEFAULT: "#1F1F1F",
                    foreground: "#A1A1AA"
                }
            }
        },
    },
    plugins: [],
}
