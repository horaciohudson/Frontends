import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  TablePagination,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  AccountBalance as AccountBalanceIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Star as StarIcon
} from '@mui/icons-material';
import type {
  BankAccount,
  BankAccountPageResponse
} from '../../types/BankAccount';
import {
  BankAccountType,
  BankAccountStatus,
  BankAccountTypeLabels,
  BankAccountStatusLabels
} from '../../types/BankAccount';
import { bankAccountService } from '../../services/bankAccountService';

interface BankAccountListProps {
  onEdit?: (bankAccount: BankAccount) => void;
  onView?: (bankAccount: BankAccount) => void;
  onCreate?: () => void;
}

const BankAccountList: React.FC<BankAccountListProps> = ({ onEdit, onView, onCreate }) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<BankAccountType | ''>('');
  const [statusFilter, setStatusFilter] = useState<BankAccountStatus | ''>('');
  const [sortBy, setSortBy] = useState('bankName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Carregar dados
  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response: BankAccountPageResponse = await bankAccountService.findAll(
        page,
        rowsPerPage,
        sortBy,
        sortDir
      );

      setBankAccounts(response.content);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contas bancárias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBankAccounts();
  }, [page, rowsPerPage, sortBy, sortDir]);

  // Filtrar dados localmente
  const filteredBankAccounts = bankAccounts.filter(account => {
    const matchesSearch = !searchTerm ||
      account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.includes(searchTerm);

    const matchesType = !typeFilter || account.accountType === typeFilter;
    const matchesStatus = !statusFilter || account.accountStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Handlers
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: BankAccountStatus) => {
    switch (status) {
      case BankAccountStatus.ACTIVE:
        return 'success';
      case BankAccountStatus.INACTIVE:
        return 'warning';
      case BankAccountStatus.CLOSED:
        return 'error';
      case BankAccountStatus.SUSPENDED:
        return 'error';
      case BankAccountStatus.PENDING:
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: BankAccountType) => {
    switch (type) {
      case BankAccountType.CHECKING:
        return 'primary';
      case BankAccountType.SAVINGS:
        return 'secondary';
      case BankAccountType.INVESTMENT:
        return 'success';
      case BankAccountType.CREDIT:
        return 'warning';
      case BankAccountType.CASH:
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" display="flex" alignItems="center">
          <AccountBalanceIcon sx={{ mr: 1 }} />
          Contas Bancárias
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreate}
          size="large"
        >
          Nova Conta
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
            <Box flex="1" minWidth="300px">
              <TextField
                fullWidth
                label="Buscar"
                placeholder="Nome, código, banco ou número da conta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Box>
            <Box minWidth="200px">
              <FormControl fullWidth>
                <InputLabel>Tipo de Conta</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as BankAccountType)}
                  label="Tipo de Conta"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Object.values(BankAccountType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {BankAccountTypeLabels[type]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box minWidth="200px">
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as BankAccountStatus)}
                  label="Status"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Object.values(BankAccountStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {BankAccountStatusLabels[status]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Box display="flex" gap={1}>
                <Tooltip title="Limpar filtros">
                  <IconButton onClick={clearFilters}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Atualizar">
                  <IconButton onClick={loadBankAccounts}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabela */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Button
                    variant="text"
                    onClick={() => handleSort('accountCode')}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Código
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="text"
                    onClick={() => handleSort('accountName')}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Nome da Conta
                  </Button>
                </TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>
                  <Button
                    variant="text"
                    onClick={() => handleSort('bankName')}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Banco
                  </Button>
                </TableCell>
                <TableCell>Número da Conta</TableCell>
                <TableCell align="right">
                  <Button
                    variant="text"
                    onClick={() => handleSort('currentBalance')}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Saldo Atual
                  </Button>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBankAccounts.map((account) => (
                <TableRow key={account.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {account.isMainAccount && (
                        <Tooltip title="Conta Principal">
                          <StarIcon color="warning" sx={{ mr: 1 }} />
                        </Tooltip>
                      )}
                      {account.accountCode}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {account.accountName}
                    </Typography>
                    {account.description && (
                      <Typography variant="caption" color="text.secondary">
                        {account.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={BankAccountTypeLabels[account.accountType]}
                      color={getTypeColor(account.accountType) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{account.bankName}</TableCell>
                  <TableCell>
                    {account.accountNumber}
                    {account.accountDigit && `-${account.accountDigit}`}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color={account.currentBalance >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(account.currentBalance)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={BankAccountStatusLabels[account.accountStatus]}
                      color={getStatusColor(account.accountStatus) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          onClick={() => onView?.(account)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => onEdit?.(account)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginação */}
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      </Card>

      {/* FAB para adicionar */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={onCreate}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default BankAccountList;