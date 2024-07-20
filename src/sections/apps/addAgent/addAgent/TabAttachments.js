import { useEffect, useState, useRef } from 'react';

// material-ui
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
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
import { useDispatch, useSelector } from 'react-redux';
import { selectAgent, updateAgent } from 'store/reducers/agent';
import axios, { apiUrl, downloadUrl } from 'utils/axios';
import { openSnackbar } from 'store/reducers/snackbar';
import { AttachSquare, DocumentDownload, Trash } from 'iconsax-react';
import ConfirmationDialog from 'sections/components-overview/dialogs/ConfirmationDialog';
import DeleteDialog from 'sections/components-overview/dialogs/DeleteDialog';


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

const TabAttachments = () => {
  const client = useSelector(selectAgent);
  const [providers, setProviders] = useState([]);
  const [files, setFiles] = useState([]);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
  const formRef = useRef();
  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, handleBlur, handleReset } = formik;

  const handleChange = (event, providerId) => {
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

  const uploadFile = async (event) => {
    event.preventDefault();
    try {
      // Prevents HTML handling submission
      const id = document.getElementById("client_id");
      const files = document.getElementById("files");
      const formData = new FormData();
      // Creates empty formData object
      formData.append("id", id.value);
      // Appends value of text input
      for (let i = 0; i < files.files.length; i++) {
        formData.append("files", files.files[i]);
      }
      // Appends value(s) of file input
      // Post data to Node and Express server:
      const response = await axios.post('/agent/upload', formData);
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
        fetchFiles();
      }
    } catch (error) {
      console.error(error);
    }
  }

  const saveFile = () => {
    const files = document.getElementById("files");
    const newClient = { ...client, files };
    dispatch(updateAgent(newClient));

  }

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`/agent/files/${client.id}`);
      const { files } = response.data;
      setFiles(files);
    } catch (error) {
      console.error(error);
    }
  }

  const downloadFile = async (file) => {
    try {
      const form = document.createElement('form');
      form.action = `${apiUrl}/agent/download/${client.id}/${file}`;
      form.method = 'GET';
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelect = (file) => {
    setSelectedFile(file);
    setOpen(true);
  }
  const handleConfirm = async () => {
    try {
      const res = await axios.delete(`/agent/files/${client.id}/${selectedFile}`);
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

  useEffect(() => {
    if (client?.id)
      fetchFiles();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title="Carica allegati">
          <form autoComplete="off" onSubmit={uploadFile} ref={formRef} onChange={saveFile}>
            <input type='hidden' name='id' id='client_id' value={client.id} />
            <input type='file' name='file' id="files" multiple />
            {
              client.id && (
                <Button type='submit' variant='contained'>Carica allegato</Button>
              )
            }
          </form>
        </MainCard>
      </Grid>
      {
        client.id && (
          <Grid item xs={12}>
            <MainCard title="Allegati">
              <List >
                {files.map((file, index) => (
                  <ListItem key={index}>
                    <AttachSquare />
                    <ListItemText primary={file} style={{ marginLeft: 10 }} />
                    <DocumentDownload style={{ cursor: "pointer" }} onClick={() => downloadFile(file)} />
                    <Trash style={{ cursor: "pointer", marginLeft: 10 }} color='red' onClick={() => handleSelect(file)} />
                  </ListItem>
                ))}
              </List>
            </MainCard>
          </Grid>
        )
      }
      <DeleteDialog
        open={open}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />

    </Grid>
  );
};

export default TabAttachments;
