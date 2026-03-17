import axios from 'axios';

export const api = axios.create({
   baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
   withCredentials: true, // sends httpOnly cookies automatically
});

// Shared in-flight refresh promise — prevents multiple concurrent 401s from
// each triggering their own refresh call (race condition).
let refreshPromise: Promise<void> | null = null;

// On 401, try to refresh once via the /auth/refresh endpoint
api.interceptors.response.use(
   (res) => res,
   async (error) => {
      const original = error.config;
      if (error.response?.status !== 401 || original._retry) {
         return Promise.reject(error);
      }

      original._retry = true;

      try {
         if (!refreshPromise) {
            refreshPromise = axios
               .post(
                  `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/auth/refresh`,
                  {},
                  { withCredentials: true },
               )
               .then(() => undefined)
               .finally(() => {
                  refreshPromise = null;
               });
         }

         await refreshPromise;
         return api(original);
      } catch {
         window.location.href = '/login';
         return Promise.reject(error);
      }
   },
);
