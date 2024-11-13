/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "app.chainwire.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.cointelegraph.com",
      },
      {
        protocol: "https",
        hostname: "s3.magazine.cointelegraph.com",
      },
      {
        protocol: "https",
        hostname: "specials-images.forbesimg.com",
      },
      {
        protocol: "https",
        hostname: "www.coindesk.com",
      },
      {
        protocol: "https",
        hostname: "cdn.jwplayer.com",
      },
      {
        protocol: "https",
        hostname: "cdn.decrypt.co",
      },
      {
        protocol: "https",
        hostname: "fnfscfgwilvky5z8.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
