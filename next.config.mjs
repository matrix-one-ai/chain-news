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

const nextConfig = {images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "app.chainwire.org",
      port: "",
      pathname: "/**",
    },
  ],
},};

export default withPigment(nextConfig, pigmentConfig);
