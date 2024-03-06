import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Box, Button, Grid, Stack, Typography } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import ProfileRadialChart from './ProfileRadialChart';
import { ThemeMode } from 'config';

// assets
import BackLeft from 'assets/images/profile/UserProfileBackLeft';
import BackRight from 'assets/images/profile/UserProfileBackRight';

// ==============================|| USER PROFILE - TOP CARD ||============================== //

const ProfileCard = ({ focusInput }) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <MainCard
      border={false}
      content={false}
      sx={{ bgcolor: theme.palette.mode === ThemeMode.DARK ? 'primary.700' : 'primary.lighter', position: 'relative' }}
    >
      <Box sx={{ position: 'absolute', bottom: '-7px', left: 0, zIndex: 1 }}>
        <BackLeft />
      </Box>

      <Box sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
        <BackRight />
      </Box>
    </MainCard>
  );
};

ProfileCard.propTypes = {
  focusInput: PropTypes.func
};

export default ProfileCard;
