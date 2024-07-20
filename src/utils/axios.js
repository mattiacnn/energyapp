import axios from 'axios';
export const downloadUrl = "https://energyapp-api.vercel.app"
export const apiUrl = "http://energyapp-api.vercel.app/api"
const axiosServices = axios.create({ baseURL:  'energyapp-api.vercel.app/api/' });

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
   /* if (error.response.status === 401 && !window.location.href.includes('/login')) {
      window.location.pathname = '/login';
    }*/
    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;
