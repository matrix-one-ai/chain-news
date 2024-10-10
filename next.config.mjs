/** @type {import('next').NextConfig} */
/**
 * @type {import('@pigment-css/nextjs-plugin').PigmentOptions}
 */
import { withPigment } from "@pigment-css/nextjs-plugin";
import { createTheme } from "@mui/material";

const pigmentConfig = {
  transformLibraries: ["@mui/material"],
  theme: createTheme(),
};

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
    ],
  },
};

export default withPigment(nextConfig, pigmentConfig);
