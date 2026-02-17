import astro from "eslint-plugin-astro";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
	{
		ignores: ["dist/**", "node_modules/**"],
	},

	...astro.configs.recommended,

	{
		files: ["**/*.{js,jsx,ts,tsx,astro}"],
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
		files: ["**/*.{jsx,tsx}"],
		plugins: {
			react,
			reactHooks,
		},
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			...(react.configs?.recommended?.rules ?? {}),
			...(reactHooks.configs?.recommended?.rules ?? {}),
		},
	},
];
