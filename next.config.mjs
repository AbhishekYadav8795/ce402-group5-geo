import { fileURLToPath } from 'node:url';

// Anchor discovery to this application, not a parent directory's lockfile.
const projectRoot = fileURLToPath(new URL('.', import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  outputFileTracingRoot: projectRoot,
  turbopack: { root: projectRoot },
};
export default nextConfig;
