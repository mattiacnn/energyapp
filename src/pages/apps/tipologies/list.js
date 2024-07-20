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


import { renderFilterTypes, GlobalFilter } from 'utils/react-table';

// assets
import { Add, Edit, Eye, Trash } from 'iconsax-react';
import { ThemeMode } from 'config';
import axios from 'utils/axios';
import AddAgent from './AddAgent';
import EditAgent from './EdiAgent';
import AgentView from './AgentView';
import AlertAgentDelete from './AlertAgentDelete';
import snackbar, { openSnackbar } from 'store/reducers/snackbar';
import { dispatch } from 'store';

const avatarImage = require.context('assets/images/users', true);

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, renderRowSubComponent, handleAdd, showHidden, setShowHidden}) {
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
      initialState: { pageIndex: 0, pageSize: 10, sortBy: [sortBy] }
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
      setHiddenColumns(['agent_bonus_2', 'agent_monthly_fee_2', 'hidden']);
    } else {
      setHiddenColumns(['agent_bonus_2', 'agent_monthly_fee_2', 'hidden']);
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
              Aggiungi tipologia
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

const TipologiesPage = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const [agents, setAgents] = useState([{}]);
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [customerDeleteId, setCustomerDeleteId] = useState();
  const [add, setAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  const handleAdd = () => {
    setAdd(!add);
    if (customer && !add) {
      setCustomer(null);
    }
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const fetchAgents = async () => {
    setLoading(true);
    const agents = await axios.get('/tipology/list',{params: {hidden: showHidden}});
    setAgents(agents.data.tipologies);
    // after 500ms setloading to false
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }

  const handleDelete = async () => {
    try {
      const deleteAgent = await axios.delete(`/tipology/${customerDeleteId.id}`);
      setOpen(false);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Tipologia cancellata con successo!',
          variant: 'Metodo di pagamento',
          alert: {
            color: 'success'
          },
          close: false
        })
      );
      if (deleteAgent.status === 200 && deleteAgent.data.deleted) {
        fetchAgents();
      } else if (deleteAgent.status === 200 && !deleteAgent.data.deleted) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Non puoi cancellare questa tipologia perchè associata ad un contratto. Prova a disabilitarla',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: false
          })
        );
      }
    } catch (err) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Errore durante la cancellazione della tipologia',
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
    fetchAgents();
  }, [])

 useEffect(() => {
    fetchAgents();
  }, [showHidden])

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
        Header: 'Nascosto',
        accessor: 'hidden',
        className: 'cell-center',
        disableSortBy: true,
      },
      {
        Header: 'Nome',
        accessor: 'name',
        Cell: ({ row }) => {
          const { values } = row;
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Stack spacing={0}>
                <Typography variant="subtitle1">{values.name}</Typography>
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
          const collapseIcon = row.isExpanded ? <Add style={{ color: theme.palette.error.main, transform: 'rotate(45deg)' }} /> : null;
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
                title="Edit"
              >
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomer(row.values);
                    handleAdd();
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
                    setCustomerDeleteId(row.values);
                  }}
                >
                  <Trash />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  const renderRowSubComponent = useCallback(({ row }) => <AgentView data={agents[Number(row.id)]} />, [agents]);

  return (
    <MainCard content={false}>
      {
        loading ?
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }} >
            <CircularProgress />
          </div>
          :
          <ScrollX>
            <ReactTable columns={columns} data={agents} handleAdd={handleAdd} renderRowSubComponent={renderRowSubComponent} setShowHidden={setShowHidden} showHidden={showHidden}/>
          </ScrollX>

      }
      <AlertAgentDelete title={customerDeleteId} open={open} handleClose={handleClose} handleDelete={handleDelete} />
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
        {
          customer ?
            <EditAgent
              customer={customer}
              onCancel={handleAdd}
              fetchAgents={fetchAgents}
            />
            : <AddAgent
              customer={customer}
              onCancel={handleAdd}
              fetchAgents={fetchAgents}
            />

        }
      </Dialog>
    </MainCard>
  );
};

TipologiesPage.propTypes = {
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

export default TipologiesPage;
