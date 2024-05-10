import axios from 'axios';

const axiosServices = axios.create({ baseURL:  'http://192.168.178.120:3001/api/' });

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
