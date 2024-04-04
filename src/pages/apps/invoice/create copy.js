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
import { useEffect, useState } from 'react';

const validationSchema = yup.object({
  date: yup.date().required('Invoice date is required'),
  due_date: yup
    .date()
    .when('date', (date, schema) => date && schema.min(date, "Due date can't be before invoice date"))
    .nullable()
    .required('Due date is required'),
  customerInfo: yup
    .object({
      name: yup.string().required('Invoice receiver information is required')
    })
    .required('Invoice receiver information is required'),
  client: yup
    .object({
      first_name: yup.string().required('Client information is required'),
      last_name: yup.string().required('Client information is required'),
      email: yup.string().email('Invalid email').required('Client information is required'),
      phone: yup.string().required('Client information is required'),
    }),
  status: yup.string().required('Status selection is required'),
  discount: yup
    .number()
    .typeError('Discount must specify a numeric value.')
    // @ts-ignore
    .test('rate', 'Please enter a valid discount value', (number) => /^\d+(\.\d{1,2})?$/.test(number)),
  tax: yup
    .number()
    .typeError('Tax must specify a numeric value.')
    // @ts-ignore
    .test('rate', 'Please enter a valid tax value', (number) => /^\d+(\.\d{1,2})?$/.test(number)),
  invoice_detail: yup
    .array()
    .required('Invoice details is required')
    .of(
      yup.object().shape({
        name: yup.string().required('Product name is required')
      })
    )
    .min(1, 'Invoice must have at least 1 items')
});

// ==============================|| INVOICE - CREATE ||============================== //

const Create = () => {
  const theme = useTheme();
  const navigation = useNavigate();
  const notesLimit = 500;
  const [rates, setRates] = useState([{}]);
  const [client, setClient] = useState({});
  const [agent, setAgent] = useState({});

  const { open, isCustomerOpen, countries, country, lists, isOpen } = useSelector((state) => state.invoice);

  // get client_id parameter from url
  const { client_id } = useParams();

  const handlerCreate = (values) => {
    const NewList = {
      id: Number(incrementer(lists.length)),
      invoice_id: Number(values.invoice_id),
      customer_name: values.cashierInfo?.name,
      email: values.cashierInfo?.email,
      avatar: Number(Math.round(Math.random() * 10)),
      discount: Number(values.discount),
      tax: Number(values.tax),
      date: format(values.date, 'MM/dd/yyyy'),
      due_date: format(values.due_date, 'MM/dd/yyyy'),
      quantity: Number(
        values.invoice_detail?.reduce((sum, i) => {
          return sum + i.qty;
        }, 0)
      ),
      status: values.status,
      cashierInfo: values.cashierInfo,
      customerInfo: values.customerInfo,
      invoice_detail: values.invoice_detail,
      notes: values.notes
    };

    dispatch(getInvoiceList()).then(() => {
      dispatch(getInvoiceInsert(NewList)).then(() => {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Invoice Added successfully',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
        navigation('/apps/invoice/list');
      });
    });
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

  const addNextInvoiceHandler = () => {
    dispatch(
      reviewInvoicePopup({
        isOpen: false
      })
    );
  };

  useEffect(() => {
    fetchRates();
    fetchClient();
  }, [])



  return (
    <MainCard>
      {
        client ? <Formik
          initialValues={{
            id: 120,
            invoice_id: Date.now(),
            status: '',
            date: new Date(),
            due_date: null,
            cashierInfo: {
              name: 'Belle J. Richter',
              address: '1300 Cooks Mine, NM 87829',
              phone: '305-829-7809',
              email: 'belljrc23@gmail.com'
            },
            customerInfo: {
              address: '',
              email: '',
              name: '',
              phone: ''
            },
            client: {
              first_name: client.first_name,
            },
            invoice_detail: [
              {
                id: UIDV4(),
                name: '',
                description: '',
                qty: 1,
                price: '1.00'
              }
            ],
            discount: 0,
            tax: 0,
            notes: ''
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            handlerCreate(values);
          }}
        >
          {({ handleBlur, errors, handleChange, handleSubmit, values, isValid, setFieldValue, touched }) => {
            const subtotal = values?.invoice_detail.reduce((prev, curr) => {
              if (curr.name.trim().length > 0) return prev + Number(curr.price * Math.floor(curr.qty));
              else return prev;
            }, 0);
            const taxRate = (values.tax * subtotal) / 100;
            const discountRate = (values.discount * subtotal) / 100;
            const total = subtotal - discountRate + taxRate;
            return (
              <Form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack spacing={1}>
                      <InputLabel>Tariffa</InputLabel>
                      <FormControl sx={{ width: '100%' }}>
                        <Select
                          value={values.rate}
                          displayEmpty
                          name="rate"
                          onChange={handleChange}
                          error={Boolean(errors.rate && touched.rate)}
                        >
                          <MenuItem disabled value="">
                            Seleziona tariffa
                          </MenuItem>
                          {rates.map((rate) => (
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
                      <InputLabel>Partita</InputLabel>
                      <FormControl sx={{ width: '100%' }}>
                        <TextField
                          fullWidth
                          id="invoice_id"
                          name="invoice_id"
                          value={values.invoice_id}
                          onChange={handleChange}
                          error={Boolean(touched.invoice_id && errors.invoice_id)}
                          helperText={touched.invoice_id && errors.invoice_id}
                        />

                      </FormControl>
                    </Stack>
                    {touched.status && errors.status && <FormHelperText error={true}>{errors.status}</FormHelperText>}
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

                  <Grid item xs={12} sm={6} md={4}>
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
                            <Button
                              variant="outlined"
                              startIcon={<Edit />}
                              color="secondary"
                              onClick={() =>
                                dispatch(
                                  toggleCustomerPopup({
                                    open: true
                                  })
                                )
                              }
                              size="small"
                            >
                              Change
                            </Button>
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
                  <Grid item xs={12} sm={6} md={4}>
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
                            <Button
                              size="small"
                              startIcon={<Add />}
                              color="secondary"
                              variant="outlined"
                              onClick={() =>
                                dispatch(
                                  customerPopup({
                                    isCustomerOpen: true
                                  })
                                )
                              }
                            >
                              Add
                            </Button>
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

                  <Grid item xs={12}>
                    <Typography variant="h5">Detail</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FieldArray
                      name="invoice_detail"
                      render={({ remove, push }) => {
                        return (
                          <>
                            <TableContainer>
                              <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Qty</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {values.invoice_detail?.map((item, index) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{values.invoice_detail.indexOf(item) + 1}</TableCell>
                                      <InvoiceItem
                                        key={item.id}
                                        id={item.id}
                                        index={index}
                                        name={item.name}
                                        description={item.description}
                                        qty={item.qty}
                                        price={item.price}
                                        onDeleteItem={(index) => remove(index)}
                                        onEditItem={handleChange}
                                        Blur={handleBlur}
                                        errors={errors}
                                        touched={touched}
                                      />
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                            <Divider />
                            {touched.invoice_detail && errors.invoice_detail && !Array.isArray(errors?.invoice_detail) && (
                              <Stack direction="row" justifyContent="center" sx={{ p: 1.5 }}>
                                <FormHelperText error={true}>{errors.invoice_detail}</FormHelperText>
                              </Stack>
                            )}
                            <Grid container justifyContent="space-between">
                              <Grid item xs={12} md={8}>
                                <Box sx={{ pt: 2.5, pr: 2.5, pb: 2.5, pl: 0 }}>
                                  <Button
                                    color="primary"
                                    startIcon={<Add />}
                                    onClick={() =>
                                      push({
                                        id: UIDV4(),
                                        name: '',
                                        description: '',
                                        qty: 1,
                                        price: '1.00'
                                      })
                                    }
                                    variant="dashed"
                                    sx={{ bgcolor: 'transparent !important' }}
                                  >
                                    Add Item
                                  </Button>
                                </Box>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Grid container justifyContent="space-between" spacing={2} sx={{ pt: 2.5, pb: 2.5 }}>
                                  <Grid item xs={6}>
                                    <Stack spacing={1}>
                                      <InputLabel>Discount(%)</InputLabel>
                                      <TextField
                                        type="number"
                                        style={{ width: '100%' }}
                                        name="discount"
                                        id="discount"
                                        placeholder="0.0"
                                        value={values.discount}
                                        onChange={handleChange}
                                      />
                                      {touched.discount && errors.discount && <FormHelperText error={true}>{errors.discount}</FormHelperText>}
                                    </Stack>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Stack spacing={1}>
                                      <InputLabel>Tax(%)</InputLabel>
                                      <TextField
                                        type="number"
                                        style={{ width: '100%' }}
                                        name="tax"
                                        id="tax"
                                        placeholder="0.0"
                                        value={values.tax}
                                        onChange={handleChange}
                                      />
                                      {touched.tax && errors.tax && <FormHelperText error={true}>{errors.tax}</FormHelperText>}
                                    </Stack>
                                  </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                  <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between">
                                      <Typography color={theme.palette.secondary.main}>Sub Total:</Typography>
                                      <Typography>{country?.prefix + '' + subtotal.toFixed(2)}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                      <Typography color={theme.palette.secondary.main}>Discount:</Typography>
                                      <Typography variant="h6" color={theme.palette.success.main}>
                                        {country?.prefix + '' + discountRate.toFixed(2)}
                                      </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                      <Typography color={theme.palette.secondary.main}>Tax:</Typography>
                                      <Typography>{country?.prefix + '' + taxRate.toFixed(2)}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                      <Typography variant="subtitle1">Grand Total:</Typography>
                                      <Typography variant="subtitle1">
                                        {' '}
                                        {total % 1 === 0 ? country?.prefix + '' + total : country?.prefix + '' + total.toFixed(2)}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </Grid>
                          </>
                        );
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel>Notes</InputLabel>
                      <TextField
                        placeholder="Address"
                        rows={3}
                        value={values.notes}
                        multiline
                        name="notes"
                        onChange={handleChange}
                        inputProps={{
                          maxLength: notesLimit
                        }}
                        helperText={`${values.notes.length} / ${notesLimit}`}
                        sx={{
                          width: '100%',
                          '& .MuiFormHelperText-root': {
                            mr: 0,
                            display: 'flex',
                            justifyContent: 'flex-end'
                          }
                        }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <InputLabel>Set Currency*</InputLabel>
                      <FormControl sx={{ width: { xs: '100%', sm: 250 } }}>
                        <Autocomplete
                          id="country-select-demo"
                          fullWidth
                          options={countries}
                          defaultValue={countries[2]}
                          value={countries.find((option) => option.code === country?.code)}
                          onChange={(event, value) => {
                            dispatch(
                              selectCountry({
                                country: value
                              })
                            );
                          }}
                          autoHighlight
                          getOptionLabel={(option) => option.label}
                          renderOption={(props, option) => (
                            <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                              {option.code && (
                                <img
                                  loading="lazy"
                                  width="20"
                                  src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                                  srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                                  alt=""
                                />
                              )}
                              {option.label}
                            </Box>
                          )}
                          renderInput={(params) => {
                            const selected = countries.find((option) => option.code === country?.code);
                            return (
                              <TextField
                                {...params}
                                name="phoneCode"
                                placeholder="Select"
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <>
                                      {selected && selected.code !== '' && (
                                        <img
                                          style={{ marginRight: 6 }}
                                          loading="lazy"
                                          width="20"
                                          src={`https://flagcdn.com/w20/${selected.code.toLowerCase()}.png`}
                                          srcSet={`https://flagcdn.com/w40/${selected.code.toLowerCase()}.png 2x`}
                                          alt=""
                                        />
                                      )}
                                    </>
                                  )
                                }}
                                inputProps={{
                                  ...params.inputProps,
                                  autoComplete: 'new-password' // disable autocomplete and autofill
                                }}
                              />
                            );
                          }}
                        />
                      </FormControl>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" justifyContent="flex-end" alignItems="flex-end" spacing={2} sx={{ height: '100%' }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        disabled={values.status === '' || !isValid}
                        sx={{ color: 'secondary.dark' }}
                        onClick={() =>
                          dispatch(
                            reviewInvoicePopup({
                              isOpen: true
                            })
                          )
                        }
                      >
                        Preview
                      </Button>
                      <Button variant="outlined" color="secondary" sx={{ color: 'secondary.dark' }}>
                        Save
                      </Button>
                      <Button color="primary" variant="contained" type="submit">
                        Create & Send
                      </Button>
                      <InvoiceModal
                        isOpen={isOpen}
                        setIsOpen={(value) =>
                          dispatch(
                            reviewInvoicePopup({
                              isOpen: value
                            })
                          )
                        }
                        key={values.invoice_id}
                        invoiceInfo={{
                          ...values,
                          subtotal,
                          taxRate,
                          discountRate,
                          total
                        }}
                        items={values?.invoice_detail}
                        onAddNextInvoice={addNextInvoiceHandler}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Form>
            );
          }}
        </Formik> :
          <CircularProgress />
      }

    </MainCard>
  );
};

export default Create;
