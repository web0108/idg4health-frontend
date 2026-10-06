# IDG4Health

## Run locally

```sh
npm ci
npm run dev
```

## Deploy to GitHub Pages

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds the Vite
app and publishes `dist` to GitHub Pages whenever changes are pushed to `main`.
It configures Vite to use `/idg4health-frontend/`, the base path for this
repository's GitHub Pages project site.

In the repository settings, open **Pages** and set the build and deployment
source to **GitHub Actions**. The deployed site is available at
`https://web0108.github.io/idg4health-frontend/`.
