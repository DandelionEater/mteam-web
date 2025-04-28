// postcss.config.js
import postcssTailwind from '@tailwindcss/postcss7-compat';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [postcssTailwind, autoprefixer], // pridedame šiuos pluginus
};
