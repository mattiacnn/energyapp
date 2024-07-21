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
  TextareaAutosize,
  Typography
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import * as yup from 'yup';
import { v4 as UIDV4 } from 'uuid';
import { format } from 'date-fns';
import { FieldArray, Form, Formik } from 'formik';

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
import { useEffect, useRef, useState } from 'react';

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

const Create = () => {
  const theme = useTheme();
  const navigation = useNavigate();
  const notesLimit = 500;
  const [rates, setRates] = useState([{}]);
  const [client, setClient] = useState({});
  const [agent, setAgent] = useState({});
  const [providers, setProviders] = useState([]);
  const [contractTypes, setContractTypes] = useState({});
  const [selectedRates, setSelectedRates] = useState([]);
  const [methods, setMethods] = useState([]);
  const [tipologies, setTipologies] = useState([{}]);
  const [status, setStatus] = useState([]);
  const { open, isCustomerOpen } = useSelector((state) => state.invoice);
  const formRef = useRef();
  // get client_id parameter from url
  const { client_id } = useParams();

  const handlerCreate = async (values) => {
    const new_contract = {
      agent_id: values.agent_id,
      client_id: values.client_id,
      rate_id: values.rate_id,
      provider_id: values.old_provider_id,
      payment_method: values.payment_method,
      client_type: values.client_type_id,
      contract_type_id: values.contract_type_id,
      tipology_id: values.tipology_id,
      status_id: values.status_id,
      date: format(values.date, 'yyyy-MM-dd'),
      due_date: format(values.due_date, 'yyyy-MM-dd'),
      cod: values.cod,
      notes: values.notes,
      pod: values.pod,
      pdr: values.pdr,
      power: values.power,
      annual_consumption: values.annual_consumption,
      discount: values.discount,
      discount2: values.discount2
    };
    try {
      const response = await axios.post('/contract/create', new_contract);
      const { contract } = response.data;
      if (contract) {
        await uploadFile(contract[0].id);
        navigation('/apps/contracts/contracts-list');
      }
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

  const fetchAgent = async (agent_id) => {
    try {
      const response = await axios.get('/agent/' + agent_id);
      const { agent } = response.data;
      setAgent(agent);
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
  const fetchTiplogies = async () => {
    try {
      const response = await axios.get('/tipology/list');
      const { tipologies } = response.data;
      setTipologies(tipologies);
    } catch (error) {
      console.error(error);
    }
  }
  const fetchStatus = async () => {
    try {
      const response = await axios.get('/status/list');
      const { status } = response.data;
      setStatus(status);
    } catch (error) {
      console.error(error);
    }
  }
  const handleChangeContractType = (setFieldValue, value) => {
    setFieldValue('contract_type_id', value);
    const filteredRates = rates.filter((rate) => rate.contract_type_id === Number(value));
    setSelectedRates(filteredRates);
  }
  const getProvider = (rate_id) => {
    if (rate_id) {
      const rate = rates.find((rate) => rate.id === rate_id);
      const provider = providers.find((provider) => provider.id === rate.provider_id);
      if (provider)
        return (
          <MenuItem key={provider.id} value={provider.id}>
            {provider.name}
          </MenuItem>
        )
    }
    return null
  }
  const uploadFile = async (contract_id) => {
    try {
      // Prevents HTML handling submission
      const id = contract_id;
      const files = document.getElementById("files");
      const formData = new FormData();
      // Creates empty formData object
      formData.append("id", id);
      // Appends value of text input
      for (let i = 0; i < files.files.length; i++) {
        formData.append("files", files.files[i]);
      }
      // Appends value(s) of file input
      // Post data to Node and Express server:
      const response = await axios.post('/contract/upload', formData);
      if (response.status === 200) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Allegato caricato con successo',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
        // clean form
        formRef.current.reset();
        formRef.current.querySelector('input[type="file"]').value = '';
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchRates();
    fetchClient();
    fetchContractTypes();
    fetchProviders();
    fetchMethod();
    fetchTiplogies();
    fetchStatus();
  }, []);

  useEffect(() => {
    console.log(providers);
  }, [providers])

  return (
    <MainCard>
      {
        client && agent?.id ? <Formik
          initialValues={
            {
              agent_id: agent?.id,
              client_id: client_id,
              rate_id: '',
              client_type_id: '',
              contract_type_id: '',
              date: new Date(),
              due_date: new Date(),
              cod: '',
              pod: '',
              pdr: '',
              power: '',
              annual_consumption: '',
              discount: 0,
              discount2: 0,
            }
          }
          validationSchema={validationSchema}
          onSubmit={(values) => {
            handlerCreate(values);
          }}
        >
          {({ handleBlur, errors, handleChange, handleSubmit, values, isValid, setFieldValue, touched }) => {
            return (
              <Form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
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

                  {
                    values.contract_type_id &&

                    <Grid item xs={12} sm={6} md={3}>
                      <Stack spacing={1}>
                        <InputLabel>Fornitore</InputLabel>
                        <FormControl sx={{ width: '100%' }}>
                          <Select
                            value={values.provider_id}
                            name="provider_id"
                            onChange={handleChange}
                            error={Boolean(errors.provider_id && touched.provider_id)}
                          >
                            <MenuItem disabled value="">
                              Seleziona un fornitore
                            </MenuItem>
                            {
                              providers.map((provider) => (
                                <MenuItem key={provider.id} value={provider.id}>
                                  {provider.name}
                                </MenuItem>
                              ))
                            }
                          </Select>
                        </FormControl>
                      </Stack>
                      {touched.status && errors.status && <FormHelperText error={true}>{errors.status}</FormHelperText>}
                    </Grid>
                  }
                  {
                    values.contract_type_id && values.provider_id &&
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
                  }
                  {
                    values.contract_type_id && values.provider_id && (values.client_type_id) &&
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
                  }
                  {
                    values.contract_type_id && values.provider_id && (values.client_type_id) && values.rate_id &&
                    <>
                                          <Grid item xs={12} sm={6} md={6}>
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
                      </Grid>
                      <Grid item xs={12} sm={6} md={6}>
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
                        {touched.customerInfo && errors.customerInfo && (
                          <FormHelperText error={true}>{errors?.customerInfo?.name}</FormHelperText>
                        )}
                      </Grid>

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
                              name="tipology_id"
                              value={values.tipology_id}
                              error={Boolean(errors.tipology_id && touched.tipology_id)}
                              onChange={handleChange}
                            >
                              <MenuItem disabled value="">
                                Seleziona tipologia
                              </MenuItem>
                              {tipologies.map((tipology) => (
                                <MenuItem key={tipology.id} value={tipology.id}>
                                  {tipology.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Stack>
                        {touched.type && errors.type && <FormHelperText error={true}>{errors.type}</FormHelperText>}
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Stack spacing={1}>
                          <InputLabel>Stato contratto</InputLabel>
                          <FormControl sx={{ width: '100%' }}>
                            <Select
                              value={values.status_id}
                              displayEmpty
                              name="status_id"
                              onChange={handleChange}
                              error={Boolean(errors.status_id && touched.status_id)}
                            >
                              <MenuItem disabled value="">
                                Seleziona uno stato
                              </MenuItem>
                              {status?.map((status) => (
                                <MenuItem key={status.id} value={status.id}>
                                  {status.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Stack>
                        {touched.status && errors.status && <FormHelperText error={true}>{errors.status}</FormHelperText>}
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Stack spacing={1}>
                          <InputLabel>Vecchio fornitore (Facoltativo)</InputLabel>
                          <FormControl sx={{ width: '100%' }}>
                            <Select
                              value={values.old_provider_id}
                              displayEmpty
                              name="old_provider_id"
                              onChange={handleChange}
                              error={Boolean(errors.old_provider_id && touched.old_provider_id)}
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
                          <InputLabel>Note</InputLabel>
                          <FormControl sx={{ width: '100%' }}>
                            <TextareaAutosize
                              minRows={5}
                              fullWidth
                              id="notes"
                              name="notes"
                              value={values.notes}
                              onChange={handleChange}
                              error={Boolean(touched.notes && errors.notes)}
                              helperText={touched.notes && errors.notes}
                            />

                          </FormControl>
                        </Stack>
                        {touched.notes && errors.notes && <FormHelperText error={true}>{errors.notes}</FormHelperText>}
                      </Grid>
                      <Grid item xs={12} sm={12} md={12}>
                        <Stack spacing={1.25}>
                          <InputLabel>Allegati</InputLabel>
                          <form autoComplete="off" onSubmit={uploadFile} ref={formRef}>
                            <input type='file' name='file' id="files" multiple />
                          </form>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" justifyContent="flex-end" alignItems="flex-end" spacing={2} sx={{ height: '100%' }}>
                          <Button color="primary" variant="contained" type="submit">
                            Crea contratto
                          </Button>
                        </Stack>
                      </Grid>
                    </>
                  }
                </Grid>
              </Form>
            );
          }}
        </Formik> :
          <CircularProgress />
      }

    </MainCard >
  );
};

export default Create;
