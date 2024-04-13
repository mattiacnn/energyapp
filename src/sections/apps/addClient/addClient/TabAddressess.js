import { useEffect, useState } from 'react';

// material-ui
import {
  Box,
  Button,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import { selectClient, updateClient } from 'store/reducers/client';
import { dispatch } from 'store';
import { useSelector } from 'store';


// styles & constant
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
};
const getInitialValues = (customer) => {
  if (customer) return customer;
  const newCustomer = {
    name: '',
    email: '',
    location: '',
    orderStatus: '',
  };
  return newCustomer;
};

// ==============================|| ACCOUNT PROFILE - MY ACCOUNT ||============================== //

const TabAccount = () => {
  const [signing, setSigning] = useState('facebook');
  const client = useSelector(selectClient);

  const CustomerSchema = Yup.object().shape({
    address: Yup.string().max(255).required('Indirizzo è un campo obbligatorio'),
    city: Yup.string().max(255).required('Città è un campo obbligatorio'),
    zip: Yup.string().max(255).required('CAP è un campo obbligatorio'),
  });


  const [checked, setChecked] = useState(client.address2 ? false : true);

  const formik = useFormik({
    initialValues: getInitialValues(client),
    validationSchema: CustomerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const new_client = {
          address: values.address,
          city: values.city,
          zip: values.zip,
          country: values.country,
          address2: values.address2,
          city2: values.city2,
          zip2: values.zip2,
          country2: values.country2,
        }
        dispatch(updateClient(new_client));
        setSubmitting(false);
      } catch (error) {
        console.error(error);
      }
    }
  });
  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, handleBlur, handleReset } = formik;

  const handleChange = (key, event) => {
    const { value } = event.target;
    const newClient = { ...client, [key]: value };
    dispatch(updateClient(newClient));
    setFieldValue(key, value);
  }

  useEffect(() => {
    // on leave
    return () => {
      formik.submitForm();
    }
  }, []);

  useEffect(() => {
    if (checked) {
      setFieldValue('address2', '');
      setFieldValue('city2', '');
      setFieldValue('zip2', '');
      setFieldValue('country2', '');
    }
  }, [checked]);


  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title="Sede legale">
          <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="address">Indirizzo</InputLabel>
                    <TextField

                      id="address"
                      onBlur={handleBlur}
                      onReset={handleReset}
                      value={client.address || ''}
                      onChange={(e) => handleChange('address', e)}
                      error={Boolean(touched.address && errors.address)}
                      helperText={touched.address && errors.address}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="zip">Cap</InputLabel>
                    <TextField
                      id="zip"
                      value={client.zip || ''}
                      {...getFieldProps('zip')}
                      error={Boolean(touched.zip && errors.zip)}
                      helperText={touched.zip && errors.zip}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="city">Città</InputLabel>
                    <TextField
                      id="city"
                      onBlur={handleBlur}
                      value={client.city || ''}
                      onReset={handleReset}
                      onChange={(e) => handleChange('city', e)}
                      error={Boolean(touched.city && errors.city)}
                      helperText={touched.city && errors.city}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="country">Provincia</InputLabel>
                    <TextField
                      id="country"
                      onBlur={handleBlur}
                      onReset={handleReset}
                      value={client.country || ''}
                      onChange={(e) => handleChange('country', e)}
                      error={Boolean(touched.country && errors.country)}
                      helperText={touched.country && errors.country}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Form>
          </FormikProvider>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={12}>
        <MainCard title="Sede amministrativa" content={false}>
          <List sx={{ p: 0 }}>
            <ListItem divider>
              <ListItemText
                id="switch-list-label-sb"
                primary="Uguale a sede legale"
                secondary=""
              />
              <Switch
                edge="end"
                onChange={() => setChecked(!checked)}
                checked={checked}
                inputProps={{
                  'aria-labelledby': 'switch-list-label-sb'
                }}
              />
            </ListItem>
          </List>
          {!checked && (
            <div style={{ padding: 20 }}>
              <FormikProvider value={formik}>
                <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="address2">Indirizzo</InputLabel>
                        <TextField
                          id="address2"
                          value={client.address2 || ''}
                          onBlur={handleBlur}
                          onReset={handleReset}
                          onChange={(e) => handleChange('address2', e)}
                          error={Boolean(touched.address2 && errors.address2)}
                          helperText={touched.address2 && errors.address2}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="zip2">Cap</InputLabel>
                        <TextField
                          id="zip2"
                          onBlur={handleBlur}
                          value={client.zip2 || ''}
                          onReset={handleReset}
                          onChange={(e) => handleChange('zip2', e)}
                          error={Boolean(touched.zip2 && errors.zip2)}
                          helperText={touched.zip2 && errors.zip2}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="city2">Città</InputLabel>
                        <TextField
                          id="city2"
                          onBlur={handleBlur}
                          value={client.city2 || ''}
                          onReset={handleReset}
                          onChange={(e) => handleChange('city2', e)}
                          error={Boolean(touched.city2 && errors.city2)}
                          helperText={touched.city2 && errors.city2}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="country2">Provincia</InputLabel>
                        <TextField
                          id="country2"
                          onBlur={handleBlur}
                          value={client.country2 || ''}
                          onReset={handleReset}
                          onChange={(e) => handleChange('country2', e)}
                          error={Boolean(touched.country2 && errors.country2)}
                          helperText={touched.country2 && errors.country2}
                        />
                      </Stack>
                    </Grid>

                  </Grid>
                </Form>
              </FormikProvider>

            </div>
          )}
        </MainCard>
      </Grid>

    </Grid >
  );
};

export default TabAccount;
