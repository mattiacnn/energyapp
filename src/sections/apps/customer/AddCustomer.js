import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'utils/axios';
// third-party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project-imports
import AlertCustomerDelete from './AlertCustomerDelete';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { ThemeMode } from 'config';

// assets
import { Camera, Trash } from 'iconsax-react';


// constant
const getInitialValues = (customer) => {
  const newCustomer = {
    name: '',
    email: '',
    location: '',
    orderStatus: '',
  };

  if (customer) {
    newCustomer.first_name = customer.first_name;
    newCustomer.last_name = customer.last_name;

    return _.merge({}, newCustomer, customer);
  }
  console.log("newCustomer ", newCustomer)

  return newCustomer;
};

const allStatus = ['Complicated', 'Single', 'Relationship'];

// ==============================|| CUSTOMER - ADD / EDIT ||============================== //

const AddCustomer = ({ customer, onCancel, fetchCustomers }) => {
  const theme = useTheme();
  const isCreating = !customer;

  const [agentList, setAgentList] = useState([]);
  const CustomerSchema = Yup.object().shape({
    first_name: Yup.string().max(255).required('Nome è un campo obbligatorio'),
    last_name: Yup.string().max(255).required('Cognome è un campo obbligatorio'),
    email: Yup.string().max(255).required('Email è un campo obbligatorio').email('Inserisci una email valida'),
    phone: Yup.string().max(255).required('Telefono è un campo obbligatorio'),
    address: Yup.string().max(255).required('Indirizzo è un campo obbligatorio'),
    city: Yup.string().max(255).required('Città è un campo obbligatorio'),
    zip: Yup.string().max(255).required('CAP è un campo obbligatorio'),
    notes: Yup.string().max(255)
  });

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    onCancel();
  };

  const fetchAgents = async () => {
    try {
      const response = await axios.get('/agent/list');
      const { agents } = response.data;
      setAgentList(agents);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);


  const formik = useFormik({
    initialValues: getInitialValues(customer),
    validationSchema: CustomerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const new_client = {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          city: values.city,
          agent: values.agent,
          address: values.address,
          zip: values.zip,
          phone: values.phone,
          notes: values.notes
        }
        const response = await axios.post('/client/create', new_client);
        const { client } = response.data;
        if (client) {
          // dispatch(openSnackbar('Customer Added Successfully'));
          dispatch(
            openSnackbar({
              open: true,
              message: 'Cliente aggiunto con successo!',
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: false
            })
          );
          onCancel();
          setSubmitting(false);
          fetchCustomers();
        }
        else if (response.message) {
          dispatch(
            openSnackbar({
              open: true,
              message: "Questa email è già stata utilizzata. Inserisci un'altra email.",
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: false
            })
          );
        }
      } catch (error) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Errore durante l\'aggiunta del cliente. Riprova più tardi.',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: false
          })
        );
        console.error(error);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{customer ? 'Modifica' : 'Nuovo'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="first_name">Nome</InputLabel>
                        <TextField
                          fullWidth
                          id="first_name"
                          {...getFieldProps('first_name')}
                          error={Boolean(touched.first_name && errors.first_name)}
                          helperText={touched.first_name && errors.first_name}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="last_name">Cognome</InputLabel>
                        <TextField
                          fullWidth
                          id="last_name"
                          placeholder="Inserisci cognome"
                          {...getFieldProps('last_name')}
                          error={Boolean(touched.last_name && errors.last_name)}
                          helperText={touched.last_name && errors.last_name}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="customer-email">Email</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-email"
                          placeholder="Inserisci email"
                          {...getFieldProps('email')}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && errors.email}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="customer-email">Telefono</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-phone"
                          placeholder="Inserisci telefono"
                          {...getFieldProps('phone')}
                          error={Boolean(touched.phone && errors.phone)}
                          helperText={touched.phone && errors.phone}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="customer-email">Indirizzo</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-address"
                          placeholder="Inserisci Indirizzo"
                          {...getFieldProps('address')}
                          error={Boolean(touched.address && errors.address)}
                          helperText={touched.address && errors.address}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="customer-email">Città</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-city"
                          placeholder="Inserisci Città"
                          {...getFieldProps('city')}
                          error={Boolean(touched.city && errors.city)}
                          helperText={touched.city && errors.city}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="customer-zip">Cap</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-zip"
                          placeholder="Inserisci Cap"
                          {...getFieldProps('zip')}
                          error={Boolean(touched.zip && errors.zip)}
                          helperText={touched.zip && errors.zip}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="customer-zip">Agente associato</InputLabel>
                        <Select
                          displayEmpty
                          name="agent"
                          {...getFieldProps('agent')}
                          error={Boolean(errors.agent && touched.agent)}
                        >
                          <MenuItem disabled value="">
                            Seleziona un agente
                          </MenuItem>
                          {agentList?.map((agent) => (
                            <MenuItem key={agent.id} value={agent.id}>
                              {agent.first_name} {agent.last_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="customer-location">Note</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-location"
                          multiline
                          rows={2}
                          placeholder="Inserisci note"
                          {...getFieldProps('location')}
                          error={Boolean(touched.location && errors.location)}
                          helperText={touched.location && errors.location}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  {!isCreating && (
                    <Tooltip title="Delete Customer" placement="top">
                      <IconButton onClick={() => setOpenAlert(true)} size="large" color="error">
                        <Trash variant="Bold" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button color="error" onClick={onCancel}>
                      Chiudi
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {customer ? 'Modifica' : 'Aggiungi'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
      {!isCreating && <AlertCustomerDelete title={customer.fatherName} open={openAlert} handleClose={handleAlertClose} />}
    </>
  );
};

AddCustomer.propTypes = {
  customer: PropTypes.any,
  onCancel: PropTypes.func,
  fetchCustomers: PropTypes.func
};

export default AddCustomer;
