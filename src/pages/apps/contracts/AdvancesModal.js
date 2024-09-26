import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  IconButton,
  TextField,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add, Edit, Trash } from 'iconsax-react';
import axios from 'utils/axios';
import moment from 'moment';

const AdvancesModal = ({ open, onClose, contractId }) => {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState(null);
  const [newAdvance, setNewAdvance] = useState({ amount: '', payment_method_id: '', date: '' });
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    if (open && contractId) {
      fetchAdvances();
      fetchPaymentMethods();
    }
  }, [open, contractId]);

  const fetchAdvances = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/advance/contract/${contractId}`);
      setAdvances(response.data.advances);
    } catch (error) {
      console.error('Errore nel recupero degli acconti:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('/pmethod/list');
      setPaymentMethods(response.data.pmethods);
    } catch (error) {
      console.error('Errore nel recupero dei metodi di pagamento:', error);
    }
  };

  const handleAddAdvance = async () => {
    try {
      await axios.post('/advance/create', { ...newAdvance, contract_id: contractId });
      setNewAdvance({ amount: '', payment_method_id: '', date: '' });
      fetchAdvances();
    } catch (error) {
      console.error('Errore nell\'aggiunta dell\'acconto:', error);
    }
  };

  const handleEditAdvance = async (id) => {
    if (editingAdvance) {
      try {
        await axios.put(`/advance/${id}`, editingAdvance);
        setEditingAdvance(null);
        fetchAdvances();
      } catch (error) {
        console.error('Errore nella modifica dell\'acconto:', error);
      }
    } else {
      setEditingAdvance(advances.find(a => a.id === id));
    }
  };

  const handleDeleteAdvance = async (id) => {
    try {
      await axios.delete(`/advance/${id}`);
      fetchAdvances();
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'acconto:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Acconti del Contratto</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Stack direction="row" spacing={2} mb={2} style={{padding:10}}>
              <TextField
                label="Importo"
                value={newAdvance.amount}
                onChange={(e) => setNewAdvance({ ...newAdvance, amount: e.target.value })}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Metodo di pagamento</InputLabel>
                <Select
                  value={newAdvance.payment_method_id}
                  onChange={(e) => setNewAdvance({ ...newAdvance, payment_method_id: e.target.value })}
                  label="Metodo di pagamento"
                >
                  {paymentMethods.map((method) => (
                    <MenuItem key={method.id} value={method.id}>
                      {method.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Data"
                type="date"
                value={newAdvance.date}
                onChange={(e) => setNewAdvance({ ...newAdvance, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="contained" startIcon={<Add />} onClick={handleAddAdvance}>
                Aggiungi
              </Button>
            </Stack>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Importo</TableCell>
                  <TableCell>Metodo di Pagamento</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Data Creazione</TableCell>
                  <TableCell>Azioni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {advances.map((advance) => (
                  <TableRow key={advance.id}>
                    <TableCell>{advance.id}</TableCell>
                    <TableCell>
                      {editingAdvance && editingAdvance.id === advance.id ? (
                        <TextField
                          value={editingAdvance.amount}
                          onChange={(e) => setEditingAdvance({ ...editingAdvance, amount: e.target.value })}
                        />
                      ) : (
                        advance.amount
                      )}
                    </TableCell>
                    <TableCell>
                      {editingAdvance && editingAdvance.id === advance.id ? (
                        <FormControl sx={{ minWidth: 120 }}>
                          <Select
                            value={editingAdvance.payment_method_id}
                            onChange={(e) => setEditingAdvance({ ...editingAdvance, payment_method_id: e.target.value })}
                          >
                            {paymentMethods.map((method) => (
                              <MenuItem key={method.id} value={method.id}>
                                {method.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        paymentMethods.find(m => m.id === advance.payment_method_id)?.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingAdvance && editingAdvance.id === advance.id ? (
                        <TextField
                          type="date"
                          value={editingAdvance.date}
                          onChange={(e) => setEditingAdvance({ ...editingAdvance, date: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                      ) : (
                        moment(advance.date).format('DD-MM-YYYY')
                      )}
                    </TableCell>
                    <TableCell>{moment(advance.created_at).format('DD-MM-YYYY HH:mm:ss')}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditAdvance(advance.id)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteAdvance(advance.id)}>
                        <Trash />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

AdvancesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  contractId: PropTypes.number
};

export default AdvancesModal;