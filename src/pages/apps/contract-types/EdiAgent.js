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

  const CustomerSchema = Yup.object().shape({
    name: Yup.string().max(255).required('Nome è un campo obbligatorio'),
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
          id: customer.id,
          name: values.name,
          hidden: values.hidden
        }
        const response = await axios.put('/contract-types/update', new_agent);
        const { contractType } = response.data;
        if (contractType) {
          // dispatch(openSnackbar('Customer Added Successfully'));
          dispatch(
            openSnackbar({
              open: true,
              message: 'Servizio modificato con successo!',
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
            message: 'Errore durante l\'aggiunta del Servizio. Riprova più tardi.',
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

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, values } = formik;


  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{"Modifica Servizio"}</DialogTitle>
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
                <Grid item xs={12}>
                  <Stack spacing={1.25}>
                    <ListItem divider>
                      <ListItemText
                        id="switch-list-label-sb"
                        primary="Disabilita servizio"
                        secondary="Disabilitando il servizio non verrà più visualizzata nel sistema"
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
