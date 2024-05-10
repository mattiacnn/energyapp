import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState, Fragment } from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';

// third-party
import { PatternFormat } from 'react-number-format';
import { useFilters, useExpanded, useGlobalFilter, useRowSelect, useSortBy, useTable, usePagination } from 'react-table';

// project-imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import { PopupTransition } from 'components/@extended/Transitions';
import {
  CSVExport,
  HeaderSort,
  IndeterminateCheckbox,
  SortingSelect,
  TablePagination,
  TableRowSelection
} from 'components/third-party/ReactTable';

import AddCustomer from 'sections/apps/customer/AddCustomer';
import CustomerView from 'sections/apps/customer/CustomerView';
import AlertCustomerDelete from 'sections/apps/customer/AlertCustomerDelete';

import makeData from 'data/react-table';
import { renderFilterTypes, GlobalFilter } from 'utils/react-table';

// assets
import { Add, Edit, ElementPlus, Eye, Trash } from 'iconsax-react';
import { ThemeMode } from 'config';
import axios from 'utils/axios';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { selectClient, updateClient } from 'store/reducers/client';
import { openSnackbar } from 'store/reducers/snackbar';

const avatarImage = require.context('assets/images/users', true);

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, renderRowSubComponent, handleAdd, setShowHidden, showHidden }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const filterTypes = useMemo(() => renderFilterTypes, []);
  const sortBy = { id: 'id', desc: false };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    setHiddenColumns,
    allColumns,
    visibleColumns,
    rows,
    page,
    gotoPage,
    setPageSize,
    state: { globalFilter, selectedRowIds, pageIndex, pageSize, expanded },
    preGlobalFilteredRows,
    setGlobalFilter,
    setSortBy,
    selectedFlatRows
  } = useTable(
    {
      columns,
      data,
      filterTypes,
      initialState: { pageIndex: 0, pageSize: 10, hiddenColumns: ['avatar', 'email'], sortBy: [sortBy] }
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect
  );

  useEffect(() => {
    if (matchDownSM) {
      setHiddenColumns(['age', 'phone', 'visits', 'email', 'status', 'avatar']);
    } else {
      setHiddenColumns(['avatar', 'email']);
    }
    // eslint-disable-next-line
  }, [matchDownSM]);

  return (
    <>
      <TableRowSelection selected={Object.keys(selectedRowIds).length} />
      <Stack spacing={3}>

        <Stack
          direction={matchDownSM ? 'column' : 'row'}
          spacing={1}
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 3, pb: 0 }}
        >
          <div>
            <Button variant="outlined" startIcon={<Eye />} onClick={() => setShowHidden(!showHidden)} size="small" style={{ marginRight: 20 }}>
              {
                showHidden ? "Nascondi cancellati" : "Mostra cancellati"
              }
            </Button>
            <GlobalFilter preGlobalFilteredRows={preGlobalFilteredRows} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
          </div>
          <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={2}>
            <SortingSelect sortBy={sortBy.id} setSortBy={setSortBy} allColumns={allColumns} />
            <Button variant="contained" startIcon={<Add />} onClick={handleAdd} size="small">
              Aggiungi cliente
            </Button>
          </Stack>
        </Stack>
        <Table {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup} {...headerGroup.getHeaderGroupProps()} sx={{ '& > th:first-of-type': { width: '58px' } }}>
                {headerGroup.headers.map((column) => (
                  <TableCell key={column} {...column.getHeaderProps([{ className: column.className }])}>
                    <HeaderSort column={column} sort />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row);
              const rowProps = row.getRowProps();

              return (
                <Fragment key={i}>
                  <TableRow
                    {...row.getRowProps()}
                    onClick={() => {
                      row.toggleRowSelected();
                    }}
                    sx={{ cursor: 'pointer', bgcolor: row.isSelected ? alpha(theme.palette.primary.lighter, 0.35) : 'inherit' }}
                  >
                    {row.cells.map((cell) => (
                      <TableCell key={cell} {...cell.getCellProps([{ className: cell.column.className }])}>
                        {cell.render('Cell')}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.isExpanded && renderRowSubComponent({ row, rowProps, visibleColumns, expanded })}
                </Fragment>
              );
            })}
            <TableRow sx={{ '&:hover': { bgcolor: 'transparent !important' } }}>
              <TableCell sx={{ p: 2, py: 3 }} colSpan={9}>
                <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Stack>
    </>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  getHeaderProps: PropTypes.func,
  handleAdd: PropTypes.func,
  renderRowSubComponent: PropTypes.any
};

// ==============================|| CUSTOMER - LIST ||============================== //

const CustomerListPage = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [customerDelete, setCustomerDelete] = useState();
  const [add, setAdd] = useState(false);
  const [customers, setCustomers] = useState([{}]);
  const [loading, setLoading] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  const navigation = useNavigate();
  const client = useSelector(selectClient);
  const dispatch = useDispatch();

  const [agentList, setAgentList] = useState([{}]);

  const handleAdd = () => {
    navigation('/apps/new-client/create/personal');
  };
  const handleUpdate = (customer) => {
    let obj = { updating: true, id: customer.id };
    dispatch(updateClient(obj));
    navigation('/apps/new-client/create/personal');
  };
  const handleClose = async (hasDelete) => {
    try {
      if (!hasDelete) {
        setOpen(!open);
        return;
      }
      // delete customer
      const response = await axios.delete('/client/' + customerDelete.id);
      if (response.status === 200 && response.data.deleted) {
        fetchCustomers();
        setOpen(!open);
      } else if (response.status === 200 && !response.data.deleted) {
        setOpen(!open);
        dispatch(
          openSnackbar({
            open: true,
            message: 'Non puoi cancellare questo cliente perchè ha dei contratti associati. Prova a disattivarlo',
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
      dispatch(
        openSnackbar({
          open: true,
          message: 'Errore durante l\'eliminazione del cliente',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
    }

  };
  const fetchAgents = async () => {
    try {
      const response = await axios.get('/agent/list');
      const { agents } = response.data;

      setAgentList(agents);
    } catch (error) {
      console.error(error);
    }
  }

  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: ({ getToggleAllPageRowsSelectedProps }) => <IndeterminateCheckbox indeterminate {...getToggleAllPageRowsSelectedProps()} />,
        accessor: 'selection',
        Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
        disableSortBy: true
      },
      {
        Header: '#',
        accessor: 'id',
        className: 'cell-center'
      },
      {
        Header: 'Nome',
        accessor: 'first_name',
        Cell: ({ row }) => {
          const { values } = row;
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Stack spacing={0}>
                <Typography color="text.secondary">{values.first_name}</Typography>
              </Stack>
            </Stack>
          );
        }
      },
      {
        Header: 'Cognome',
        accessor: 'last_name',
        Cell: ({ row }) => {
          const { values } = row;
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Stack spacing={0}>
                <Typography color="text.secondary">{values.last_name}</Typography>
              </Stack>
            </Stack>
          );
        }
      },
      {
        Header: 'Agente associato',
        accessor: 'agent',
        className: 'cell-right',
        Cell: ({ row }) => {
          const { values } = row;
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Stack spacing={0}>
                <Typography color="text.secondary">
                  {values.agent}
                </Typography>
              </Stack>
            </Stack>
          );
        }
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Contatto',
        accessor: 'phone',
        Cell: ({ row }) => {
          const { values } = row;
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Stack spacing={0}>
                <Typography color="text.secondary">{values.phone}</Typography>
              </Stack>
            </Stack>
          );
        }
      },
      {
        Header: 'Azioni',
        className: 'cell-center',
        disableSortBy: true,
        Cell: ({ row }) => {
          const collapseIcon = row.isExpanded ? <Add style={{ color: theme.palette.error.main, transform: 'rotate(45deg)' }} /> : <Eye />;
          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              <Tooltip
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
                      opacity: 0.9
                    }
                  }
                }}
                title="Crea contratto"
              >
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    navigation('/apps/contratti/create/' + row.values.id);
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
              <Tooltip
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
                      opacity: 0.9
                    }
                  }
                }}
                title="View"
              >
                <IconButton
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomer(row.values);
                    handleUpdate(row.values);
                  }}
                >
                  {collapseIcon}
                </IconButton>
              </Tooltip>
              <Tooltip
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
                      opacity: 0.9
                    }
                  }
                }}
                title="Edit"
              >
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomer(row.values);
                    handleUpdate(row.values);
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
                      opacity: 0.9
                    }
                  }
                }}
                title="Delete"
              >
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                    setCustomerDelete(row.values);
                  }}
                >
                  <Trash />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  const fetchCustomers = async () => {
    const customers = await axios.get('/client/list', { params: { hidden: showHidden } });
    setCustomers(customers.data.clients);
  }

  useEffect(() => {
    setLoading(true);
    fetchCustomers().then(() => {
      fetchAgents().then(() => {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      })
    })
  }, [])

  useEffect(() => {
    fetchCustomers();
  }, [showHidden])

  const renderRowSubComponent = useCallback(({ row }) => <CustomerView data={customers[Number(row.id)]} />, [customers]);

  return (
    <MainCard content={false}>
      {loading ?
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }} >
          <CircularProgress />
        </div>
        :
        <ScrollX>
          <ReactTable columns={columns} data={customers} handleAdd={handleAdd} handleUpdate={handleUpdate} renderRowSubComponent={renderRowSubComponent} setShowHidden={setShowHidden} showHidden={showHidden} />
        </ScrollX>
      }
      <AlertCustomerDelete title={customerDelete?.first_name + " " + customerDelete?.last_name} open={open} handleClose={handleClose} />
      {/* add customer dialog */}
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={handleAdd}
        open={add}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <AddCustomer customer={customer} onCancel={handleAdd} fetchCustomers={fetchCustomers} />
      </Dialog>
    </MainCard>
  );
};

CustomerListPage.propTypes = {
  row: PropTypes.object,
  values: PropTypes.object,
  avatar: PropTypes.object,
  message: PropTypes.string,
  fatherName: PropTypes.string,
  email: PropTypes.string,
  value: PropTypes.object,
  isExpanded: PropTypes.bool,
  toggleRowExpanded: PropTypes.func,
  getToggleAllPageRowsSelectedProps: PropTypes.func,
  id: PropTypes.number
};

export default CustomerListPage;
