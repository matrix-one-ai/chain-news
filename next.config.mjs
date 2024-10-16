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
    ],
  },
};

export default nextConfig;
