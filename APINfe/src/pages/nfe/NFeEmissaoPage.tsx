import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Paper,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Button,
    Grid,
    TextField,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Divider,
    MenuItem,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import { productService } from '../../services/product.service';
import { nfeService } from '../../services/nfe.service';
import { useAuth } from '../../contexts/AuthContext';
import { Customer, Product, ItemNFe, Destinatario } from '../../types';
import { CpfCnpjInput } from '../../components/common/CpfCnpjInput';
import { CurrencyInput } from '../../components/common/CurrencyInput';
import { formatCurrency } from '../../utils/formatters';
import { downloadBlob } from '../../utils/formatters';

const steps = ['Destinatário', 'Itens', 'Pagamento', 'Revisão'];

export const NFeEmissaoPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Dados do destinatário
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [destinatario, setDestinatario] = useState<Partial<Destinatario>>({
        tipoPessoa: 'JURIDICA',
        cpfCnpj: '',
        nome: '',
        logradouro: '',
        numero: '',
        bairro: '',
        nomeMunicipio: '',
        uf: '',
        cep: '',
        codigoMunicipio: 0,
    });

    // Itens da nota
    const [itens, setItens] = useState<ItemNFe[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantidade, setQuantidade] = useState(1);

    // Pagamento
    const [formaPagamento, setFormaPagamento] = useState('0');
    const [meioPagamento, setMeioPagamento] = useState('01');

    const { data: customers } = useQuery({
        queryKey: ['customers', user?.companyId],
        queryFn: () => customerService.getAll(user!.companyId),
        enabled: !!user?.companyId,
    });

    const { data: products } = useQuery({
        queryKey: ['products', user?.companyId],
        queryFn: () => productService.getAll(user!.companyId),
        enabled: !!user?.companyId,
    });

    const handleCustomerSelect = (customer: Customer | null) => {
        setSelectedCustomer(customer);
        if (customer) {
            setDestinatario({
                tipoPessoa: customer.tipoPessoa,
                cpfCnpj: customer.cpfCnpj,
                ie: customer.ie,
                nome: customer.nome,
                logradouro: customer.logradouro || '',
                numero: customer.numero || '',
                complemento: customer.complemento,
                bairro: customer.bairro || '',
                codigoMunicipio: customer.codigoMunicipio || 0,
                nomeMunicipio: customer.nomeMunicipio || '',
                uf: customer.uf || '',
                cep: customer.cep || '',
                email: customer.emailNfe,
            });
        }
    };

    const handleAddItem = () => {
        if (!selectedProduct) return;

        const newItem: ItemNFe = {
            numeroItem: itens.length + 1,
            codigoProduto: selectedProduct.productCode,
            descricao: selectedProduct.description,
            ncm: selectedProduct.ncm,
            cest: selectedProduct.cest,
            cfop: selectedProduct.cfop,
            unidadeComercial: 'UN',
            quantidadeComercial: quantidade,
            valorUnitarioComercial: selectedProduct.unitValue,
            valorTotal: quantidade * selectedProduct.unitValue,
            origem: selectedProduct.origem,
            cstIcms: selectedProduct.cstIcms,
            csosn: selectedProduct.csosn,
            aliquotaIcms: selectedProduct.aliquotaIcms,
            valorIcms: 0,
            cstPis: selectedProduct.cstPis,
            aliquotaPis: selectedProduct.aliquotaPis,
            valorPis: 0,
            cstCofins: selectedProduct.cstCofins,
            aliquotaCofins: selectedProduct.aliquotaCofins,
            valorCofins: 0,
        };

        setItens([...itens, newItem]);
        setSelectedProduct(null);
        setQuantidade(1);
    };

    const handleRemoveItem = (index: number) => {
        const newItens = itens.filter((_, i) => i !== index);
        // Renumerar itens
        const renumbered = newItens.map((item, i) => ({
            ...item,
            numeroItem: i + 1,
        }));
        setItens(renumbered);
    };

    const calcularTotais = () => {
        const valorProdutos = itens.reduce((sum, item) => sum + item.valorTotal, 0);
        const valorIcms = itens.reduce((sum, item) => sum + (item.valorIcms || 0), 0);
        const valorPis = itens.reduce((sum, item) => sum + (item.valorPis || 0), 0);
        const valorCofins = itens.reduce((sum, item) => sum + (item.valorCofins || 0), 0);

        return {
            baseCalculoIcms: valorProdutos,
            valorIcms,
            valorIcmsSt: 0,
            valorProdutos,
            valorFrete: 0,
            valorSeguro: 0,
            valorDesconto: 0,
            valorOutrasDespesas: 0,
            valorIpi: 0,
            valorPis,
            valorCofins,
            valorNota: valorProdutos,
        };
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handlePreview = async () => {
        setLoading(true);
        setError('');
        try {
            const totais = calcularTotais();
            const nfeData = {
                companyId: user!.companyId,
                destinatario: destinatario as Destinatario,
                itens,
                totais,
                pagamento: {
                    formaPagamento,
                    meioPagamento,
                    valorPagamento: totais.valorNota,
                },
            };

            const blob = await nfeService.preview(nfeData);
            downloadBlob(blob, 'preview-danfe.pdf');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao gerar preview');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const totais = calcularTotais();
            const nfeData = {
                companyId: user!.companyId,
                modelo: '55',
                serie: 1,
                tipoNf: 'SAIDA' as const,
                destinatario: destinatario as Destinatario,
                itens,
                totais,
                pagamento: {
                    formaPagamento,
                    meioPagamento,
                    valorPagamento: totais.valorNota,
                },
            };

            const result = await nfeService.create(nfeData);
            navigate(`/nfe/detalhes/${result.id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao emitir NF-e');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Autocomplete
                                options={customers || []}
                                getOptionLabel={(option) => `${option.cpfCnpj} - ${option.nome}`}
                                value={selectedCustomer}
                                onChange={(_, value) => handleCustomerSelect(value)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Buscar Cliente" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Tipo de Pessoa"
                                value={destinatario.tipoPessoa}
                                onChange={(e) =>
                                    setDestinatario({
                                        ...destinatario,
                                        tipoPessoa: e.target.value as 'FISICA' | 'JURIDICA',
                                    })
                                }
                            >
                                <MenuItem value="FISICA">Pessoa Física</MenuItem>
                                <MenuItem value="JURIDICA">Pessoa Jurídica</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CpfCnpjInput
                                fullWidth
                                label="CPF/CNPJ"
                                value={destinatario.cpfCnpj || ''}
                                onChange={(value) =>
                                    setDestinatario({ ...destinatario, cpfCnpj: value })
                                }
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nome/Razão Social"
                                value={destinatario.nome}
                                onChange={(e) =>
                                    setDestinatario({ ...destinatario, nome: e.target.value })
                                }
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Logradouro"
                                value={destinatario.logradouro}
                                onChange={(e) =>
                                    setDestinatario({ ...destinatario, logradouro: e.target.value })
                                }
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Número"
                                value={destinatario.numero}
                                onChange={(e) =>
                                    setDestinatario({ ...destinatario, numero: e.target.value })
                                }
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Bairro"
                                value={destinatario.bairro}
                                onChange={(e) =>
                                    setDestinatario({ ...destinatario, bairro: e.target.value })
                                }
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Município"
                                value={destinatario.nomeMunicipio}
                                onChange={(e) =>
                                    setDestinatario({ ...destinatario, nomeMunicipio: e.target.value })
                                }
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="UF"
                                value={destinatario.uf}
                                onChange={(e) =>
                                    setDestinatario({ ...destinatario, uf: e.target.value })
                                }
                                required
                                inputProps={{ maxLength: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="CEP"
                                value={destinatario.cep}
                                onChange={(e) =>
                                    setDestinatario({ ...destinatario, cep: e.target.value })
                                }
                                required
                            />
                        </Grid>
                    </Grid>
                );

            case 1:
                return (
                    <Box>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    options={products || []}
                                    getOptionLabel={(option) =>
                                        `${option.productCode} - ${option.description}`
                                    }
                                    value={selectedProduct}
                                    onChange={(_, value) => setSelectedProduct(value)}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Produto" />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Quantidade"
                                    value={quantidade}
                                    onChange={(e) => setQuantidade(Number(e.target.value))}
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddItem}
                                    disabled={!selectedProduct}
                                    sx={{ height: '56px' }}
                                >
                                    Adicionar
                                </Button>
                            </Grid>
                        </Grid>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Item</TableCell>
                                        <TableCell>Descrição</TableCell>
                                        <TableCell>Qtd</TableCell>
                                        <TableCell>Valor Unit.</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Ações</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {itens.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.numeroItem}</TableCell>
                                            <TableCell>{item.descricao}</TableCell>
                                            <TableCell>{item.quantidadeComercial}</TableCell>
                                            <TableCell>
                                                {formatCurrency(item.valorUnitarioComercial)}
                                            </TableCell>
                                            <TableCell>{formatCurrency(item.valorTotal)}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveItem(index)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {itens.length === 0 && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Nenhum item adicionado. Adicione pelo menos um produto.
                            </Alert>
                        )}
                    </Box>
                );

            case 2:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Forma de Pagamento"
                                value={formaPagamento}
                                onChange={(e) => setFormaPagamento(e.target.value)}
                            >
                                <MenuItem value="0">À vista</MenuItem>
                                <MenuItem value="1">À prazo</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Meio de Pagamento"
                                value={meioPagamento}
                                onChange={(e) => setMeioPagamento(e.target.value)}
                            >
                                <MenuItem value="01">Dinheiro</MenuItem>
                                <MenuItem value="02">Cheque</MenuItem>
                                <MenuItem value="03">Cartão de Crédito</MenuItem>
                                <MenuItem value="04">Cartão de Débito</MenuItem>
                                <MenuItem value="05">Crédito Loja</MenuItem>
                                <MenuItem value="15">Boleto Bancário</MenuItem>
                                <MenuItem value="16">Depósito Bancário</MenuItem>
                                <MenuItem value="17">PIX</MenuItem>
                                <MenuItem value="99">Outros</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                );

            case 3:
                const totais = calcularTotais();
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Resumo da NF-e
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle1" gutterBottom>
                            <strong>Destinatário:</strong> {destinatario.nome}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            CPF/CNPJ: {destinatario.cpfCnpj}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle1" gutterBottom>
                            <strong>Itens:</strong> {itens.length}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2">Valor dos Produtos:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" align="right">
                                    {formatCurrency(totais.valorProdutos)}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="h6">
                                    <strong>Valor Total da Nota:</strong>
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="h6" align="right">
                                    <strong>{formatCurrency(totais.valorNota)}</strong>
                                </Typography>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3 }}>
                            <Button
                                variant="outlined"
                                startIcon={<VisibilityIcon />}
                                onClick={handlePreview}
                                disabled={loading}
                                fullWidth
                            >
                                Visualizar DANFE (Preview)
                            </Button>
                        </Box>
                    </Box>
                );

            default:
                return null;
        }
    };

    const isStepValid = () => {
        switch (activeStep) {
            case 0:
                return (
                    destinatario.cpfCnpj &&
                    destinatario.nome &&
                    destinatario.logradouro &&
                    destinatario.numero &&
                    destinatario.bairro &&
                    destinatario.nomeMunicipio &&
                    destinatario.uf &&
                    destinatario.cep
                );
            case 1:
                return itens.length > 0;
            case 2:
                return true;
            case 3:
                return true;
            default:
                return false;
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Emissão de NF-e
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3 }}>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {renderStepContent()}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button disabled={activeStep === 0} onClick={handleBack}>
                        Voltar
                    </Button>
                    <Box>
                        {activeStep === steps.length - 1 ? (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading || !isStepValid()}
                            >
                                {loading ? 'Emitindo...' : 'Emitir NF-e'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={!isStepValid()}
                            >
                                Próximo
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};
