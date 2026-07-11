import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    credentials: 'include',
  }),
  tagTypes: ['User'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({}),
});

export { baseApi };
export { baseApi as api };
