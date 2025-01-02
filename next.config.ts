module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: process.env.API_PROTOCOL || 'http',
        hostname: process.env.API_HOSTNAME || 'localhost',
        port: process.env.API_PORT || '3001',
        pathname: '/pets/photo/**',
      },
    ],
  },
};
