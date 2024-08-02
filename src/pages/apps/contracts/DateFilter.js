import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Importa gli stili CSS
import 'react-date-range/dist/theme/default.css'; // Importa il tema predefinito
import translations from './it'; // Aggiorna il percorso
import './calendar.css'
const DateFilter = ({ column: { filterValue, setFilter } }) => {
    const [open, setOpen] = useState(false);
    const [selectionRange, setSelectionRange] = useState({
        startDate: filterValue?.startDate || new Date(),
        endDate: filterValue?.endDate || new Date(),
        key: 'selection'
    });

    const handleSelect = (ranges) => {
        const { selection } = ranges;
        setSelectionRange(selection);
    };

    const buttonText = (selectionRange.startDate && selectionRange.endDate) &&
    (selectionRange.startDate.toDateString() !== new Date().toDateString() ||
     selectionRange.endDate.toDateString() !== new Date().toDateString())
      ? `${selectionRange.startDate.toLocaleDateString()} - ${selectionRange.endDate.toLocaleDateString()}`
      : 'Seleziona Data';
  
    const handleApply = () => {
        setFilter({
            startDate: selectionRange.startDate,
            endDate: selectionRange.endDate
        });
        setOpen(false);
    };


    return (
        <div>
            <Button variant="outlined" onClick={() => setOpen(true)}>
                {buttonText}
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Seleziona Intervallo di Date</DialogTitle>
                <DialogContent>
                    <DateRangePicker
                        ranges={[selectionRange]}
                        onChange={handleSelect}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        months={2}
                        direction="horizontal"
                        locale={translations.locale}
                        staticRanges={[]}
                        show
                        inputRanges={[]}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary">
                        Annulla
                    </Button>
                    <Button onClick={handleApply} color="primary">
                        Applica
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default DateFilter;
