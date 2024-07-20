import { useState } from 'react';

// material-ui
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

// ==============================|| DIALOG - ALERT ||============================== //

export default function DeleteDialog({ open, handleClose, handleConfirm }) {


  return (
    <>
      <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <Box sx={{ p: 1, py: 1.5 }}>
          <DialogTitle id="alert-dialog-title">Sei sicuro di volere cancellare questo allegato?</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Cancellando questo allegato verrà eleminato permanentemenete.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="error" onClick={handleClose}>
              Annulla
            </Button>
            <Button variant="contained" onClick={handleConfirm}>
              Conferma
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
