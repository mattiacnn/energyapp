import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project-imports
import useAuth from 'hooks/useAuth';
import { useSelector } from 'store';
import { selectIsLoggedIn } from 'features/auth/authSlice';

// ==============================|| AUTH GUARD ||============================== //

const AuthGuard = ({ children }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('AuthGuard', isLoggedIn);
   /* if (!isLoggedIn) {
      navigate('/auth/login', {
        state: {
          from: location.pathname
        },
        replace: true
      });
    }*/
  }, [isLoggedIn, navigate, location]);

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node
};

export default AuthGuard;
