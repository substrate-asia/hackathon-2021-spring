const config = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  proseWrap: 'never',
  endOfLine: 'lf',
  overrides: [
    {
      files: '.prettierrc',
      options: {
        parser: 'json',
      },
    },
  ],
};

module.exports = config;
