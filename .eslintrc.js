module.exports = {
  "extends": [
    "next/core-web-vitals",
    "plugin:import/recommended",
    "prettier"
  ],
  "rules": {
    "jsx-a11y/alt-text": "off",
    "react/display-name": "off",
    "react/no-children-prop": "off",
    "@next/next/no-img-element": "off",
    "@next/next/no-page-custom-font": "off",
    "lines-around-comment": "off",
    "padding-line-between-statements": "off",
    "newline-before-return": "off",
    "import/newline-after-import": "off",
    "import/order": "off",

    // Disabling React Hook Rules
    "react-hooks/exhaustive-deps": "off", // Disables missing dependencies warnings
    "react-hooks/rules-of-hooks": "off",  // Disables React hook usage errors

    // Disabling Import Duplicate Rules
    "import/no-duplicates": "off", // Disables duplicate import warnings

    // Disabling JSX Key Warnings
    "react/jsx-key": "off" // Disables missing "key" prop warnings in iterators
  },
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/parsers": {},
    "import/resolver": {
      "node": {},
      "typescript": {
        "project": "./jsconfig.json"
      }
    }
  },
  "overrides": []
};
