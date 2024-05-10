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
  TextareaAutosize,
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

const TabNotes = () => {
  const client = useSelector(selectClient);

  const CustomerSchema = Yup.object().shape({
    notes: Yup.string()
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
                    <InputLabel htmlFor="notes">Note</InputLabel>
                    <TextareaAutosize
                      minRows={3}
                      style={{
                        borderColor: "rgba(219, 224, 229, 0.65)",
                      }}
                      id="notes"
                      onBlur={handleBlur}
                      onReset={handleReset}
                      value={client.notes || ''}
                      onChange={(e) => handleChange('notes', e)}
                      type='notes'
                      error={Boolean(touched.notes && errors.notes)}
                      helperText={touched.notes && errors.notes}
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

export default TabNotes;
