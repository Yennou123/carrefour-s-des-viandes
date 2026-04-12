module.exports = {
  apps: [
    {
      name: "boucherie-backend",
      cwd: "./boucherie-backend",
      script: "index.js", // Chemin vers ton serveur Node
      env: {
        NODE_ENV: "production",
        PORT: 3001
      }
    },
    {
      name: "boucherie-frontend",
      cwd: "./boucherie-frontend", // Chemin vers ton dossier Next.js
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};