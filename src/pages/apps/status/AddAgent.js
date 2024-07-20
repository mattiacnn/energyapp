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

import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { ThemeMode } from 'config';

// assets
import { Camera, Trash } from 'iconsax-react';
import AlertAgentDelete from './AlertAgentDelete';


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

const AddAgent = ({ customer, onCancel, fetchAgents }) => {
  const theme = useTheme();
  const isCreating = !customer;
  const [contractTypes, setContractTypes] = useState([]);

  const CustomerSchema = Yup.object().shape({
    name: Yup.string().max(255).required('Nome è un campo obbligatorio'),
  });

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    onCancel();
  };

  const formik = useFormik({
    initialValues: getInitialValues(customer),
    validationSchema: CustomerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const new_agent = {
          name: values.name,
        }
        const response = await axios.post('/status/create', new_agent);
        const { newStatus } = response.data;
        if (newStatus) {
          // dispatch(openSnackbar('Customer Added Successfully'));
          dispatch(
            openSnackbar({
              open: true,
              message: 'stato aggiunta con successo!',
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: false
            })
          );
          onCancel();
          setSubmitting(false);
          fetchAgents();
        }
      } catch (error) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Errore durante l\'aggiunta del stato. Riprova più tardi.',
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
  const fetchContractTypes = async () => {
    try {
      const response = await axios.get('/status/list');
      const { status } = response.data;
      setContractTypes(contractTypes);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchContractTypes();
  }, []);

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{customer ? 'Modifica' : 'Nuovo stato'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="name">Nome</InputLabel>
                        <TextField
                          fullWidth
                          id="name"
                          {...getFieldProps('name')}
                          error={Boolean(touched.name && errors.name)}
                          helperText={touched.name && errors.name}
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
      {!isCreating && <AlertAgentDelete title={customer.fatherName} open={openAlert} handleClose={handleAlertClose} />}
    </>
  );
};

AddAgent.propTypes = {
  customer: PropTypes.any,
  onCancel: PropTypes.func
};

export default AddAgent;
