import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { productService } from '../../services/product.service';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { CurrencyInput } from '../../components/common/CurrencyInput';

export const ProductsPage: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        companyId: user?.companyId || '',
        productCode: '',
        description: '',
        ncm: '',
        cfop: '',
        origem: '0',
        unitValue: 0,
        active: true,
    });

    const { data: products, isLoading, error: queryError, refetch } = useQuery({
        queryKey: ['products', user?.companyId],
        queryFn: () => {
            if (!user?.companyId) {
                throw new Error('ID da empresa não encontrado. Faça login novamente.');
            }
            return productService.getAll(user.companyId);
        },
        enabled: !!user?.companyId,
        retry: (failureCount, error: any) => {
            // Não tentar novamente para erros de autenticação
            if (error?.message?.includes('autenticado') || error?.message?.includes('403')) {
                return false;
            }
            return failureCount < 2;
        },
        onError: (error: any) => {
            console.error('Erro ao carregar produtos:', error);
            setError(error.message || 'Erro ao carregar produtos fiscais');
        },
    });

    const createMutation = useMutation({
        mutationFn: productService.create,
        onSuccess: (newProduct) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setSuccessMessage(`Produto "${newProduct.description}" criado com sucesso!`);
            handleClose();
        },
        onError: (error: any) => {
            console.error('Erro ao criar produto:', error);
            setError(error.message || 'Erro ao criar produto');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
            productService.update(id, data),
        onSuccess: (updatedProduct) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setSuccessMessage(`Produto "${updatedProduct.description}" atualizado com sucesso!`);
            handleClose();
        },
        onError: (error: any) => {
            console.error('Erro ao atualizar produto:', error);
            setError(error.message || 'Erro ao atualizar produto');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: productService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setSuccessMessage('Produto excluído com sucesso!');
        },
        onError: (error: any) => {
            console.error('Erro ao excluir produto:', error);
            setError(error.message || 'Erro ao excluir produto');
        },
    });

    const handleOpen = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                productCode: '',
                description: '',
                ncm: '',
                cfop: '',
                origem: '0',
                unitValue: 0,
                active: true,
                companyId: user!.companyId,
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingProduct(null);
        setError(null);
    };

    const handleSubmit = () => {
        setError(null);

        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct.id, data: formData });
        } else {
            createMutation.mutate(formData as Omit<Product, 'id'>);
        }
    };

    const handleDelete = (product: Product) => {
        if (window.confirm(`Deseja realmente excluir o produto "${product.description}"?`)) {
            deleteMutation.mutate(product.id);
        }
    };

    const handleRefresh = () => {
        setError(null);
        refetch();
    };

    const handleCloseError = () => {
        setError(null);
    };

    const handleCloseSuccess = () => {
        setSuccessMessage(null);
    };

    // Mostrar erro de carregamento se houver
    if (queryError) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={handleRefresh}>
                            Tentar Novamente
                        </Button>
                    }
                >
                    <Typography variant="h6" gutterBottom>
                        Erro ao Carregar Produtos Fiscais
                    </Typography>
                    <Typography variant="body2">
                        {(queryError as any)?.message || 'Erro desconhecido ao carregar produtos'}
                    </Typography>
                </Alert>
            </Box>
        );
    }

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                    Carregando produtos fiscais...
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Produtos Fiscais</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        Atualizar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                    >
                        Novo Produto
                    </Button>
                </Box>
            </Box>

            {/* Informações de status */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                    {products?.length || 0} produto(s) encontrado(s)
                    {user?.companyId && ` para a empresa ${user.companyId}`}
                </Typography>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell>NCM</TableCell>
                            <TableCell>CFOP</TableCell>
                            <TableCell>Valor Unitário</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                                        Nenhum produto fiscal encontrado.
                                        <br />
                                        Clique em "Novo Produto" para adicionar o primeiro produto.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products?.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.productCode}</TableCell>
                                    <TableCell>{product.description}</TableCell>
                                    <TableCell>{product.ncm}</TableCell>
                                    <TableCell>{product.cfop}</TableCell>
                                    <TableCell>{formatCurrency(product.unitValue)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={product.active ? 'Ativo' : 'Inativo'}
                                            color={product.active ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={() => handleOpen(product)}
                                            size="small"
                                            title="Editar produto"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(product)}
                                            size="small"
                                            title="Excluir produto"
                                            disabled={deleteMutation.isLoading}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog para criar/editar produto */}
            <Dialog open={open} maxWidth="md" fullWidth disableEscapeKeyDown>
                <DialogTitle>
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Código do Produto"
                                value={formData.productCode}
                                onChange={(e) =>
                                    setFormData({ ...formData, productCode: e.target.value })
                                }
                                required
                                error={!formData.productCode}
                                helperText={!formData.productCode ? 'Campo obrigatório' : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="NCM"
                                value={formData.ncm}
                                onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                                required
                                inputProps={{ maxLength: 8 }}
                                error={!formData.ncm}
                                helperText={!formData.ncm ? 'Campo obrigatório' : 'Máximo 8 dígitos'}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descrição"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                required
                                error={!formData.description}
                                helperText={!formData.description ? 'Campo obrigatório' : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="CFOP"
                                value={formData.cfop}
                                onChange={(e) => setFormData({ ...formData, cfop: e.target.value })}
                                required
                                inputProps={{ maxLength: 4 }}
                                error={!formData.cfop}
                                helperText={!formData.cfop ? 'Campo obrigatório' : 'Máximo 4 dígitos'}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Origem"
                                value={formData.origem}
                                onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                                required
                                inputProps={{ maxLength: 1 }}
                                error={!formData.origem}
                                helperText={!formData.origem ? 'Campo obrigatório' : '1 dígito'}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CurrencyInput
                                fullWidth
                                label="Valor Unitário"
                                value={formData.unitValue || 0}
                                onChange={(value) => setFormData({ ...formData, unitValue: value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="CEST"
                                value={formData.cest || ''}
                                onChange={(e) => setFormData({ ...formData, cest: e.target.value })}
                                inputProps={{ maxLength: 7 }}
                                helperText="Opcional - Máximo 7 dígitos"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                    >
                        {createMutation.isLoading || updateMutation.isLoading ? (
                            <CircularProgress size={20} />
                        ) : (
                            'Salvar'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbars para feedback */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={4000}
                onClose={handleCloseSuccess}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};
