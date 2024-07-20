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
  Typography,
  ListItem
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
import { Camera, Edit, Trash } from 'iconsax-react';
import AlertAgentDelete from './AlertAgentDelete';


// constant
// ==============================|| CUSTOMER - ADD / EDIT ||============================== //

const EditAgent = ({ customer, onCancel, fetchAgents }) => {
  const theme = useTheme();
  const isCreating = !customer;

  const [selectedImage, setSelectedImage] = useState(undefined);
  const [provider, setProvider] = useState('');
  const [contractType, setContractType] = useState('');

  const CustomerSchema = Yup.object().shape({
    name: Yup.string().max(255).required('Nome è un campo obbligatorio'),
    agent_bonus: Yup.number().default(0).nullable(),
    agent_monthly_fee: Yup.number().default(0).nullable(),
    agent_monthly_fee_2: Yup.number().default(0).nullable(),
    agent_bonus_2: Yup.number().default(0).nullable()
  });

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    onCancel();
  };

  const formik = useFormik({
    initialValues: customer,
    validationSchema: CustomerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const new_agent = {
          name: values.name,
          agent_bonus: values.agent_bonus,
          agent_monthly_fee: values.agent_monthly_fee,
          agent_monthly_fee_2: values.agent_monthly_fee_2,
          agent_bonus_2: values.agent_bonus_2,
          hidden: values.hidden,
          id: customer.id
        }
        const response = await axios.put('/rate-type/update', new_agent);
        const { rateType } = response.data;
        if (rateType) {
          // dispatch(openSnackbar('Customer Added Successfully'));
          dispatch(
            openSnackbar({
              open: true,
              message: 'Tariffa modificato con successo!',
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

  const fetchProvider = async () => {
    try {
      const response = await axios.get('/provider/' + customer.provider_id);
      const { providers } = response.data;
      setProvider(providers);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchContractType = async () => {
    try {
      const response = await axios.get('/contract-types/' + customer.contract_type_id);
      const { contractType } = response.data;
      setContractType(contractType);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (customer.provider_id && customer.contract_type_id) {
      fetchProvider();
      fetchContractType();
    }

  }, [customer])

  useEffect(() => {
    console.log("provider is",provider);
    console.log("service si", contractType);
  },[provider, contractType])
  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, values } = formik;

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{"Modifica Tariffa"}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
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
                        <ListItem divider>
                          <ListItemText
                            id="switch-list-label-sb"
                            primary="Disabilita tipo di tariffa tariffa"
                            secondary="Disabilitando il tipo di tariffa non verrà più visualizzata nel sistema"
                          />
                          <Switch
                            edge="end"
                            onChange={(e) => setFieldValue('hidden', e.target.checked)}
                            checked={values.hidden}
                            inputProps={{
                              'aria-labelledby': 'switch-list-label-sb'
                            }}
                          />
                        </ListItem>
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
                      modifica
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

EditAgent.propTypes = {
  customer: PropTypes.any,
  onCancel: PropTypes.func
};

export default EditAgent;
