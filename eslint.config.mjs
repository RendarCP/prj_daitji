import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: ["node_modules/**", ".next/**", "coverage/**"],
  },
  ...nextCoreWebVitals,
];

export default config;
