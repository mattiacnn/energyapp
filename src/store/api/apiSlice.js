import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "https://tribyou-api.it/api/"
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    if (!endpoint?.endsWith("/login")) {
      let token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `${token}`);
      } else {
        token = localStorage.getItem('access_token')
        if (token) {
          headers.set("Authorization", `${token}`);
        }
      }
    }
    return headers;
  }
});

export const apiSlice = createApi({
  baseQuery: baseQuery,
  tagTypes: [],
  endpoints: builder => ({
    
  })
});

