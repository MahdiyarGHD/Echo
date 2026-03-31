/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_DOMAIN: process.env.DOMAIN || "",
  },
};

export default nextConfig;
