import { useEffect, useState } from 'react';
import { useLocation, Link, Outlet, useNavigate } from 'react-router-dom';

// material-ui
import { Box, Tab, Tabs, Button } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { DocumentText, Lock, Profile, Profile2User, Setting3, TableDocument, AttachCircle, Call } from 'iconsax-react';
import { useDispatch, useSelector } from 'react-redux';
import { resetClient, selectClient, updateClient } from 'store/reducers/client';
import axios from 'utils/axios';
import { openSnackbar } from 'store/reducers/snackbar';

// ==============================|| PROFILE - ACCOUNT ||============================== //

const AddClient = () => {
  const { pathname } = useLocation();

  const local_client = useSelector(selectClient);

  const dispatch = useDispatch();
  const navigation = useNavigate();

  let selectedTab = 0;
  switch (pathname) {
    case '/apps/new-agent/create/personal':
      selectedTab = 0;
      break;
    case '/apps/new-agent/create/addressess':
      selectedTab = 1;
      break;
    case '/apps/new-agent/create/contacts':
      selectedTab = 3;
      break;
    case '/apps/new-agent/create/notes':
      selectedTab = 4;
      break;
    case '/apps/new-agent/create/attachments':
      selectedTab = 5;
      break;
    case '/apps/new-agent/create/edit':
      selectedTab = 6;
      break;
    default:
      selectedTab = 0;
  }

  const [value, setValue] = useState(selectedTab);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getClient = async () => {
    try {
      const response = await axios.get(`/client/${local_client.id}`);
      const { client } = response.data;
      dispatch(updateClient(client));
    } catch (error) {
      console.error(error);
      // error snackbar
      dispatch(
        openSnackbar({
          open: true,
          message: 'Errore durante il caricamento del cliente',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
    }
  }
  useEffect(() => {
    if (local_client.updating) {
      getClient();
    }
  }, [])

  const handleClientSubmit = async () => {
    try {
      // if company_name is empyty and first_name and last_name are empty is not valid.
      if (local_client.company_name === '' && local_client.first_name === '' && local_client.last_name === '') {
        alert('Nome o ragione sociale obbligatorio');
        return;
      }
      // if address or city or zip is empty is not valid.
      if (local_client.address === '' || local_client.city === '' || local_client.zip === '') {
        alert('Indirizzo, città e CAP obbligatori');
        return;
      }
      // if email or phone is empty is not valid.
      if (local_client.email.trim() === '' || local_client.phone.trim() === '') {
        alert('Email e telefono obbligatori');
        return;
      }
      // if agent is empty is not valid.
      if (local_client.agent === '') {
        alert('Agente obbligatorio');
        return;
      }
      let response;
      let obj = { ...local_client };
      // delete obj.updating;
      delete obj.updating;
      if (obj.files) {
        delete obj.files;
      }
      if (local_client.updating) {

        response = await axios.post('/client/update', obj);
      } else {
        response = await axios.post('/client/create', obj);
      }
      const { client } = response.data;
      if (client) {
        // dispatch(openSnackbar('Customer Added Successfully'));
        await uploadFile(client);
        dispatch(
          openSnackbar({
            open: true,
            message: 'Cliente aggiunto con successo!',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
        const obj = {}
        dispatch(updateClient(obj));
        navigation('/apps/customer/customer-list');
      }
      else if (response.message) {
        dispatch(
          openSnackbar({
            open: true,
            message: "Questa email è già stata utilizzata. Inserisci un'altra email.",
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: false
          })
        );
      }
    } catch (error) {
      console.error(error);
      // error snackbar
      dispatch(
        openSnackbar({
          open: true,
          message: 'Errore durante la creazione del cliente',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
    }
  }

  const uploadFile = async (agent) => {
    try {
      // Prevents HTML handling submission
      console.log("uploading file", agent)
      const id = agent[0].id;
      const files = local_client.files;
      const formData = new FormData();
      // Creates empty formData object
      formData.append("id", id);
      // Appends value of text input
      for (let i = 0; i < files.files.length; i++) {
        formData.append("files", files.files[i]);
      }
      // Appends value(s) of file input
      // Post data to Node and Express server:
      const response = await axios.post('/client/upload', formData);
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
      }
    } catch (error) {
      console.error("errore durante il caricamento del file", error);
    }
  }

  useEffect(() => {
    return () => {
      dispatch(resetClient());
    }
  }, [])

  return (
    <MainCard border={false}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%', display: "none" }}>
        <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="account profile tab">
          <Tab label="Anagrafica" component={Link} to="/apps/new-client/create/personal" icon={<Profile />} iconPosition="start" />
          <Tab label="Indirizzi" component={Link} to="/apps/new-client/create/addressess" icon={<TableDocument />} iconPosition="start" />
          <Tab label="Contatti" component={Link} to="/apps/new-client/create/contacts" icon={<Call />} iconPosition="start" />
          <Tab label="Agente" component={Link} to="/apps/new-client/create/agent" icon={<Profile2User />} iconPosition="start" />
          <Tab label="Note" component={Link} to="/apps/new-client/create/notes" icon={<TableDocument />} iconPosition="start" />
          <Tab label="Allegati" component={Link} to="/apps/new-client/create/attachments" icon={<AttachCircle />} iconPosition="start" />
          {/*<Tab label="Allegati" component={Link} to="/apps/new-client/create/addressess" icon={<AttachCircle />} iconPosition="start" />*/}
        </Tabs>
      </Box>
      <Box sx={{ mt: 2.5 }}>
        <Outlet />
        <Button color="primary" variant="outlined" onClick={() => navigation(-1)} sx={{mt:2,mr:2}}>
          Torna indietro
        </Button>
        {
          local_client.updating ?
            <Button variant="contained" sx={{ mt: 2.4 }} onClick={handleClientSubmit} >
              Aggiorna cliente
            </Button>
            :// check if path ends with /attachments
            window.location.pathname.endsWith('/attachments') ?
              <Button variant="contained" sx={{ mt: 2.4 }} onClick={handleClientSubmit} >
                Crea cliente
              </Button>
              : null
        }

      </Box>
    </MainCard>
  );
};

export default AddClient;
