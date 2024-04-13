import { useState } from 'react';

// material-ui
import {
  Box,
  Button,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { isNumber, isLowercaseChar, isUppercaseChar, isSpecialChar, minLength } from 'utils/password-validation';

// third-party
import * as Yup from 'yup';
import { Formik, FormikProvider, useFormik } from 'formik';

// assets
import { Eye, EyeSlash, Minus, TickCircle } from 'iconsax-react';
import { selectAgent, updateAgent } from 'store/reducers/agent';
import { useSelector } from 'react-redux';

// ==============================|| ACCOUNT PROFILE - PASSWORD CHANGE ||============================== //
const getInitialValues = (customer) => {
  const newCustomer = {
    password: '',
    password2: '',
  };
  return newCustomer;
};

const TabPassword = () => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const agent = useSelector(selectAgent)

  const AgentSchema = Yup.object().shape({
    password: Yup.string()
      .required('Inserisci una password')
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        'La password deve contenere almeno 8 caratteri, uno maiuscolo, un numero e un carattere speciale'
      ),
  });


  const formik = useFormik({
    initialValues: getInitialValues(agent),
    validationSchema: AgentSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const new_client = {
          password: values.password,
          password2: values.password2,
        }
        dispatch(updateAgent(new_client));
        setSubmitting(false);
      } catch (error) {
        console.error(error);
      }
    }
  });

  const handleClickShowOldPassword = () => {
    setShowOldPassword(!showOldPassword);
  };
  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };
  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChange = (key, event) => {
    const { value } = event.target;
    const newClient = { ...agent, [key]: value };
    dispatch(updateAgent(newClient));
    setFieldValue(key, value);
  }

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, handleBlur, handleReset } = formik;

  return (
    <MainCard title="Cambia password">
      <FormikProvider value={formik}>
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item container spacing={3} xs={12} sm={6}>
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="password-password">Password</InputLabel>
                  <OutlinedInput
                    id="password-password"
                    placeholder="Inserisci la password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={agent.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => handleChange("password", e)}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowNewPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          size="large"
                          color="secondary"
                        >
                          {showNewPassword ? <Eye /> : <EyeSlash />}
                        </IconButton>
                      </InputAdornment>
                    }
                    autoComplete="password-password"
                  />
                  {touched.password && errors.password && (
                    <FormHelperText error id="password-password-helper">
                      {errors.password}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: { xs: 0, sm: 2, md: 4, lg: 5 } }}>
                <Typography variant="h5">La password deve contenre:</Typography>
                <List sx={{ p: 0, mt: 1 }}>
                  <ListItem divider>
                    <ListItemIcon sx={{ color: minLength(formik.values.password) ? 'success.main' : 'inherit' }}>
                      {minLength(formik.values.password) ? <TickCircle /> : <Minus />}
                    </ListItemIcon>
                    <ListItemText primary="Almeno 8 caratteri" />
                  </ListItem>
                  <ListItem divider>
                    <ListItemIcon sx={{ color: isLowercaseChar(formik.values.password) ? 'success.main' : 'inherit' }}>
                      {isLowercaseChar(formik.values.password) ? <TickCircle /> : <Minus />}
                    </ListItemIcon>
                    <ListItemText primary="Almeno una lettera minuscola (a-z)" />
                  </ListItem>
                  <ListItem divider>
                    <ListItemIcon sx={{ color: isUppercaseChar(formik.values.password) ? 'success.main' : 'inherit' }}>
                      {isUppercaseChar(formik.values.password) ? <TickCircle /> : <Minus />}
                    </ListItemIcon>
                    <ListItemText primary="Almeno una lettere minuscola (A-Z)" />
                  </ListItem>
                  <ListItem divider>
                    <ListItemIcon sx={{ color: isNumber(formik.values.password) ? 'success.main' : 'inherit' }}>
                      {isNumber(formik.values.password) ? <TickCircle /> : <Minus />}
                    </ListItemIcon>
                    <ListItemText primary="Almeno un numero (0-9)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ color: isSpecialChar(formik.values.password) ? 'success.main' : 'inherit' }}>
                      {isSpecialChar(formik.values.password) ? <TickCircle /> : <Minus />}
                    </ListItemIcon>
                    <ListItemText primary="Almeno un carattere speciale" />
                  </ListItem>
                </List>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormikProvider>
    </MainCard>
  );
};

export default TabPassword;
