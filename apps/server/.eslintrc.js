module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['custom', 'plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
}
