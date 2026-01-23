import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    TextField,
    Grid,
    MenuItem,
    CircularProgress,
    Button,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    GetApp as GetAppIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { nfeService } from '../../services/nfe.service';
import { useAuth } from '../../contexts/AuthContext';
import { NFeStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate, downloadBlob } from '../../utils/formatters';

export const NFeListagemPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [status, setStatus] = useState<NFeStatus | ''>('');

    const { data: nfes, isLoading } = useQuery({
        queryKey: ['nfes', user?.companyId, dataInicio, dataFim, status],
        queryFn: () =>
            nfeService.getAll({
                dataInicio: dataInicio || undefined,
                dataFim: dataFim || undefined,
                status: status || undefined,
            }),
        enabled: !!user?.companyId,
    });

    const handleDownloadDanfe = async (id: string, numero: number) => {
        try {
            const blob = await nfeService.getDanfe(id);
            downloadBlob(blob, `DANFE-${numero}.pdf`);
        } catch (error) {
            console.error('Erro ao baixar DANFE:', error);
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
            <Typography variant="h4" gutterBottom>
                Notas Fiscais
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Data Início"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Data Fim"
                            value={dataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            select
                            label="Status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as NFeStatus | '')}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="CREATED">Criada</MenuItem>
                            <MenuItem value="SIGNED">Assinada</MenuItem>
                            <MenuItem value="SENT">Enviada</MenuItem>
                            <MenuItem value="AUTHORIZED">Autorizada</MenuItem>
                            <MenuItem value="REJECTED">Rejeitada</MenuItem>
                            <MenuItem value="CANCELLED">Cancelada</MenuItem>
                            <MenuItem value="ERROR">Erro</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => {
                                setDataInicio('');
                                setDataFim('');
                                setStatus('');
                            }}
                            sx={{ height: '56px' }}
                        >
                            Limpar Filtros
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Número</TableCell>
                            <TableCell>Série</TableCell>
                            <TableCell>Data Emissão</TableCell>
                            <TableCell>Destinatário</TableCell>
                            <TableCell>Valor</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {nfes?.map((nfe) => (
                            <TableRow key={nfe.id}>
                                <TableCell>{nfe.numero}</TableCell>
                                <TableCell>{nfe.serie}</TableCell>
                                <TableCell>{formatDate(nfe.dataEmissao)}</TableCell>
                                <TableCell>{nfe.destinatario.nome}</TableCell>
                                <TableCell>{formatCurrency(nfe.totais.valorNota)}</TableCell>
                                <TableCell>
                                    <StatusBadge status={nfe.status} />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        onClick={() => navigate(`/nfe/detalhes/${nfe.id}`)}
                                        title="Ver detalhes"
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                    {nfe.status === 'AUTHORIZED' && (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDownloadDanfe(nfe.id, nfe.numero)}
                                            title="Download DANFE"
                                        >
                                            <GetAppIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {nfes?.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                        Nenhuma nota fiscal encontrada
                    </Typography>
                </Box>
            )}
        </Box>
    );
};
