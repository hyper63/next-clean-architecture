// eslint-disable-next-line import/no-anonymous-default-export
export default {
  '**/*.{ts,tsx,js,jsx,json,yml}': 'prettier --write',
  '.md': ['markdown-toc-gen insert', 'prettier --write']
}
