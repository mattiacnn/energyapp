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
      if (local_client.updating) {
        let obj = { ...local_client };
        // delete obj.updating;
        delete obj.updating;
        response = await axios.post('/client/update', obj);
      } else {
        response = await axios.post('/client/create', local_client);
      }
      const { client } = response.data;
      if (client) {
        // dispatch(openSnackbar('Customer Added Successfully'));
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

  useEffect(() => {
    return () => {
      dispatch(resetClient());
    }
  }, [])

  return (
    <MainCard border={false}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="account profile tab">
          <Tab label="Anagrafica" component={Link} to="/apps/new-client/create/personal" icon={<Profile />} iconPosition="start" />
          <Tab label="Indirizzi" component={Link} to="/apps/new-client/create/addressess" icon={<TableDocument />} iconPosition="start" />
          <Tab label="Contatti" component={Link} to="/apps/new-client/create/contacts" icon={<Call />} iconPosition="start" />
          <Tab label="Agente" component={Link} to="/apps/new-client/create/agent" icon={<Profile2User />} iconPosition="start" />
          <Tab label="Note" component={Link} to="/apps/new-client/create/notes" icon={<TableDocument />} iconPosition="start" />

          {/*<Tab label="Allegati" component={Link} to="/apps/new-client/create/addressess" icon={<AttachCircle />} iconPosition="start" />*/}
        </Tabs>
      </Box>
      <Box sx={{ mt: 2.5 }}>
        <Outlet />
        {
          local_client.updating ?
            <Button variant="contained" sx={{ mt: 2.4 }} onClick={handleClientSubmit} >
              Aggiorna cliente
            </Button>
            :
            <Button variant="contained" sx={{ mt: 2.4 }} onClick={handleClientSubmit} >
              Crea cliente
            </Button>
        }

      </Box>
    </MainCard>
  );
};

export default AddClient;
