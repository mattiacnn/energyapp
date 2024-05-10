import { useEffect, useState, useRef } from 'react';

// material-ui
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
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
import { selectAgent, updateAgent } from 'store/reducers/agent';
import axios from 'utils/axios';


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

const TabProviders = () => {
  const client = useSelector(selectAgent);
  const [providers, setProviders] = useState([]);

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

  const handleChange = ( event, providerId) => {
    const { checked } = event.target;
    let providers = client.providers || [];


    if (checked) {
      providers = [...providers, providerId];
    } else {
      providers = providers.filter((id) => id !== providerId);
    }
 
    const newClient = { ...client, providers };
    dispatch(updateAgent(newClient));
    setFieldValue('providers', providers);
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

  useEffect(() => {
    // on leave
    return () => {
      formik.submitForm();
    }
  }, [])

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title="Fornitori">
          <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <FormGroup>
                      {
                        providers?.map((provider, index) => (
                          <FormControlLabel
                            key={index}
                            control={
                              <Checkbox
                                checked={client.providers?.includes(provider.id)}
                                onChange={(event) => handleChange(event, provider.id)}
                              />}
                            label={provider.name} />
                        ))
                      }
                    </FormGroup>

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

export default TabProviders;
