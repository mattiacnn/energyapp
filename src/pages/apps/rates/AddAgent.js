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
import RatesTypesList from '../ratesTypes/list';


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
  const [providers, setProviders] = useState([]);
  const [ratesTypes, setRatesTypes] = useState([]);

  const CustomerSchema = Yup.object().shape({
    name: Yup.string().max(255).required('Nome è un campo obbligatorio'),
    rate_type_id: Yup.number().default(1).required('Tipo tariffa è un campo obbligatorio'),
    agent_bonus: Yup.number().default(0),
    agent_monthly_fee: Yup.number().default(0),
    agent_monthly_fee_2: Yup.number().default(0),
    agent_bonus_2: Yup.number().default(0),
    contract_type_id: Yup.number().default(1).required('Servizio è un campo obbligatorio'),
    provider_id: Yup.number().required('Fornitore è un campo obbligatorio'),
    is_business: Yup.boolean().default(false)
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
          agent_bonus: values.agent_bonus,
          agent_monthly_fee: values.agent_monthly_fee,
          agent_monthly_fee_2: values.agent_monthly_fee_2,
          agent_bonus_2: values.agent_bonus_2,
          contract_type_id: values.contract_type_id,
          provider_id: values.provider_id,
          rate_type_id: values.rate_type_id,
          is_business: values.is_business
        }
        const response = await axios.post('/rate/create', new_agent);
        const { newRate } = response.data;
        if (newRate) {
          // dispatch(openSnackbar('Customer Added Successfully'));
          dispatch(
            openSnackbar({
              open: true,
              message: 'Tariffa aggiunta con successo!',
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
            message: 'Errore durante l\'aggiunta della tariffa. Riprova più tardi.',
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
      const response = await axios.get('/contract-types/list');
      const { contractTypes } = response.data;
      setContractTypes(contractTypes);
    } catch (error) {
      console.error(error);
    }
  }
  const fetchProviders = async () => {
    try {
      const response = await axios.get('/provider/list');
      const { providers } = response.data;
      setProviders(providers);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchRatesTypes = async () => {
    try {
      const response = await axios.get('/rate-type/list');
      const { rate_types } = response.data;
      setRatesTypes(rate_types);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    fetchContractTypes();
    fetchProviders();
    fetchRatesTypes();
  }, []);

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{customer ? 'Modifica' : 'Nuova tariffa'}</DialogTitle>
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
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="provider_id">Fornitore</InputLabel>
                        <Select
                          displayEmpty
                          name="provider_id"
                          {...getFieldProps('provider_id')}
                          error={Boolean(errors.provider_id && touched.provider_id)}
                        >
                          <MenuItem disabled value="">
                            Seleziona fornitore
                          </MenuItem>
                          {providers?.map((provider) => (
                            <MenuItem key={provider.id} value={provider.id}>
                              {provider.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="is_business">Tariffa business</InputLabel>
                        <Select
                          displayEmpty
                          name="is_business"
                          {...getFieldProps('is_business')}
                          error={Boolean(errors.is_business && touched.is_business)}
                        >
                          <MenuItem disabled value="">
                            Selezione setariffa business
                          </MenuItem>
                          <MenuItem value={true}>
                            Sì
                          </MenuItem>
                          <MenuItem value={false}>
                            No
                          </MenuItem>

                        </Select>
                      </Stack>
                    </Grid>

                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="rate_type_id">Tipo di tariffa</InputLabel>
                        <Select
                          displayEmpty
                          name="rate_type_id"
                          {...getFieldProps('rate_type_id')}
                          error={Boolean(errors.rate_type_id && touched.rate_type_id)}
                        >
                          <MenuItem disabled value="">
                            Seleziona tipo di tariffa
                          </MenuItem>
                          {ratesTypes?.map((rateType) => (
                            <MenuItem key={rateType.id} value={rateType.id}>
                              {rateType.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </Stack>
                    </Grid>

                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="contract_type_id">Servizio</InputLabel>
                        <Select
                          displayEmpty
                          name="contract_type_id"
                          {...getFieldProps('contract_type_id')}
                          error={Boolean(errors.contract_type_id && touched.contract_type_id)}
                        >
                          <MenuItem disabled value="">
                            Seleziona tipo contratto
                          </MenuItem>
                          {contractTypes?.map((contractType) => (
                            <MenuItem key={contractType.id} value={contractType.id}>
                              {contractType.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="agent_bonus">Gettone</InputLabel>
                        <TextField
                          fullWidth
                          id="agent_bonus"
                          placeholder="Inserisci bonus"
                          {...getFieldProps('agent_bonus')}
                          error={Boolean(touched.agent_bonus && errors.agent_bonus)}
                          helperText={touched.agent_bonus && errors.agent_bonus}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="agent_monthly_fee">Ricorenza</InputLabel>
                        <TextField
                          fullWidth
                          id="agent_monthly_fee"
                          placeholder="Inserisci ricorrenza"
                          {...getFieldProps('agent_monthly_fee')}
                          error={Boolean(touched.agent_monthly_fee && errors.agent_monthly_fee)}
                          helperText={touched.agent_monthly_fee && errors.agent_monthly_fee}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="agent_monthly_fee_2">Ricorenza 13 mese</InputLabel>
                        <TextField
                          fullWidth
                          id="agent_monthly_fee_2"
                          placeholder="Inserisci ricorrenza 13 mese"
                          {...getFieldProps('agent_monthly_fee_2')}
                          error={Boolean(touched.agent_monthly_fee_2 && errors.agent_monthly_fee_2)}
                          helperText={touched.agent_monthly_fee_2 && errors.agent_monthly_fee_2}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="agent_bonus_2">Gettone 13 mese</InputLabel>
                        <TextField
                          fullWidth
                          id="agent_bonus_2"
                          placeholder="Inserisci bonus 13 mese"
                          {...getFieldProps('agent_bonus_2')}
                          error={Boolean(touched.agent_bonus_2 && errors.agent_bonus_2)}
                          helperText={touched.agent_bonus_2 && errors.agent_bonus_2}
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
