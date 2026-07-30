import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import tseslint from 'typescript-eslint';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      sourceType: "module",
      globals: globals.browser,
      parser: tseslint.parser,
    },
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      '@typescript-eslint': tseslint.plugin,
    },
    ...pluginReact.configs.flat.recommended,
    ...pluginReactHooks.configs.flat.recommended,
    rules: {
      "no-unused-vars": "warn",           // Warn unused vars
      "no-console": "off",                // Allow console
      "semi": ["error", "always"],        // Require semicolons
      "quotes": ["error", "double"],      // Double quotes only
      "indent": ["error", 2],             // 2-space indent
      "no-var": "error",                  // Ban var, use let/const
      "prefer-const": "warn",             // Warn if let should be const
      "eqeqeq": ["error", "always"],      // Use === not ==
    }
  },
  js.configs.recommended,
];