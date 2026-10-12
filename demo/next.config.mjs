/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The engine's read_file tool reads real files from this directory at
  // runtime; ensure it ships inside the serverless bundle.
  experimental: {
    outputFileTracingIncludes: {
      "/api/run": ["./lib/engine/sandbox/**/*"],
      "/api/eval": ["./lib/engine/sandbox/**/*"],
      "/api/safety": ["./lib/engine/sandbox/**/*"],
    },
  },
};

export default nextConfig;
