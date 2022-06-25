/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "assets.omscs-notes.com",
      "tailwindui.com",
      "images.unsplash.com",
    ],
  },
};

module.exports = nextConfig;
