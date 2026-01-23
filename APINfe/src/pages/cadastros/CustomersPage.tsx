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
    MenuItem,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { customerService } from '../../services/customer.service';
import { useAuth } from '../../contexts/AuthContext';
import { Customer } from '../../types';
import { CpfCnpjInput } from '../../components/common/CpfCnpjInput';
import { CepInput } from '../../components/common/CepInput';

export const CustomersPage: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState<Partial<Customer>>({
        tipoPessoa: 'JURIDICA',
        cpfCnpj: '',
        nome: '',
        active: true,
    });

    const { data: customers, isLoading } = useQuery({
        queryKey: ['customers', user?.companyId],
        queryFn: () => customerService.getAll(user!.companyId),
        enabled: !!user?.companyId,
    });

    const createMutation = useMutation({
        mutationFn: customerService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            handleClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
            customerService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            handleClose();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: customerService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });

    const handleOpen = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData(customer);
        } else {
            setEditingCustomer(null);
            setFormData({
                tipoPessoa: 'JURIDICA',
                cpfCnpj: '',
                nome: '',
                active: true,
                companyId: user!.companyId,
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingCustomer(null);
    };

    const handleSubmit = () => {
        if (editingCustomer) {
            updateMutation.mutate({ id: editingCustomer.id, data: formData });
        } else {
            createMutation.mutate(formData as Omit<Customer, 'id'>);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Deseja realmente excluir este cliente?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Clientes</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Novo Cliente
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>CPF/CNPJ</TableCell>
                            <TableCell>Nome/Razão Social</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>UF</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers?.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell>{customer.cpfCnpj}</TableCell>
                                <TableCell>{customer.nome}</TableCell>
                                <TableCell>{customer.tipoPessoa}</TableCell>
                                <TableCell>{customer.uf || '-'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={customer.active ? 'Ativo' : 'Inativo'}
                                        color={customer.active ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpen(customer)} size="small">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(customer.id)} size="small">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Tipo de Pessoa"
                                value={formData.tipoPessoa}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        tipoPessoa: e.target.value as 'FISICA' | 'JURIDICA',
                                    })
                                }
                                required
                            >
                                <MenuItem value="FISICA">Pessoa Física</MenuItem>
                                <MenuItem value="JURIDICA">Pessoa Jurídica</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CpfCnpjInput
                                fullWidth
                                label="CPF/CNPJ"
                                value={formData.cpfCnpj || ''}
                                onChange={(value) => setFormData({ ...formData, cpfCnpj: value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={formData.tipoPessoa === 'FISICA' ? 'Nome' : 'Razão Social'}
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="IE"
                                value={formData.ie || ''}
                                onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email para NF-e"
                                type="email"
                                value={formData.emailNfe || ''}
                                onChange={(e) => setFormData({ ...formData, emailNfe: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Logradouro"
                                value={formData.logradouro || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, logradouro: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Número"
                                value={formData.numero || ''}
                                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Complemento"
                                value={formData.complemento || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, complemento: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Bairro"
                                value={formData.bairro || ''}
                                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Município"
                                value={formData.nomeMunicipio || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, nomeMunicipio: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="UF"
                                value={formData.uf || ''}
                                onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                                inputProps={{ maxLength: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <CepInput
                                fullWidth
                                label="CEP"
                                value={formData.cep || ''}
                                onChange={(value) => setFormData({ ...formData, cep: value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
