import { useNavigate, useParams } from 'react-router';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import * as yup from 'yup';
import { v4 as UIDV4 } from 'uuid';
import { format } from 'date-fns';
import { FieldArray, Form, Formik, FormikProvider, useFormik } from 'formik';

// project-imports
import MainCard from 'components/MainCard';
import InvoiceItem from 'sections/apps/invoice/InvoiceItem';
import AddressModal from 'sections/apps/invoice/AddressModal';
import InvoiceModal from 'sections/apps/invoice/InvoiceModal';

import incrementer from 'utils/incrementer';
import { dispatch, useSelector } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import {
  customerPopup,
  toggleCustomerPopup,
  selectCountry,
  getInvoiceInsert,
  reviewInvoicePopup,
  getInvoiceList
} from 'store/reducers/invoice';

// assets
import { Add, Edit } from 'iconsax-react';
import axios from 'utils/axios';
import { useEffect, useState } from 'react';

const client_types = [
  {
    name: 'Privato'
  },
  {
    name: 'Azienda'
  },
  {
    name: 'Condominio'
  }
];
const validationSchema = yup.object({
  agent_id: yup.number().required('Agente è obbligatorio'),
  client_id: yup.number().required('Cliente è obbligatorio'),
  rate_id: yup.number().required('Tariffa è obbligatorio'),
  provider_id: yup.number(),
  client_type_id: yup.string().required('Tipo cliente è obbligatorio'),
  contract_type_id: yup.number().required('Tipo contratto è obbligatorio'),
  partita: yup.string().required('Partita è obbligatorio'),
  date: yup.date().required('Data di sottoscrizione è obbligatorio'),
  due_date: yup.date().required('Inizio fornitura è obbligatorio'),
  cod: yup.string().required('Cod è obbligatorio'),
  pod: yup.string().required('Pod è obbligatorio'),
  pdr: yup.string().required('Pdr è obbligatorio'),
  power: yup.string().required('Potenza è obbligatorio'),
  annual_consumption: yup.string().required('Consumo annuo è obbligatorio'),
  discount: yup.number().nullable().default(0),
  discount2: yup.number().nullable().default(0),
});

// ==============================|| INVOICE - CREATE ||============================== //

const CreateNoClient = () => {
  const theme = useTheme();
  const navigation = useNavigate();
  const notesLimit = 500;
  const [rates, setRates] = useState([{}]);
  const [client, setClient] = useState({});
  const [clients, setClients] = useState([{}]);
  const [agent, setAgent] = useState({});
  const [providers, setProviders] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [selectedRates, setSelectedRates] = useState([]);
  const { open, isCustomerOpen } = useSelector((state) => state.invoice);
  const [agents, setAgents] = useState([]);
  const [methods, setMethods] = useState([]);

  // get client_id parameter from url

  const handlerCreate = async (values) => {
    const new_contract = {
      agent_id: values.agent_id,
      client_id: values.client_id,
      rate_id: values.rate_id,
      provider_id: values.provider_id,
      partita: values.partita,
      client_type: values.client_type_id,
      contract_type_id: values.contract_type_id,
      payment_method: values.payment_method,
      date: format(values.date, 'yyyy-MM-dd'),
      due_date: format(values.due_date, 'yyyy-MM-dd'),
      cod: values.cod,
      pod: values.pod,
      pdr: values.pdr,
      power: values.power,
      annual_consumption: values.annual_consumption,
      discount: values.discount,
      discount2: values.discount2
    };
    try {
      const response = await axios.post('/contract/create', new_contract);
      navigation('/apps/contracts/contracts-list');
    } catch (error) {
      console.error(error);
    }

  };

  const fetchRates = async () => {
    try {
      const response = await axios.get('/rate/list');
      const { rates } = response.data;
      setRates(rates);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchClient = async () => {
    try {
      const response = await axios.get('/client/' + client_id);
      const { client } = response.data;

      setClient(client);
      if (client.agent) {
        fetchAgent(client.agent);
      }
    } catch (error) {
      console.error(error);
    }
  }
  const fetchMethod = async () => {
    try {
      const response = await axios.get('/pmethod/list');
      const { pmethods } = response.data;
      setMethods(pmethods);
    } catch (error) {
      console.error(error);
    }
  }
  const fetchClients = async () => {
    try {
      const response = await axios.get('/client/list');
      const { clients } = response.data;

      setClients(clients);
      if (client.agent) {
        fetchAgent(client.agent);
      }
    } catch (error) {
      console.error(error);
    }
  }
  const fetchAgents = async () => {
    try {
      const response = await axios.get('/agent/list');
      const { agents } = response.data;
      setAgents(agents);
    } catch (error) {
      console.error(error);
    }
  }
  const fetchAgent = async (agent_id) => {
    try {
      const response = await axios.get('/agent/' + agent_id);
      const { agent } = response.data;
      setAgent(agent);
    } catch (error) {
      console.error(error);
    }
  }

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
  const handleChangeContractType = (setFieldValue, value) => {
    setFieldValue('contract_type_id', value);
    const filteredRates = rates.filter((rate) => rate.contract_type_id === Number(value));
    setSelectedRates(filteredRates);
  }

  useEffect(() => {
    fetchRates();
    fetchContractTypes();
    fetchAgents();
    fetchClients();
    fetchProviders();
    fetchMethod();
  }, []);

  const formik = useFormik({
    initialValues: {
      agent_id: '',
      client_id: '',
      rate_id: '',
      provider_id: '',
      client_type_id: '',
      contract_type_id: '',
      partita: '',
      date: new Date(),
      due_date: new Date(),
      cod: '',
      pod: '',
      pdr: '',
      power: '',
      annual_consumption: '',
      discount: 0,
      discount2: 0
    },
    validationSchema: validationSchema,
    onSubmit: handlerCreate
  });

  const { handleBlur, errors, handleChange, handleSubmit, values, isValid, setFieldValue, touched } = formik;

  useEffect(() => {
    if (values.client_id) {
      setClient(clients.find((client) => client.id === values.client_id));
    }
  },[values.client_id])

  useEffect(() => {
    if (values.agent_id) {
      setAgent(agents.find((agent) => agent.id === values.agent_id));
    }
  },[values.agent_id])

  return (
    <MainCard>
      {
        rates ?
          <FormikProvider value={formik}>
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Data di sottoscrizione</InputLabel>
                    <FormControl sx={{ width: '100%' }} error={Boolean(touched.date && errors.date)}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker format="dd/MM/yyyy" value={values.date} onChange={(newValue) => setFieldValue('date', newValue)} />
                      </LocalizationProvider>
                    </FormControl>
                  </Stack>
                  {touched.date && errors.date && <FormHelperText error={true}>{errors.date}</FormHelperText>}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Tipologia</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <Select
                        displayEmpty
                        name="type"
                        onChange={handleChange}
                        error={Boolean(errors.type && touched.type)}
                      >
                        <MenuItem disabled value="">
                          Seleziona tipologia
                        </MenuItem>
                        <MenuItem value={"switch"}>
                          Switch
                        </MenuItem>
                        <MenuItem value={"voltura"}>
                          Voltura
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                  {touched.type && errors.type && <FormHelperText error={true}>{errors.type}</FormHelperText>}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Vecchio fornitore</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <Select
                        value={values.provider_id}
                        displayEmpty
                        name="provider_id"
                        onChange={handleChange}
                        error={Boolean(errors.provider_id && touched.provider_id)}
                      >
                        <MenuItem disabled value="">
                          Seleziona un fornitore
                        </MenuItem>
                        {providers?.map((provider) => (
                          <MenuItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  {touched.status && errors.status && <FormHelperText error={true}>{errors.status}</FormHelperText>}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Partita</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        id="partita"
                        name="partita"
                        value={values.partita}
                        onChange={handleChange}
                        error={Boolean(touched.partita && errors.partita)}
                        helperText={touched.partita && errors.partita}
                      />

                    </FormControl>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Cod</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        id="cod"
                        name="cod"
                        value={values.cod}
                        onChange={handleChange}
                        error={Boolean(touched.cod && errors.cod)}
                        helperText={touched.cod && errors.cod}
                      />

                    </FormControl>
                  </Stack>
                  {touched.status && errors.status && <FormHelperText error={true}>{errors.status}</FormHelperText>}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Pod</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        id="pod"
                        name="pod"
                        value={values.pod}
                        onChange={handleChange}
                        error={Boolean(touched.pod && errors.pod)}
                        helperText={touched.pod && errors.pod}
                      />

                    </FormControl>
                  </Stack>
                  {touched.status && errors.status && <FormHelperText error={true}>{errors.status}</FormHelperText>}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Pdr</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        id="pdr"
                        name="pdr"
                        value={values.pdr}
                        onChange={handleChange}
                        error={Boolean(touched.pdr && errors.pdr)}
                        helperText={touched.pdr && errors.pdr}
                      />

                    </FormControl>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Inizio fornitura</InputLabel>
                    <FormControl sx={{ width: '100%' }} error={Boolean(touched.due_date && errors.due_date)}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          format="dd/MM/yyyy"
                          value={values.due_date}
                          onChange={(newValue) => setFieldValue('due_date', newValue)}
                        />
                      </LocalizationProvider>
                    </FormControl>
                  </Stack>
                  {touched.due_date && errors.due_date && <FormHelperText error={true}>{errors.due_date}</FormHelperText>}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Potenza</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        id="power"
                        name="power"
                        value={values.power}
                        onChange={handleChange}
                        error={Boolean(touched.power && errors.power)}
                        helperText={touched.power && errors.power}
                      />

                    </FormControl>
                  </Stack>
                  {touched.status && errors.status && <FormHelperText error={true}>{errors.status}</FormHelperText>}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Consumo annuo</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        id="annual_consumption"
                        name="annual_consumption"
                        value={values.annual_consumption}
                        onChange={handleChange}
                        error={Boolean(touched.annual_consumption && errors.annual_consumption)}
                        helperText={touched.annual_consumption && errors.annual_consumption}
                      />

                    </FormControl>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Tipo contratto</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <Select
                        value={values.rate}
                        displayEmpty
                        name="contract_type_id"
                        onChange={(e) => handleChangeContractType(setFieldValue, e.target.value)}
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
                    </FormControl>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Offerta</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <Select
                        value={values.rate}
                        displayEmpty
                        disabled={selectedRates.length === 0}
                        name="rate_id"
                        onChange={handleChange}
                        error={Boolean(errors.rate_id && touched.rate_id)}
                      >
                        <MenuItem disabled value="">
                          Seleziona tariffa
                        </MenuItem>
                        {selectedRates?.map((rate) => (
                          <MenuItem key={rate.id} value={rate.id}>
                            {rate.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  {touched.status && errors.status && <FormHelperText error={true}>{errors.status}</FormHelperText>}
                </Grid>

                <Grid item xs={12} sm={6} md={client?.id ? 6 : 3}>
                  {
                    client && client.id ?
                      <MainCard sx={{ minHeight: 168 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={8}>
                            <Stack spacing={2}>
                              <Typography variant="h5">Cliente:</Typography>
                              <Stack sx={{ width: '100%' }}>
                                <Typography variant="subtitle1">{client?.first_name}</Typography>
                                <Typography variant="subtitle1">{client?.last_name}</Typography>
                                <Typography color="secondary">{client?.address}</Typography>
                                <Typography color="secondary">{client?.phone}</Typography>
                                <Typography color="secondary">{client?.email}</Typography>
                              </Stack>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box textAlign={{ xs: 'left', sm: 'right' }} color="secondary.200">
                              <AddressModal
                                open={open}
                                setOpen={(value) =>
                                  dispatch(
                                    toggleCustomerPopup({
                                      open: value
                                    })
                                  )
                                }
                                handlerAddress={(address) => setFieldValue('cashierInfo', address)}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </MainCard>
                      :
                      <Stack spacing={1}>
                        <InputLabel>Cliente</InputLabel>
                        <FormControl sx={{ width: '100%' }}>
                          <Select
                            value={values.client_id}
                            displayEmpty
                            name="client_id"
                            onChange={handleChange}
                            error={Boolean(errors.client_id && touched.client_id)}
                          >
                            <MenuItem disabled value="">
                              Seleziona cliente
                            </MenuItem>
                            {clients?.map((client) => (
                              <MenuItem key={client.id} value={client.id}>
                                {client.first_name + ' ' + client.last_name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                  }

                </Grid>
                <Grid item xs={12} sm={6} md={agent?.id ? 6 : 3}>
                  {
                    agent && agent.id ?
                      <MainCard sx={{ minHeight: 168 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={8}>
                            <Stack spacing={2}>
                              <Typography variant="h5">Agente:</Typography>
                              <Stack sx={{ width: '100%' }}>
                                <Typography variant="subtitle1">{agent?.first_name}</Typography>
                                <Typography variant="subtitle1">{agent?.last_name}</Typography>
                                <Typography color="secondary">{agent?.address}</Typography>
                                <Typography color="secondary">{agent?.phone}</Typography>
                                <Typography color="secondary">{agent?.email}</Typography>
                              </Stack>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box textAlign="right" color="secondary.200">
                              <AddressModal
                                open={isCustomerOpen}
                                setOpen={(value) =>
                                  dispatch(
                                    customerPopup({
                                      isCustomerOpen: value
                                    })
                                  )
                                }
                                handlerAddress={(value) => setFieldValue('customerInfo', value)}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </MainCard>
                      :
                      <Stack spacing={1}>
                        <InputLabel>Agente</InputLabel>
                        <FormControl sx={{ width: '100%' }}>
                          <Select
                            value={values.agent_id}
                            displayEmpty
                            name="agent_id"
                            onChange={handleChange }
                            error={Boolean(errors.agent_id && touched.agent_id)}
                          >
                            <MenuItem disabled value="">
                              Seleziona agente
                            </MenuItem>
                            {agents?.map((agent) => (
                              <MenuItem key={agent.id} value={agent.id}>
                                {agent.first_name + ' ' + agent.last_name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                  }
                  {touched.customerInfo && errors.customerInfo && (
                    <FormHelperText error={true}>{errors?.customerInfo?.name}</FormHelperText>
                  )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Tipo cliente</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <Select
                        value={values.rate}
                        displayEmpty
                        name="client_type_id"
                        onChange={handleChange}
                        error={Boolean(errors.client_type_id && touched.client_type_id)}
                      >
                        <MenuItem disabled value="">
                          Seleziona tipo cliente
                        </MenuItem>
                        {client_types.map((client) => (
                          <MenuItem key={client.name} value={client.name}>
                            {client.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Sconto</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        id="discount"
                        name="discount"
                        value={values.discount}
                        onChange={handleChange}
                        error={Boolean(touched.discount && errors.discount)}
                        helperText={touched.discount && errors.discount}
                      />

                    </FormControl>
                  </Stack>
                  {touched.discount && errors.discount && <FormHelperText error={true}>{errors.discount}</FormHelperText>}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Stack spacing={1}>
                      <InputLabel>Metodo di pagamento</InputLabel>
                      <FormControl sx={{ width: '100%' }}>
                        <Select
                          value={values.payment_method}
                          displayEmpty
                          name="payment_method"
                          onChange={handleChange}
                          error={Boolean(errors.payment_method && touched.payment_method)}
                        >
                          <MenuItem disabled value="">
                            Seleziona metodo di pagamento
                          </MenuItem>
                          {methods?.map((method) => (
                            <MenuItem key={method.id} value={method.id}>
                              {method.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <InputLabel>Sconto 2</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        id="discount2"
                        name="discount2"
                        value={values.discount2}
                        onChange={handleChange}
                        error={Boolean(touched.discount2 && errors.discount2)}
                        helperText={touched.discount2 && errors.discount2}
                      />

                    </FormControl>
                  </Stack>
                  {touched.discount2 && errors.discount2 && <FormHelperText error={true}>{errors.discount2}</FormHelperText>}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" justifyContent="flex-start" alignItems="flex-end" spacing={2} sx={{ height: '100%' }}>
                    <Button color="primary" variant="contained" type="submit">
                      Crea contratto
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Form>
          </FormikProvider> :
          <CircularProgress />
      }

    </MainCard>
  );
};

export default CreateNoClient;
