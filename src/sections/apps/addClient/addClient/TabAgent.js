import { useState, useEffect } from 'react';

// material-ui
import {
  Box,
  Button,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Select,
  Stack,
  MenuItem,
  Switch,
  TextField,
  Typography
} from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import axios from 'utils/axios';
import { dispatch } from 'store';
import client, { selectClient, updateClient } from 'store/reducers/client';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';


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
  const newCustomer = {
    name: '',
    email: '',
    location: '',
    orderStatus: '',
  };
  return newCustomer;
};

// ==============================|| ACCOUNT PROFILE - MY ACCOUNT ||============================== //

const TabAgent = () => {
  const [agentList, setAgentList] = useState([]);
  const client = useSelector(selectClient);

  const CustomerSchema = Yup.object().shape({
    agent: Yup.string().max(255).required('agente è un campo obbligatorio')
  });

  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: CustomerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const new_client = {
          agent: values.agent,
        }
        dispatch(updateClient(new_client));
        setSubmitting(false);
        console.error(error);
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

  const navigate = useNavigate();
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
    return () => {
      formik.submitForm();
    }
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title="Agente associato">
          <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="agent">Agente</InputLabel>
                    <Select
                      name="agent"
                      onChange={(e) => handleChange('agent', e)}
                      onBlur={handleBlur}
                      onReset={handleReset}
                      error={Boolean(errors.agent && touched.agent)}
                      value={client.agent || formik.values.agent || ""}
                    >
                      {agentList?.map((agent) => (
                        <MenuItem key={agent.id} value={agent.id}>
                          {agent.first_name} {agent.last_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </Stack>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6} mt={5}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/apps/new-client/create/attachments')}
                  disabled={!(client.agent)}
                >
                  Continua
                </Button>
              </Grid>
            </Form>
          </FormikProvider>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default TabAgent;
