import { useEffect, useState, useRef } from 'react';

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
import { dispatch } from 'store';
import { selectClient, updateClient } from 'store/reducers/client';
import { useSelector } from 'react-redux';


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
    first_name: '',
    last_name: '',
    company_name: '',
  };
  return newCustomer;
};

// ==============================|| ACCOUNT PROFILE - MY ACCOUNT ||============================== //

const TabContacts = () => {
  const client = useSelector(selectClient);

  const CustomerSchema = Yup.object().shape({
    email: Yup.string().email('Inserisci un indirizzo email valido').required('Inserisci un indirizzo email'),
    phone: Yup.string().required('Inserisci un numero di telefono'),
  });
 
  const formik = useFormik({
    initialValues: getInitialValues(client),
    validationSchema: CustomerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log(values);
        const new_client = {
          phone: values.phone,
          email: values.email,
        }
        dispatch(updateClient(new_client));
        setSubmitting(false);
      } catch (error) {
        console.error(error);
      }
    }
  });
  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, handleBlur, handleReset} = formik;

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
  }, [])
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title="Contatti">
          <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="email">Email</InputLabel>
                    <TextField
                      id="email"
                      onBlur={handleBlur}
                      onReset={handleReset}
                      value={client.email || ''}
                      onChange={(e) => handleChange('email', e)}
                      type='email'
                      error={Boolean(touched.email && errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="phone">Cellulare</InputLabel>
                    <TextField
                      id="phone"
                      onBlur={handleBlur}
                      onReset={handleReset}
                      value={client.phone || ''}
                      onChange={(e) => handleChange('phone', e)}
                      error={Boolean(touched.phone && errors.phone)}
                      helperText={touched.phone && errors.phone}
                      type='tel'
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="pec">Pec</InputLabel>
                    <TextField
                      id="pec"
                      onBlur={handleBlur}
                      onReset={handleReset}
                      value={client.pec || ''}
                      onChange={(e) => handleChange('pec', e)}
                      type='pec'
                      error={Boolean(touched.pec && errors.pec)}
                      helperText={touched.pec && errors.pec}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Form>
          </FormikProvider>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default TabContacts;
