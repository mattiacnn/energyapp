import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';

// third-party
import { Chance } from 'chance';
import jwtDecode from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/reducers/actions';
import authReducer from 'store/reducers/auth';
import { useLocation, useNavigate } from 'react-router-dom';

// project-imports
import Loader from 'components/Loader';
import axios from 'utils/axios';
import { selectCurrentToken, selectIsInitialized, selectIsLoggedIn, setCredentials } from 'features/auth/authSlice';
import { useSelector } from 'store';
import { useDispatch } from 'store';

const chance = new Chance();

// constant
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const verifyToken = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  const decoded = jwtDecode(serviceToken);

  /**
   * Property 'exp' does not exist on type '<T = unknown>(token: string, options?: JwtDecodeOptions | undefined) => T'.
   */
  return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken) => {
  console.log("setSession", serviceToken)
  console.log(serviceToken)
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common.Authorization = `${serviceToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const serviceToken = useSelector(selectCurrentToken);
  const isInitialized = useSelector(selectIsInitialized);

  const navigate = useNavigate();

  const state = {
    isLoggedIn,
    serviceToken,
    isInitialized
  };
  
  useEffect(() => {
    const init = async () => {
      console.log("init")
      try {
        const serviceToken = localStorage.getItem('serviceToken');
        if (serviceToken && verifyToken(serviceToken)) {
          setSession(serviceToken);
          const response = await axios.get('/api/account/me');
          const { user } = response.data;

          dispatch(setCredentials({ token: serviceToken, user, isLoggedIn: true, isInitialized: true }));
        } else {
          dispatch(setCredentials({ token: null, isLoggedIn: false, isInitialized: true }));
        }
      } catch (err) {
        console.error(err);
        dispatch(setCredentials({ token: null, isLoggedIn: false, isInitialized: true }));
      }
    };

    init();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login/admin', { email, password });
      const { token, user } = response.data;
      setSession(token);
      dispatch(setCredentials({ token: serviceToken, user, isLoggedIn: true }));
      navigate('/', { replace: true });
      console.log('login');
    } catch (err) {
      console.error(err);
      throw err;
    }

  };

  const register = async (email, password, firstName, lastName) => {
    // todo: this flow need to be recode as it not verified
    const id = chance.bb_pin();
    const response = await axios.post('/api/account/register', {
      id,
      email,
      password,
      firstName,
      lastName
    });
    let users = response.data;

    if (window.localStorage.getItem('users') !== undefined && window.localStorage.getItem('users') !== null) {
      const localUsers = window.localStorage.getItem('users');
      users = [
        ...JSON.parse(localUsers),
        {
          id,
          email,
          password,
          name: `${firstName} ${lastName}`
        }
      ];
    }

    window.localStorage.setItem('users', JSON.stringify(users));
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
  };

  const resetPassword = async () => { };

  const updateProfile = () => { };

  if (isInitialized !== undefined && !isInitialized) {
    return <Loader />;
  }

  return <JWTContext.Provider value={{ ...state, login, logout, register, resetPassword, updateProfile }}>{children}</JWTContext.Provider>;
};

JWTProvider.propTypes = {
  children: PropTypes.node
};

export default JWTContext;
