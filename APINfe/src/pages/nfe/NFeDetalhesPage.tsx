import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Divider,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
} from '@mui/material';
import {
    GetApp as GetAppIcon,
    Cancel as CancelIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { nfeService } from '../../services/nfe.service';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDateTime, downloadBlob } from '../../utils/formatters';

export const NFeDetalhesPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cceDialogOpen, setCceDialogOpen] = useState(false);
    const [justificativa, setJustificativa] = useState('');
    const [correcao, setCorrecao] = useState('');

    const { data: nfe, isLoading } = useQuery({
        queryKey: ['nfe', id],
        queryFn: () => nfeService.getById(id!),
        enabled: !!id,
        // Poll every 3 seconds while processing
        refetchInterval: 3000, // Always poll, we'll check status below
    });

    // Check if processing and stop polling when done
    const isProcessing = nfe?.status === 'CREATED' || nfe?.status === 'SIGNED' || nfe?.status === 'SENT';

    const { data: statusInfo } = useQuery({
        queryKey: ['nfe-status', id],
        queryFn: () => nfeService.getStatus(id!),
        enabled: !!id && isProcessing,
        refetchInterval: isProcessing ? 3000 : false,
    });

    const cancelMutation = useMutation({
        mutationFn: () => nfeService.cancel(id!, justificativa),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nfe', id] });
            setCancelDialogOpen(false);
            setJustificativa('');
        },
    });

    const cceMutation = useMutation({
        mutationFn: () => nfeService.cartaCorrecao(id!, correcao),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nfe', id] });
            setCceDialogOpen(false);
            setCorrecao('');
        },
    });

    const handleDownloadDanfe = async () => {
        if (!nfe) return;
        try {
            const blob = await nfeService.getDanfe(id!);
            downloadBlob(blob, `DANFE-${nfe.numero}.pdf`);
        } catch (error) {
            console.error('Erro ao baixar DANFE:', error);
        }
    };

    const handleCancelar = () => {
        cancelMutation.mutate();
    };

    const handleCCe = () => {
        cceMutation.mutate();
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!nfe) {
        return (
            <Box>
                <Typography>NF-e não encontrada</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">
                    NF-e {nfe.numero}/{nfe.serie}
                </Typography>
                <Box>
                    {nfe.status === 'AUTHORIZED' && (
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<GetAppIcon />}
                                onClick={handleDownloadDanfe}
                                sx={{ mr: 1 }}
                            >
                                Download DANFE
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => setCceDialogOpen(true)}
                                sx={{ mr: 1 }}
                            >
                                Carta de Correção
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => setCancelDialogOpen(true)}
                            >
                                Cancelar
                            </Button>
                        </>
                    )}
                </Box>
            </Box>

            {/* Alert de processamento */}
            {(nfe.status === 'CREATED' || nfe.status === 'SIGNED' || nfe.status === 'SENT') && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    <strong>Processando NF-e...</strong>
                    <br />
                    A nota fiscal está sendo processada. A página será atualizada automaticamente quando o processamento for concluído.
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Informações Gerais
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Número
                                </Typography>
                                <Typography variant="body1">{nfe.numero}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Série
                                </Typography>
                                <Typography variant="body1">{nfe.serie}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Data de Emissão
                                </Typography>
                                <Typography variant="body1">
                                    {formatDateTime(nfe.dataEmissao)}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Status
                                </Typography>
                                <StatusBadge status={nfe.status} />
                            </Grid>
                            {nfe.chaveAcesso && (
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        Chave de Acesso
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                        {nfe.chaveAcesso}
                                    </Typography>
                                </Grid>
                            )}
                            {nfe.protocolo && (
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        Protocolo
                                    </Typography>
                                    <Typography variant="body1">{nfe.protocolo}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Destinatário
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                    Nome/Razão Social
                                </Typography>
                                <Typography variant="body1">{nfe.destinatario.nome}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    CPF/CNPJ
                                </Typography>
                                <Typography variant="body1">{nfe.destinatario.cpfCnpj}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    IE
                                </Typography>
                                <Typography variant="body1">{nfe.destinatario.ie || '-'}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                    Endereço
                                </Typography>
                                <Typography variant="body1">
                                    {nfe.destinatario.logradouro}, {nfe.destinatario.numero}
                                    {nfe.destinatario.complemento && ` - ${nfe.destinatario.complemento}`}
                                    <br />
                                    {nfe.destinatario.bairro} - {nfe.destinatario.nomeMunicipio}/{nfe.destinatario.uf}
                                    <br />
                                    CEP: {nfe.destinatario.cep}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Itens
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Item</TableCell>
                                        <TableCell>Descrição</TableCell>
                                        <TableCell>Qtd</TableCell>
                                        <TableCell>Valor Unit.</TableCell>
                                        <TableCell>Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {nfe.itens.map((item) => (
                                        <TableRow key={item.numeroItem}>
                                            <TableCell>{item.numeroItem}</TableCell>
                                            <TableCell>{item.descricao}</TableCell>
                                            <TableCell>{item.quantidadeComercial}</TableCell>
                                            <TableCell>
                                                {formatCurrency(item.valorUnitarioComercial)}
                                            </TableCell>
                                            <TableCell>{formatCurrency(item.valorTotal)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Totais
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={1}>
                            <Grid item xs={7}>
                                <Typography variant="body2">Valor dos Produtos:</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <Typography variant="body2" align="right">
                                    {formatCurrency(nfe.totais.valorProdutos)}
                                </Typography>
                            </Grid>
                            <Grid item xs={7}>
                                <Typography variant="body2">ICMS:</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <Typography variant="body2" align="right">
                                    {formatCurrency(nfe.totais.valorIcms)}
                                </Typography>
                            </Grid>
                            <Grid item xs={7}>
                                <Typography variant="body2">PIS:</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <Typography variant="body2" align="right">
                                    {formatCurrency(nfe.totais.valorPis)}
                                </Typography>
                            </Grid>
                            <Grid item xs={7}>
                                <Typography variant="body2">COFINS:</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <Typography variant="body2" align="right">
                                    {formatCurrency(nfe.totais.valorCofins)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                            </Grid>
                            <Grid item xs={7}>
                                <Typography variant="h6">Total:</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <Typography variant="h6" align="right">
                                    {formatCurrency(nfe.totais.valorNota)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {statusInfo?.timeline && statusInfo.timeline.length > 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Histórico
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box>
                                {statusInfo.timeline.map((event) => (
                                    <Box key={event.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                                        <Typography variant="body2" fontWeight="bold">
                                            {event.tipoEvento}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDateTime(event.dataEvento)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {event.descricao}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    )}
                </Grid>
            </Grid>

            {/* Dialog de Cancelamento */}
            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
                <DialogTitle>Cancelar NF-e</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Justificativa (mínimo 15 caracteres)"
                        value={justificativa}
                        onChange={(e) => setJustificativa(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)}>Cancelar</Button>
                    <Button
                        onClick={handleCancelar}
                        variant="contained"
                        color="error"
                        disabled={justificativa.length < 15}
                    >
                        Confirmar Cancelamento
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de Carta de Correção */}
            <Dialog open={cceDialogOpen} onClose={() => setCceDialogOpen(false)}>
                <DialogTitle>Carta de Correção Eletrônica</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Correção (mínimo 15 caracteres)"
                        value={correcao}
                        onChange={(e) => setCorrecao(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCceDialogOpen(false)}>Cancelar</Button>
                    <Button
                        onClick={handleCCe}
                        variant="contained"
                        disabled={correcao.length < 15}
                    >
                        Enviar Correção
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
