// import js from '@eslint/js';
// import globals from 'globals';
// import reactHooks from 'eslint-plugin-react-hooks';
// import reactRefresh from 'eslint-plugin-react-refresh';
// import tseslint from 'typescript-eslint';

// export default tseslint.config(
//   { ignores: ['dist'] }, // Keep the ignore patterns
//   {
//     // General config for JS/TS files (merging your .eslintrc.json settings)
//     extends: [
//       js.configs.recommended, // ESLint recommended rules
//       ...tseslint.configs.recommended, // TypeScript recommended rules
//     ],
//     files: ['**/*.{js,ts,tsx}'], // Apply to JS, TS, and TSX files
//     languageOptions: {
//       ecmaVersion: 12, // Matches your "es2021" and "parserOptions.ecmaVersion"
//       sourceType: 'module', // Default to ES modules (can be overridden per file)
//       globals: {
//         ...globals.node, // Matches "env.node"
//         ...globals.commonjs, // Matches "env.commonjs"
//         ...globals.es2021, // Matches "env.es2021"
//         ...globals.jest, // Matches "env.jest"
//         ...globals.browser, // From your original config
//       },
//       parserOptions: {
//         ecmaFeatures: { jsx: true },
//         react: { version: 'detect' }, // Or specify e.g., '18.2'
//       },
//     },
//     plugins: {
//       'react-hooks': reactHooks, // Keep React hooks plugin
//       'react-refresh': reactRefresh, // Keep React Refresh plugin
//     },
//     rules: {
//       // Merge React-specific rules from your original config
//       ...reactHooks.configs.recommended.rules,
//       'react-refresh/only-export-components': [
//         'warn',
//         { allowConstantExport: true },
//       ],

//       // Rules from your .eslintrc.json
//       'no-console': 'warn',

//       // Avoid Bugs
//       'no-undef': 'error',
//       semi: 'error',
//       'semi-spacing': 'error',

//       // Best Practices
//       eqeqeq: 'warn',
//       'no-invalid-this': 'error',
//       'no-return-assign': 'error',
//       'no-unused-expressions': ['error', { allowTernary: true }],
//       'no-useless-concat': 'error',
//       'no-useless-return': 'error',
//       'no-constant-condition': 'warn',
//       'no-unused-vars': ['warn', { argsIgnorePattern: 'req|res|next|__' }],

//       // Enhance Readability
//       indent: ['error', 2, { SwitchCase: 1 }],
//       'no-mixed-spaces-and-tabs': 'warn',
//       'space-before-blocks': 'error',
//       'space-in-parens': 'error',
//       'space-infix-ops': 'error',
//       'space-unary-ops': 'error',
//       quotes: ['error', 'single'],
//       'max-len': ['error', { code: 200 }],
//       'max-lines': ['error', { max: 500 }],
//       'keyword-spacing': 'error',
//       'multiline-ternary': ['error', 'never'],
//       'no-mixed-operators': 'error',
//       'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
//       'no-whitespace-before-property': 'error',
//       'nonblock-statement-body-position': 'error',
//       'object-property-newline': [
//         'error',
//         { allowAllPropertiesOnSameLine: true },
//       ],

//       // ES6
//       'arrow-spacing': 'error',
//       'no-confusing-arrow': 'error',
//       'no-duplicate-imports': 'error',
//       'no-var': 'error',
//       'object-shorthand': 'off',
//       'prefer-const': 'error',
//       'prefer-template': 'warn',
//     },
//   }
// );



import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  }
);