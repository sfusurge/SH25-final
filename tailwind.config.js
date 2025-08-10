/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/app/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                header:"var(--header)",
                textalt: "var(--special)",
                primary: "var(--primary)",
                border: "var(--border)",
                borderalt: "var(--border2)",
                background: "var(--bg)",
                backgroundalt: "var(--bg2)"
            },
            fontFamily: {
                catriel: 'var(--font-catriel)',
            },
        },
        screens: {
            xs: '400px',
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
        },
    },
};
