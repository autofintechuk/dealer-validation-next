const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`; // dev SSR should use localhost
};

export const config = {
  baseUrl: getBaseUrl(),
  marketplace: {
    apiUrl: process.env.MARKETPLACE_API_URL || "http://localhost:3001",
    clientId: process.env.MARKETPLACE_CLIENT_ID || "",
    clientSecret: process.env.MARKETPLACE_CLIENT_SECRET || "",
  },
} as const;
