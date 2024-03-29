// third-party
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// project-imports
import chat from './chat';
import calendar from './calendar';
import menu from './menu';
import snackbar from './snackbar';
import productReducer from './product';
import cartReducer from './cart';
import kanban from './kanban';
import invoice from './invoice';
import { apiSlice } from "../api/apiSlice";
import auth from '../../features/auth/authSlice';

// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({
  chat,
  calendar,
  menu,
  snackbar,
  cart: persistReducer(
    {
      key: 'cart',
      storage,
      keyPrefix: 'able-pro-material-ts-'
    },
    cartReducer
  ),
  product: productReducer,
  kanban,
  invoice,
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth,
});

export default reducers;
