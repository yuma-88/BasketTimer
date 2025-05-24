module.exports = {
  content: [
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/assets/stylesheets/**/*.css',
  ],
  theme: {
    extend: {
      screens: {
        'mobile-landscape': { 'raw': '(max-width: 767px) and (orientation: landscape)' },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    darkTheme: false, // ダークモードをONにする場合は削除
    themes: ["halloween"],
  },
}
