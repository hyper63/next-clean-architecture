module.exports = {
  '**/*.{ts,tsx,js,jsx,json,yml}': 'prettier --write',
  '.md': [
    'markdown-toc-gen insert',
    'prettier --write'
  ]
}
