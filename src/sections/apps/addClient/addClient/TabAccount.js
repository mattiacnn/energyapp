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

const TabAccount = () => {
  const client = useSelector(selectClient);

  const CustomerSchema = Yup.object().shape({
    first_name: Yup.string().max(255)
      .when('company_name', {
        is: (company_name) => !company_name || company_name.trim() === '',
        then: () => Yup.string().required('Inserisci il nome o la ragione sociale'),
        otherwise: () => Yup.string().max(255)
      }),
    last_name: Yup.string().max(255)
      .when('company_name', {
        is: (company_name) => !company_name || company_name.trim() === '',
        then: () => Yup.string().required('Inserisci il cognome o la ragione'),
        otherwise: () => Yup.string().max(255)
      }),
    company_name: Yup.string().max(255),
  });


  const [checked, setChecked] = useState([]);

  const handleToggle = (e) => { 
    const isChecked = e.target.checked;
    let event = {
      target: {
        value: isChecked
      }
    }

    handleChange('hidden', event);
  };

  const formik = useFormik({
    initialValues: getInitialValues(client),
    validationSchema: CustomerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log(values);
        const new_client = {
          first_name: values.first_name,
          last_name: values.last_name,
          company_name: values.company_name,
        }
        dispatch(updateClient(new_client));
        setSubmitting(false);
      } catch (error) {
        console.error(error);
      }
    }
  });

  const handleChange = (key, event) => {
    const { value } = event.target;
    const newClient = { ...client, [key]: value };
    dispatch(updateClient(newClient));
    setFieldValue(key, value);
  }
  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, handleBlur, handleReset } = formik;

  useEffect(() => {
    // on leave
    return () => {
      formik.submitForm();
    }
  }, [])
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title="Dati anagrafica">
          <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="first_name">Nome</InputLabel>
                    <TextField
                      id="first_name"
                      onChange={(e) => handleChange('first_name',e)}
                      onBlur={handleBlur}
                      onReset={handleReset}
                      value={client.first_name || ''}
                      error={Boolean(touched.first_name && errors.first_name)}
                      helperText={touched.first_name && errors.first_name}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="last_name">Cognome</InputLabel>
                    <TextField
                      id="last_name"
                      onChange={(e) => handleChange('last_name',e)}
                      onBlur={handleBlur}
                      onReset={handleReset}
                      value={client.last_name || ''}
                      error={Boolean(touched.last_name && errors.last_name)}
                      helperText={touched.last_name && errors.last_name}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="company_name">Ragione sociale</InputLabel>
                    <TextField
                      id="company_name"
                      onChange={(e) => handleChange('company_name',e)}
                      onBlur={handleBlur}
                      onReset={handleReset}
                      value={client.company_name || ''}
                      error={Boolean(touched.company_name && errors.company_name)}
                      helperText={touched.company_name && errors.company_name}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="vat">Partita iva</InputLabel>
                    <TextField
                      id="vat"
                      onChange={(e) => handleChange('vat',e)}
                      onBlur={handleBlur}
                      onReset={handleReset}
                      value={client.vat || ''}
                      error={Boolean(touched.vat && errors.vat)}
                      helperText={touched.vat && errors.vat}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="cf">Codice fiscale</InputLabel>
                    <TextField
                      id="cf"
                      onChange={(e) => handleChange('cf',e)}
                      onBlur={handleBlur}
                      onReset={handleReset}
                      value={client.cf || ''}
                      error={Boolean(touched.cf && errors.cf)}
                      helperText={touched.cf && errors.cf}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Form>
          </FormikProvider>

        </MainCard>
      </Grid>
      <Grid item xs={12} sm={6}>
        <MainCard title="Impostazioni" content={false}>
          <List sx={{ p: 0 }}>
            <ListItem divider>
              <ListItemText
                id="switch-list-label-sb"
                primary="Disabilita cliente"
                secondary="Disabilitando il cliente non sarà più possibile effettuare ordini"
              />
              <Switch
                edge="end"
                onChange={(e) => handleToggle(e)}
                checked={client.hidden}
                inputProps={{
                  'aria-labelledby': 'switch-list-label-sb'
                }}
              />
            </ListItem>
          </List>
        </MainCard>
      </Grid>

    </Grid>
  );
};

export default TabAccount;
