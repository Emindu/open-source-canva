import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Auto-detect the base path for GitHub Pages deployments.
// GitHub Actions sets GITHUB_REPOSITORY as "owner/repo"; Vite needs
// base: "/repo/" so asset URLs resolve at https://owner.github.io/repo/.
// For local dev and other hosts, fall back to "/".
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
