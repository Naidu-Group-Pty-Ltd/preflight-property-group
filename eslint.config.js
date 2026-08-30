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
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-useless-escape": "off",
      "no-control-regex": "off",
      "no-misleading-character-class": "off",
      "prefer-const": "off",
      "no-case-declarations": "off",
      "no-empty": "off",
      "no-prototype-builtins": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
      // Style-token guardrail. Warns (not errors) because thousands of legacy
      // violations still exist; the hard gate is the ratchet in
      // scripts/audit-style-tokens.cjs. New code should use semantic tokens.
      // See docs/STYLE_CONSISTENCY_AND_THEMING_PLAN.md.
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "Literal[value=/(?:bg|text|border|ring|from|to|via|fill|stroke|divide|outline|decoration|placeholder|caret|accent)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}/]",
          message:
            "Use a semantic colour token (bg-primary, text-warning, border-destructive, bg-brand, …) instead of a raw Tailwind palette class.",
        },
        {
          selector: "Literal[value=/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b/]",
          message:
            "Avoid hardcoded HEX colours. Use a semantic token via hsl(var(--token)) or a Tailwind token class.",
        },
        {
          selector: "Property[key.name='fontFamily']",
          message:
            "Do not set fontFamily per component. Fonts come from the --font-* tokens (branding page).",
        },
      ],
    },
  }
);
