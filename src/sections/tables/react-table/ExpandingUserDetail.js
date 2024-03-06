import PropTypes from 'prop-types';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  useMediaQuery,
  Grid,
  Chip,
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TableCell,
  TableRow,
  Typography
} from '@mui/material';

// third-party
import { PatternFormat } from 'react-number-format';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import { CallCalling, Link1, Location, Sms } from 'iconsax-react';

const avatarImage = require.context('assets/images/users', true);

// ==============================|| EXPANDING TABLE - USER DETAILS ||============================== //

const ExpandingUserDetail = ({ data }) => {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));

  const backColor = alpha(theme.palette.primary.lighter, 0.1);

  return (
    <TableRow sx={{ bgcolor: backColor, '&:hover': { bgcolor: `${backColor} !important` } }}>
      <TableCell colSpan={8} sx={{ p: 2.5 }}>
        <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
          <Grid item xs={12} sm={5} md={4} lg={3}>
            <MainCard>
              <Chip
                label={data.status}
                size="small"
                sx={{
                  position: 'absolute',
                  right: -1,
                  top: -1,
                  borderRadius: '0 4px 0 4px'
                }}
              />
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack spacing={2.5} alignItems="center">
                    <Avatar alt="Avatar 1" size="xl" src={avatarImage(`./avatar-${data.avatar}.png`)} />
                    <Stack spacing={0.5} alignItems="center">
                      <Typography variant="h5">
                        {data.firstName} {data.lastName}
                      </Typography>
                      <Typography color="secondary">{data.role}</Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <List
                    component="nav"
                    aria-label="main mailbox folders"
                    sx={{ py: 0, '& .MuiListItem-root': { p: 0 }, '& .MuiListItemIcon-root': { minWidth: 24 } }}
                  >
                    <ListItem>
                      <ListItemIcon>
                        <Sms size={18} />
                      </ListItemIcon>
                      <ListItemText primary={<Typography color="secondary">Email</Typography>} />
                      <ListItemSecondaryAction>
                        <Typography align="right">{data.email}</Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CallCalling size={18} />
                      </ListItemIcon>
                      <ListItemText primary={<Typography color="secondary">Telefono</Typography>} />
                      <ListItemSecondaryAction>
                        <Typography align="right">
                          <PatternFormat displayType="text" format="+1 (###) ###-####" mask="_" defaultValue={data.contact} />
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Location size={18} />
                      </ListItemIcon>
                      <ListItemText primary={<Typography color="secondary">Location</Typography>} />
                      <ListItemSecondaryAction>
                        <Typography align="right">{data.country}</Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Link1 size={18} />
                      </ListItemIcon>
                      <ListItemText primary={<Typography color="secondary">Portfolio</Typography>} />
                      <ListItemSecondaryAction>
                        <Link align="right" href="https://google.com" target="_blank">
                          https://anshan.dh.url
                        </Link>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} sm={7} md={8} lg={9}>
            <Stack spacing={2.5}>
              <MainCard title="Informazioni personali">
                <List sx={{ py: 0 }}>
                  <ListItem divider={!matchDownMD}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                          <Typography color="secondary">Nome</Typography>
                          <Typography>
                            {data.firstName}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                          <Typography color="secondary">Cognome</Typography>
                          <Typography>{data.lastName}</Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </ListItem>
                  <ListItem divider={!matchDownMD}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                          <Typography color="secondary">Città</Typography>
                          <Typography>{data.country}</Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                          <Typography color="secondary">Codice postale</Typography>
                          <Typography>
                            <PatternFormat displayType="text" format="### ###" mask="_" defaultValue={data.contact} />
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </ListItem>
                  <ListItem>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Indirizzo</Typography>
                      <Typography>{data.address}</Typography>
                    </Stack>
                  </ListItem>
                </List>
              </MainCard>
              <MainCard title="Note">
                <Typography color="secondary">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. In et euismod mi
                </Typography>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </TableCell>
    </TableRow>
  );
};

ExpandingUserDetail.propTypes = {
  data: PropTypes.any
};

export default ExpandingUserDetail;
