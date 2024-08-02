// it.js
import { it } from 'date-fns/locale';

const translations = {
  locale: it,
  months: [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ],
  weekDays: [
    'Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'
  ],
  selectDate: 'Seleziona Data',
  selectRange: 'Seleziona Intervallo',
  last7Days: 'Ultimi 7 giorni',
  last30Days: 'Ultimi 30 giorni',
  lastMonth: 'Ultimo mese',
  thisMonth: 'Questo mese',
  lastWeek: 'Settimana scorsa',
  thisWeek: 'Questa settimana',
  today: 'Oggi'
};

export default translations;
