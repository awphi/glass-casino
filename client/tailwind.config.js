module.exports = {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        steel: {
          DEFAULT: "#363E4A",
          50: "#526072",
          100: "#4F5C6D",
          200: "#495565",
          300: "#424D5C",
          400: "#3C4653",
          500: "#363E4A",
          600: "#2F3741",
          700: "#292F38",
          800: "#22282F",
          900: "#1C2026",
        },
      },
    },
  },
  variants: {
    extend: {
      brightness: ["disabled", "active", "hover"],
      opacity: ["disabled", "active", "hover"],
      backgroundColor: ["disabled", "active", "hover"],
    },
  },
  plugins: [],
};
