import { apiSlice } from "app/api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginAdmin: builder.mutation({
      query: (admin) => ({
        url: "/auth/sign-in/admin",
        method: "POST",
        body: admin,
      }),
    }),
  })
});


export const {
  useLoginAdminMutation,
} = authApiSlice;