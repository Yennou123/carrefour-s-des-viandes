// ... (garder le début identique)

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Désactive l'erreur sur l'usage du type "any"
      "@typescript-eslint/no-explicit-any": "off",
      // Désactive l'alerte sur les balises <img> classiques
      "@next/next/no-img-element": "off",
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;