/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Legacy host, still returned by the deprecated `file.url`.
      { hostname: "utfs.io" },
      // uploadthing v7 serves files from <appId>.ufs.sh via `file.ufsUrl`.
      { hostname: "*.ufs.sh" },
    ],
  },
};

export default nextConfig;
