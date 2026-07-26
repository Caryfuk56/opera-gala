import astro from "eslint-plugin-astro";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tsParser from "@typescript-eslint/parser";

export default [
	{
		ignores: ["dist/**", "node_modules/**", ".astro/**", ".netlify/**"],
	},

	...astro.configs.recommended,

	{
		files: ["**/*.{js,jsx,ts,tsx}"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
		},
		rules: {
			quotes: ["error", "double", { avoidEscape: true }],
			"jsx-quotes": ["error", "prefer-double"],
		},
	},

	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: "latest",
			sourceType: "module",
		},
	},

	{
		files: ["**/*.{jsx,tsx}"],
		plugins: {
			react,
			"react-hooks": reactHooks,
		},
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			...(react.configs?.recommended?.rules ?? {}),
			...(reactHooks.configs?.recommended?.rules ?? {}),
			"react/react-in-jsx-scope": "off",
			"react-hooks/set-state-in-effect": "off",
		},
	},
];
