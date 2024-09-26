import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'utils/axios';

const StatusChangeDialog = ({ open, onClose, contractId, onStatusChange, currentStatus }) => {
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || '');

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await axios.get('/status/list');
        setStatuses(response.data.status);
      } catch (error) {
        console.error('Failed to fetch statuses', error);
      }
    };

    fetchStatuses();
  }, []);

  useEffect(() => {
    setSelectedStatus(currentStatus || '');
  }, [currentStatus]);

  const handleChangeStatus = async () => {
    try {
      await axios.put('/contract/update/', { id: contractId, status_id: selectedStatus });
      
      onStatusChange(selectedStatus);
      onClose();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cambia Status</DialogTitle>
      <DialogContent>
        <FormControl fullWidth variant="outlined" sx={{marginTop:1}}>
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            label="Status"
          >
            {statuses?.map((status) => (
              <MenuItem key={status.id} value={status.id}>
                {status.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Annulla</Button>
        <Button onClick={handleChangeStatus} color="primary">Salva</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusChangeDialog;
