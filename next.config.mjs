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
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
      {
        protocol: "https",
        hostname: "scontent.xx.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "static-cdn.jtvnw.net",
      },
      {
        protocol: "https",
        hostname: "cdn.instagram.com",
      },
      {
        protocol: "https",
        hostname: "graph.microsoft.com",
      },
      {
        protocol: "https",
        hostname: "avatar-reddit.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "avatars.slack-edge.com",
      },
    ],
  },
};

export default nextConfig;
