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
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Switch,
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
import { Add, AttachSquare, DocumentDownload, Edit, Trash } from 'iconsax-react';
import axios, { apiUrl } from 'utils/axios';
import { useEffect, useRef, useState } from 'react';
import { List } from 'immutable';
import DeleteDialog from 'sections/components-overview/dialogs/DeleteDialog';
import DeleteDialogContract from 'sections/components-overview/dialogs/DeleteDialogContract';

const client_types = [
  {
    name: 'privato'
  },
  {
    name: 'azienda'
  }
];
const validationSchema = yup.object({
  agent_id: yup.number().required('Agente è obbligatorio'),
  client_id: yup.number().required('Cliente è obbligatorio'),
  rate_id: yup.number().required('Tariffa è obbligatorio'),
  provider_id: yup.number(),
  client_type: yup.string().required('Tipo cliente è obbligatorio'),
  tipology_id: yup.string().required('Tipologia è obbligatorio'),
  contract_type_id: yup.number().required('Tipo contratto è obbligatorio'),
  date: yup.date().required('Data di sottoscrizione è obbligatorio'),
  due_date: yup.date(),
  cod: yup.string(),
  pod: yup.string(),
  pdr: yup.string(),
  power: yup.string(),
  annual_consumption: yup.string()
});

// ==============================|| INVOICE - CREATE ||============================== //

const View = () => {
  const theme = useTheme();
  const navigation = useNavigate();
  const notesLimit = 500;
  const [rates, setRates] = useState([{}]);
  const [client, setClient] = useState({});
  const [agent, setAgent] = useState({});
  const [providers, setProviders] = useState([{}]);
  const [contractTypes, setContractTypes] = useState([{}]);
  const [selectedRates, setSelectedRates] = useState([]);
  const [contract, setContract] = useState({});
  const [tipologies, setTipologies] = useState([{}]);
  const { open, isCustomerOpen } = useSelector((state) => state.invoice);
  const [status, setStatus] = useState([{}]);
  // get client_id parameter from url
  const { contract_id } = useParams();
  const [files, setFiles] = useState(null);
  const [selectedFile, setSelectedFile] = useState('');
  const [isOpen, setOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const formRef = useRef();

  const handlerCreate = async (values) => {
    const new_contract = {
      agent_id: values.agent,
      client_id: values.client_id,
      rate_id: values.rate_id,
      partita: values.partita,
      client_type: values.client_type,
      provider_id: values.provider_id,
      contract_type_id: values.contract_type_id,
      date: format(values.date, 'yyyy-MM-dd'),
      due_date: format(values.due_date, 'yyyy-MM-dd'),
      tipology_id: values.tipology_id,
      cod: values.cod,
      pod: values.pod,
      pdr: values.pdr,
      power: values.power,
      annual_consumption: values.annual_consumption,
      discount: 0,
      discount2: 0,
      id: contract_id,
      calculate_fee: values.calculate_fee,
    };
    try {
      const response = await axios.put('/contract/update/', new_contract);
      const { contract } = response.data;
      if (contract) {
        await uploadFile();
        dispatch(
          dispatch(
            openSnackbar({
              open: true,
              message: 'Contratto aggiornato con successo',
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: false
            })
          )
        );
        // after 500 ms
        setTimeout(() => {
          navigation('/apps/contracts/contracts-list');
        }, 1000);
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Errore durante l\'aggiornamento del contratto',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
      console.error(error);
    }

  };

  const fetchFiles = async () => {
    try {
      console.log("fetching file ", contract.id);
      const response = await axios.get(`/contract/files/${contract.id}`);
      const { files } = response.data;
      setFiles(files);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (contract?.id)
      fetchFiles();
  }, [contract]);

  const handleDeleteContract = async () => {
    try {
      const response = await axios.delete('/contract/' + contract_id);
      dispatch(
        dispatch(
          openSnackbar({
            open: true,
            message: 'Contratto eliminato con successo',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        )
      );
      // after 500 ms
      setTimeout(() => {
        navigation('/apps/contracts/contracts-list');
      }, 1000);
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Errore durante l\'eliminazione del contratto',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
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
  const fetchTiplogies = async () => {
    try {
      const response = await axios.get('/tipology/list');
      const { tipologies } = response.data;
      setTipologies(tipologies);
    } catch (error) {
      console.error(error);
    }
  }
  const fetchClient = async () => {
    try {
      const response = await axios.get('/client/' + contract.client_id);
      const { client } = response.data;
      setClient(client);
      if (client.agent) {
        fetchAgent(client.agent);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const fetchAgent = async () => {
    try {
      const response = await axios.get('/agent/' + contract.agent_id);
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

  const fetchContract = async () => {
    try {
      const response = await axios.get('/contract/' + contract_id);
      const { contract } = response.data;
      setContract(contract);
    } catch (error) {
      console.error(error);
    }
  }
  const handleChangeContractType = (setFieldValue, value) => {
    setFieldValue('contract_type_id', value);
    const filteredRates = rates.filter((rate) => rate.contract_type_id === Number(value));
    setSelectedRates(filteredRates);
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
  useEffect(() => {
    fetchProviders();
    fetchContract();
    fetchContractTypes();
    fetchRates();
    fetchTiplogies();
    fetchStatus();
  }, []);

  useEffect(() => {
    if (contract && contract.client_id) {
      fetchClient()
    }
    if (contract && contract.agent_id) {
      fetchAgent()
    }
  }, [contract])

  const getProvider = () => {
    if (rates && rates.length > 0) {
      const rate = rates.find(rate => rate.id === contract.rate_id);
      if (rate?.provider_id)
        return rate.provider_id;
      else
        return null;
    }
    return null
  }

  const downloadFile = async (file) => {
    try {
      const form = document.createElement('form');
      form.action = `${apiUrl}/contract/download/${contract.id}/${file}`;
      form.method = 'GET';
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const uploadFile = async () => {

    try {
      // Prevents HTML handling submission
      const id = contract.id;
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

  const handleConfirm = async () => {
    try {
      const res = await axios.delete(`/contract/files/${contract.id}/${selectedFile}`);
      if (res.status === 200) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Allegato cancellato con successo',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
        setOpen(false);
        fetchFiles();
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Errore durante la cancellazione dell\'allegato',
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


  const handleSelect = (file) => {
    setSelectedFile(file);
    setOpen(true);
  }

  return (
    <MainCard>
      {
        contract && contract.id ? <Formik
          initialValues={
            {
              agent_id: contract.agent_id,
              client_id: contract.client_id,
              rate_id: contract.rate_id,
              partita: contract.partita,
              client_type: contract.client_type,
              provider_id: contract.provider_id,
              contract_type_id: contract.contract_type_id,
              date: new Date(contract.date),
              tipology_id: contract.tipology_id,
              due_date: new Date(contract.due_date),
              cod: contract.cod,
              pod: contract.pod,
              status_id: contract.status_id,
              calculate_fee: contract.calculate_fee,
              pdr: contract.pdr,
              power: contract.power,
              annual_consumption: contract.annual_consumption,
              discount: 0,
              discount2: 0,
              notes: contract.notes,
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
                          id='tipology_id'
                          onChange={handleChange}
                          error={Boolean(errors.tipology_id && touched.tipology_id)}
                        >
                          <MenuItem disabled value="">
                            Seleziona tipologia
                          </MenuItem>

                          {tipologies?.map((tipology) => (
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
                            Seleziona vecchio fornitore
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
                      <InputLabel>Tipo contratto</InputLabel>
                      <FormControl sx={{ width: '100%' }}>
                        <Select
                          value={values.contract_type_id}
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
                          value={values.rate_id}
                          displayEmpty
                          name="rate_id"
                          onChange={handleChange}
                          error={Boolean(errors.rate_id && touched.rate_id)}
                        >
                          <MenuItem disabled value="">
                            Seleziona tariffa
                          </MenuItem>
                          {rates?.map((rate) => (
                            <MenuItem key={rate.id} value={rate.id}>
                              {rate.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                    {touched.status && errors.status && <FormHelperText error={true}>{errors.status}</FormHelperText>}
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack spacing={1}>
                      <InputLabel>Fornitore</InputLabel>
                      <FormControl sx={{ width: '100%' }}>
                        <Select
                          value={getProvider()}
                          displayEmpty
                          disabled={true}
                          name="provider_id"
                          onChange={handleChange}
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
                      </FormControl>
                    </Stack>
                    {touched.status && errors.status && <FormHelperText error={true}>{errors.status}</FormHelperText>}
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
                      <InputLabel>Tipo cliente</InputLabel>
                      <FormControl sx={{ width: '100%' }}>
                        <Select
                          value={values.client_type.toLowerCase()}
                          displayEmpty
                          disabled={values.client_type ? true : false}
                          name="client_type_id"
                          onChange={handleChange}
                          error={Boolean(errors.client_type_id && touched.client_type_id)}
                        >
                          <MenuItem value="">
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
                      <InputLabel>Notes</InputLabel>
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
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1.25}>
                      <ListItem divider>
                        <ListItemText
                          id="switch-list-label-sb"
                          primary="Abilita calcolo delle provvigioni"
                          secondary="Disabilitando il calcolo delle provvigioni, le provvigioni non verrano più calcolate per questo contratto"
                        />
                        <Switch
                          edge="end"
                          onChange={(e) => setFieldValue('calculate_fee', e.target.checked)}
                          checked={values.calculate_fee}
                          inputProps={{
                            'aria-labelledby': 'switch-list-label-sb'
                          }}
                        />
                      </ListItem>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={12} md={12}>
                    <Stack spacing={1.25}>
                      <InputLabel>Allegati</InputLabel>
                      {
                        <Grid item xs={12}>
                          <div>
                            {
                              files?.map((file, index) => (
                                <div key={index} style={{ display: "flex", flexDirection: "row" }}>
                                  <AttachSquare />
                                  <ListItemText primary={file} style={{ marginLeft: 10 }} />
                                  <DocumentDownload style={{ cursor: "pointer" }} onClick={() => downloadFile(file)} />
                                  <Trash style={{ cursor: "pointer", marginLeft: 10 }} color='red' onClick={() => handleSelect(file)} />
                                </div>
                              ))
                            }

                          </div>
                        </Grid>
                      }
                      <form autoComplete="off" onSubmit={uploadFile} ref={formRef}>
                        <input type='file' name='file' id="files" multiple />
                      </form>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    {/* map errors */}
                    {
                      Object.keys(errors).map((key, index) => {
                        return (
                          <FormHelperText key={index} error={true}>{errors[key]}</FormHelperText>
                        )
                      })
                    }
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" justifyContent="flex-start" alignItems="flex-end" spacing={2} sx={{ height: '100%' }}>
                      <Button color="primary" variant="contained" type="submit">
                        Aggiorna contratto
                      </Button>
                      <Button color="error" variant="outlined" onClick={() => setDeleteModalOpen(true)}>
                        Elimina contratto
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
                <DeleteDialog
                  open={isOpen}
                  handleClose={handleClose}
                  handleConfirm={handleConfirm}
                />
                <DeleteDialogContract
                  open={deleteModalOpen}
                  handleClose={() => setDeleteModalOpen(false)}
                  handleConfirm={() => handleDeleteContract()}
                />
              </Form>
            );
          }}
        </Formik> :
          <CircularProgress />
      }

    </MainCard>
  );
};

export default View;
