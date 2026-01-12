/** @type {import('next').NextConfig} */
const nextConfig = {
  // CORS-Header für Healthcheck-Endpoint
  // Diese Header stellen sicher, dass Railway Healthchecks von healthcheck.railway.app akzeptiert werden
  async headers() {
    return [
      {
        source: '/api/health',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET',
          },
        ],
      },
    ];
  },
};

export default nextConfig;


