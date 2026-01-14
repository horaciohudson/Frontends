import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import type {
  BankAccount,
  BankAccountFormData
} from '../../types/BankAccount';
import {
  BankAccountType,
  BankAccountStatus,
  BankAccountTypeLabels,
  BankAccountStatusLabels
} from '../../types/BankAccount';
import { bankAccountService } from '../../services/bankAccountService';

interface BankAccountFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (bankAccount: BankAccount) => void;
  bankAccount?: BankAccount | null;
  mode: 'create' | 'edit' | 'view';
}

const validationSchema = Yup.object({
  accountCode: Yup.string()
    .required('Código da conta é obrigatório')
    .min(2, 'Código deve ter pelo menos 2 caracteres')
    .max(20, 'Código deve ter no máximo 20 caracteres'),
  accountName: Yup.string()
    .required('Nome da conta é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  accountType: Yup.string()
    .required('Tipo da conta é obrigatório')
    .oneOf(Object.values(BankAccountType), 'Tipo inválido'),
  bankCode: Yup.string()
    .required('Código do banco é obrigatório')
    .matches(/^\d{3}$/, 'Código do banco deve ter 3 dígitos'),
  bankName: Yup.string()
    .required('Nome do banco é obrigatório')
    .min(2, 'Nome do banco deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do banco deve ter no máximo 100 caracteres'),
  accountNumber: Yup.string()
    .required('Número da conta é obrigatório')
    .min(4, 'Número da conta deve ter pelo menos 4 caracteres')
    .max(20, 'Número da conta deve ter no máximo 20 caracteres'),
  accountDigit: Yup.string()
    .max(2, 'Dígito deve ter no máximo 2 caracteres'),
  agencyCode: Yup.string()
    .max(10, 'Código da agência deve ter no máximo 10 caracteres'),
  agencyName: Yup.string()
    .max(100, 'Nome da agência deve ter no máximo 100 caracteres'),
  initialBalance: Yup.number()
    .required('Saldo inicial é obrigatório')
    .min(0, 'Saldo inicial não pode ser negativo'),
  creditLimit: Yup.number()
    .min(0, 'Limite de crédito não pode ser negativo'),
  accountStatus: Yup.string()
    .required('Status da conta é obrigatório')
    .oneOf(Object.values(BankAccountStatus), 'Status inválido'),
  openingDate: Yup.date()
    .max(new Date(), 'Data de abertura não pode ser futura'),
  accountManager: Yup.string()
    .max(100, 'Nome do gerente deve ter no máximo 100 caracteres'),
  managerPhone: Yup.string()
    .matches(/^[\d\s\-\(\)\+]+$/, 'Telefone inválido')
    .max(20, 'Telefone deve ter no máximo 20 caracteres'),
  managerEmail: Yup.string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  currencyCode: Yup.string()
    .max(3, 'Código da moeda deve ter no máximo 3 caracteres'),
  overdraftRate: Yup.number()
    .min(0, 'Taxa de juros não pode ser negativa')
    .max(100, 'Taxa de juros não pode ser maior que 100%'),
  reconciliationCode: Yup.string()
    .max(50, 'Código de reconciliação deve ter no máximo 50 caracteres'),
  notes: Yup.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres'),
  tags: Yup.string()
    .max(200, 'Tags devem ter no máximo 200 caracteres')
});

const BankAccountForm: React.FC<BankAccountFormProps> = ({
  open,
  onClose,
  onSave,
  bankAccount,
  mode
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReadOnly = mode === 'view';
  const isEdit = mode === 'edit';

  const formik = useFormik<BankAccountFormData>({
    initialValues: {
      accountCode: '',
      accountName: '',
      description: '',
      accountType: BankAccountType.CHECKING,
      bankCode: '',
      bankName: '',
      agencyCode: '',
      agencyName: '',
      accountNumber: '',
      accountDigit: '',
      initialBalance: 0,
      creditLimit: 0,
      accountStatus: BankAccountStatus.ACTIVE,
      openingDate: new Date().toISOString().split('T')[0],
      accountManager: '',
      managerPhone: '',
      managerEmail: '',
      currencyCode: 'BRL',
      isMainAccount: false,
      allowsOverdraft: false,
      overdraftRate: 0,
      autoReconciliation: true,
      reconciliationCode: '',
      notes: '',
      tags: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        let result: BankAccount;
        if (isEdit && bankAccount?.id) {
          result = await bankAccountService.update(bankAccount.id, values);
        } else {
          result = await bankAccountService.create(values);
        }

        onSave(result);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar conta bancária');
      } finally {
        setLoading(false);
      }
    }
  });

  // Carregar dados quando em modo de edição/visualização
  useEffect(() => {
    if (bankAccount && (isEdit || isReadOnly)) {
      formik.setValues({
        accountCode: bankAccount.accountCode || '',
        accountName: bankAccount.accountName || '',
        description: bankAccount.description || '',
        accountType: bankAccount.accountType || BankAccountType.CHECKING,
        bankCode: bankAccount.bankCode || '',
        bankName: bankAccount.bankName || '',
        agencyCode: bankAccount.agencyCode || '',
        agencyName: bankAccount.agencyName || '',
        accountNumber: bankAccount.accountNumber || '',
        accountDigit: bankAccount.accountDigit || '',
        initialBalance: bankAccount.initialBalance || 0,
        creditLimit: bankAccount.creditLimit || 0,
        accountStatus: bankAccount.accountStatus || BankAccountStatus.ACTIVE,
        openingDate: bankAccount.openingDate ? bankAccount.openingDate.split('T')[0] : '',
        accountManager: bankAccount.accountManager || '',
        managerPhone: bankAccount.managerPhone || '',
        managerEmail: bankAccount.managerEmail || '',
        currencyCode: bankAccount.currencyCode || 'BRL',
        isMainAccount: bankAccount.isMainAccount || false,
        allowsOverdraft: bankAccount.allowsOverdraft || false,
        overdraftRate: bankAccount.overdraftRate || 0,
        autoReconciliation: bankAccount.autoReconciliation !== false,
        reconciliationCode: bankAccount.reconciliationCode || '',
        notes: bankAccount.notes || '',
        tags: bankAccount.tags || ''
      });
    }
  }, [bankAccount, isEdit, isReadOnly]);

  const handleClose = () => {
    formik.resetForm();
    setError(null);
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <AccountBalanceIcon sx={{ mr: 1 }} />
          {mode === 'create' && 'Nova Conta Bancária'}
          {mode === 'edit' && 'Editar Conta Bancária'}
          {mode === 'view' && 'Visualizar Conta Bancária'}
        </Box>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Informações Básicas */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
            Informações Básicas
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  name="accountCode"
                  label="Código da Conta *"
                  value={formik.values.accountCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.accountCode && Boolean(formik.errors.accountCode)}
                  helperText={formik.touched.accountCode && formik.errors.accountCode}
                  disabled={isReadOnly}
                />
              </Box>
              <Box sx={{ flex: '2 1 400px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  name="accountName"
                  label="Nome da Conta *"
                  value={formik.values.accountName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.accountName && Boolean(formik.errors.accountName)}
                  helperText={formik.touched.accountName && formik.errors.accountName}
                  disabled={isReadOnly}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                name="description"
                label="Descrição"
                multiline
                rows={2}
                value={formik.values.description}
                onChange={formik.handleChange}
                disabled={isReadOnly}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Conta *</InputLabel>
                  <Select
                    name="accountType"
                    value={formik.values.accountType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.accountType && Boolean(formik.errors.accountType)}
                    label="Tipo de Conta *"
                    disabled={isReadOnly}
                  >
                    {Object.values(BankAccountType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {BankAccountTypeLabels[type]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <FormControl fullWidth>
                  <InputLabel>Status *</InputLabel>
                  <Select
                    name="accountStatus"
                    value={formik.values.accountStatus}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.accountStatus && Boolean(formik.errors.accountStatus)}
                    label="Status *"
                    disabled={isReadOnly}
                  >
                    {Object.values(BankAccountStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        {BankAccountStatusLabels[status]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Informações do Banco */}
          <Typography variant="h6" gutterBottom>
            Informações do Banco
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  name="bankCode"
                  label="Código do Banco *"
                  value={formik.values.bankCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.bankCode && Boolean(formik.errors.bankCode)}
                  helperText={formik.touched.bankCode && formik.errors.bankCode}
                  disabled={isReadOnly}
                  inputProps={{ maxLength: 3 }}
                />
              </Box>
              <Box sx={{ flex: '2 1 400px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  name="bankName"
                  label="Nome do Banco *"
                  value={formik.values.bankName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.bankName && Boolean(formik.errors.bankName)}
                  helperText={formik.touched.bankName && formik.errors.bankName}
                  disabled={isReadOnly}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  name="agencyCode"
                  label="Código da Agência"
                  value={formik.values.agencyCode}
                  onChange={formik.handleChange}
                  disabled={isReadOnly}
                />
              </Box>
              <Box sx={{ flex: '2 1 400px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  name="agencyName"
                  label="Nome da Agência"
                  value={formik.values.agencyName}
                  onChange={formik.handleChange}
                  disabled={isReadOnly}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '2 1 400px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  name="accountNumber"
                  label="Número da Conta *"
                  value={formik.values.accountNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
                  helperText={formik.touched.accountNumber && formik.errors.accountNumber}
                  disabled={isReadOnly}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  name="accountDigit"
                  label="Dígito"
                  value={formik.values.accountDigit}
                  onChange={formik.handleChange}
                  disabled={isReadOnly}
                  inputProps={{ maxLength: 2 }}
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Informações Financeiras */}
          <Typography variant="h6" gutterBottom>
            Informações Financeiras
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  name="initialBalance"
                  label="Saldo Inicial *"
                  type="number"
                  value={formik.values.initialBalance}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.initialBalance && Boolean(formik.errors.initialBalance)}
                  helperText={formik.touched.initialBalance && formik.errors.initialBalance}
                  disabled={isReadOnly}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  name="creditLimit"
                  label="Limite de Crédito"
                  type="number"
                  value={formik.values.creditLimit}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.creditLimit && Boolean(formik.errors.creditLimit)}
                  helperText={formik.touched.creditLimit && formik.errors.creditLimit}
                  disabled={isReadOnly}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>
                  }}
                />
              </Box>
            </Box>
            {isEdit && bankAccount && (
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  label="Saldo Atual"
                  value={formatCurrency(bankAccount.currentBalance)}
                  disabled
                  InputProps={{
                    readOnly: true
                  }}
                />
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  name="currencyCode"
                  label="Código da Moeda"
                  value={formik.values.currencyCode}
                  onChange={formik.handleChange}
                  disabled={isReadOnly}
                  inputProps={{ maxLength: 3 }}
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  name="openingDate"
                  label="Data de Abertura"
                  type="date"
                  value={formik.values.openingDate}
                  onChange={formik.handleChange}
                  disabled={isReadOnly}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Configurações */}
          <Typography variant="h6" gutterBottom>
            Configurações
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isMainAccount"
                      checked={formik.values.isMainAccount}
                      onChange={formik.handleChange}
                      disabled={isReadOnly}
                    />
                  }
                  label="Conta Principal"
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="allowsOverdraft"
                      checked={formik.values.allowsOverdraft}
                      onChange={formik.handleChange}
                      disabled={isReadOnly}
                    />
                  }
                  label="Permite Saque a Descoberto"
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="autoReconciliation"
                      checked={formik.values.autoReconciliation}
                      onChange={formik.handleChange}
                      disabled={isReadOnly}
                    />
                  }
                  label="Reconciliação Automática"
                />
              </Box>
            </Box>
            {formik.values.allowsOverdraft && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    name="overdraftRate"
                    label="Taxa de Juros (%)"
                    type="number"
                    value={formik.values.overdraftRate}
                    onChange={formik.handleChange}
                    disabled={isReadOnly}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Box>
              </Box>
            )}
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                name="reconciliationCode"
                label="Código de Reconciliação"
                value={formik.values.reconciliationCode}
                onChange={formik.handleChange}
                disabled={isReadOnly}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Gerente da Conta */}
          <Typography variant="h6" gutterBottom>
            Gerente da Conta
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  name="accountManager"
                  label="Nome do Gerente"
                  value={formik.values.accountManager}
                  onChange={formik.handleChange}
                  disabled={isReadOnly}
                />
              </Box>
              <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  name="managerPhone"
                  label="Telefone do Gerente"
                  value={formik.values.managerPhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.managerPhone && Boolean(formik.errors.managerPhone)}
                  helperText={formik.touched.managerPhone && formik.errors.managerPhone}
                  disabled={isReadOnly}
                />
              </Box>
              <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  name="managerEmail"
                  label="Email do Gerente"
                  type="email"
                  value={formik.values.managerEmail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.managerEmail && Boolean(formik.errors.managerEmail)}
                  helperText={formik.touched.managerEmail && formik.errors.managerEmail}
                  disabled={isReadOnly}
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Informações Adicionais */}
          <Typography variant="h6" gutterBottom>
            Informações Adicionais
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              name="notes"
              label="Observações"
              multiline
              rows={3}
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
              disabled={isReadOnly}
            />
            <TextField
              fullWidth
              name="tags"
              label="Tags (separadas por vírgula)"
              value={formik.values.tags}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.tags && Boolean(formik.errors.tags)}
              helperText={formik.touched.tags && formik.errors.tags}
              disabled={isReadOnly}
              placeholder="tag1, tag2, tag3"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleClose}
            startIcon={<CancelIcon />}
            disabled={loading}
          >
            {isReadOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isReadOnly && (
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading || !formik.isValid}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BankAccountForm;