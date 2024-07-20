import { useEffect, useState } from 'react';
import { useLocation, Link, Outlet, useNavigate } from 'react-router-dom';

// material-ui
import { Box, Tab, Tabs, Button } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { DocumentText, Lock, Profile, Profile2User, Setting3, TableDocument, AttachCircle, Call } from 'iconsax-react';
import { useDispatch, useSelector } from 'react-redux';
import client, { resetClient, selectClient, updateClient } from 'store/reducers/client';
import axios from 'utils/axios';
import { openSnackbar } from 'store/reducers/snackbar';
import { resetAgent, selectAgent, updateAgent } from 'store/reducers/agent';

// ==============================|| PROFILE - ACCOUNT ||============================== //

const AddAgent = () => {
  const { pathname } = useLocation();

  const local_agent = useSelector(selectAgent);

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
    case '/apps/new-agent/create/password':
      selectedTab = 4;
      break;
    case '/apps/new-agent/create/notes':
      selectedTab = 5;
      break;
    case '/apps/new-agent/create/providers':
      selectedTab = 6;
      break;
    case '/apps/new-agent/create/attachments':
      selectedTab = 7;
      break;
    case '/apps/new-agent/create/edit':
      selectedTab = 8;
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
      const response = await axios.get(`/agent/${local_agent.id}`);
      const { agent } = response.data;
      dispatch(updateAgent(agent));
    } catch (error) {
      console.error(error);
      // error snackbar
      dispatch(
        openSnackbar({
          open: true,
          message: 'Errore durante il caricamento dell agente',
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
    if (local_agent.updating) {
      getClient();
    }
  }, [])

  const uploadFile = async (agent) => {
    try {
      // Prevents HTML handling submission
      const id = agent[0].id;
      const files = local_agent.files;
      const formData = new FormData();
      // Creates empty formData object
      formData.append("id", id);
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
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleClientSubmit = async () => {
    try {
      // if company_name is empyty and first_name and last_name are empty is not valid.
      if (!local_agent.last_name || !local_agent.first_name) {
        alert('Nome e congome sono obbligatori');
        return;
      }
      // if address or city or zip is empty is not valid.
      if (!local_agent.address || !local_agent.city || !local_agent.zip) {
        alert('Indirizzo, città e CAP obbligatori');
        return;
      }
      // if email or phone is empty is not valid.
      if (local_agent.email.trim() === '' || local_agent.phone.trim() === '') {
        alert('Email e telefono obbligatori');
        return;
      }
      if (!local_agent.password) {
        alert('Password obbligatoria');
        return;
      }

      let response;
      let formattedAgent = { ...local_agent };
      formattedAgent.files = null
      console.log(formattedAgent);

      if (local_agent.updating) {
        response = await axios.put('/agent/update', formattedAgent);
      } else {
        response = await axios.post('/agent/create', formattedAgent);
      }
      const { agent } = response.data;
      if (agent) {
        // dispatch(openSnackbar('Customer Added Successfully'));
        await uploadFile(agent);
        dispatch(
          openSnackbar({
            open: true,
            message: 'Agente aggiunto con successo!',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
        const obj = {}
        dispatch(updateAgent(obj));
        navigation('/apps/customer/agents-list');
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
      if (error.message == "Agent already exists") {
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
      } else {
        // error snackbar
        dispatch(
          openSnackbar({
            open: true,
            message: 'Errore durante la creazione dell agente',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: false
          })
        );
      }

    }
  }

  useEffect(() => {
    return () => {
      dispatch(resetAgent());
    }
  }, [])

  return (
    <MainCard border={false}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%', }}>
        <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="account profile tab" >
          <Tab label="Anagrafica" component={Link} to="/apps/new-agent/create/personal" icon={<Profile />} iconPosition="start" />
          <Tab label="Indirizzi" component={Link} to="/apps/new-agent/create/addressess" icon={<TableDocument />} iconPosition="start" />
          <Tab label="Contatti" component={Link} to="/apps/new-agent/create/contacts" icon={<Call />} iconPosition="start" />
          {/*<Tab label="Allegati" component={Link} to="/apps/new-client/create/addressess" icon={<AttachCircle />} iconPosition="start" />*/}
          <Tab label="Password" component={Link} to="/apps/new-agent/create/password" icon={<Profile2User />} iconPosition="start" />
          <Tab label="Note" component={Link} to="/apps/new-agent/create/notes" icon={<TableDocument />} iconPosition="start" />
          <Tab label="Forntitori" component={Link} to="/apps/new-agent/create/providers" icon={<Profile2User />} iconPosition="start" />
          <Tab label="Allegati" component={Link} to="/apps/new-agent/create/attachments" icon={<AttachCircle />} iconPosition="start" />

        </Tabs>
      </Box>
      <Box sx={{ mt: 2.5 }}>
        <Outlet />
        {
          local_agent.updating ?
            <Button variant="contained" sx={{ mt: 2.4 }} onClick={handleClientSubmit} >
              Aggiorna agente
            </Button>
            :// check if path ends with /attachments
            window.location.pathname.endsWith('/attachments') ?
              <Button variant="contained" sx={{ mt: 2.4 }} onClick={handleClientSubmit} >
                Crea agente
              </Button>
              : null
        }

      </Box>
    </MainCard>
  );
};

export default AddAgent;
