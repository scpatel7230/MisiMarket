import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from Supabase Storage and common CDN domains
  images: {
    remotePatterns: [
      // Supabase Storage
      { protocol: "https", hostname: "*.supabase.co" },
      // Add other domains as needed, e.g.:
      // { protocol: "https", hostname: "cdn.yourdomain.com" },
    ],
  },
};

export default nextConfig;
