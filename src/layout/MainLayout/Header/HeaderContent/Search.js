// material-ui
import { Box, Button, FormControl, Stack } from '@mui/material';
import { useNavigate } from 'react-router';

// ==============================|| HEADER CONTENT - SEARCH ||============================== //

const Search = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ width: '100%', ml: { xs: 0, md: 2 } }}>
      <FormControl sx={{ width: '100%' }}>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleNavigate('/apps/new-client/create/personal')}
            sx={{ backgroundColor: '#007bff' }} // Blue
          >
            Crea Anagrafica Cliente
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleNavigate('/apps/contratti/list')}
            sx={{ backgroundColor: '#28a745' }} // Green
          >
            Contratti
          </Button>
          <Button
            variant="contained"
            onClick={() => handleNavigate('/apps/customer/customer-list')}
            sx={{ backgroundColor: '#dc3545' }} // Red
          >
            Clienti
          </Button>
          <Button
            variant="contained"
            onClick={() => handleNavigate('/apps/providers/providers-list')}
            sx={{ backgroundColor: '#ffc107' }} // Yellow
          >
            Fornitori
          </Button>
          <Button
            variant="contained"
            onClick={() => handleNavigate('/apps/customer/agents-list')}
            sx={{ backgroundColor: '#17a2b8' }} // Teal
          >
            Agenti
          </Button>
        </Stack>
      </FormControl>
    </Box>
  );
};

export default Search;
