import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    Paper,
} from '@mui/material';
import {
    Description as DescriptionIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    AttachMoney as MoneyIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { dashboardService } from '../../services/dashboard.service';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';

export const DashboardPage: React.FC = () => {
    const { user } = useAuth();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats', user?.companyId],
        queryFn: () => dashboardService.getStats(user!.companyId),
        enabled: !!user?.companyId,
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    const cards = [
        {
            title: 'Notas Hoje',
            value: stats?.notasHoje || 0,
            icon: <DescriptionIcon fontSize="large" />,
            color: '#1976d2',
        },
        {
            title: 'Notas Semana',
            value: stats?.notasSemana || 0,
            icon: <TrendingUpIcon fontSize="large" />,
            color: '#2e7d32',
        },
        {
            title: 'Notas Mês',
            value: stats?.notasMes || 0,
            icon: <DescriptionIcon fontSize="large" />,
            color: '#ed6c02',
        },
        {
            title: 'Valor Total',
            value: formatCurrency(stats?.valorTotal || 0),
            icon: <MoneyIcon fontSize="large" />,
            color: '#9c27b0',
        },
        {
            title: 'Pendentes',
            value: stats?.notasPendentes || 0,
            icon: <WarningIcon fontSize="large" />,
            color: '#ff9800',
        },
        {
            title: 'Rejeitadas',
            value: stats?.notasRejeitadas || 0,
            icon: <ErrorIcon fontSize="large" />,
            color: '#d32f2f',
        },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Visão geral das notas fiscais
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                {cards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)`,
                                borderLeft: `4px solid ${card.color}`,
                            }}
                        >
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                                            {card.title}
                                        </Typography>
                                        <Typography variant="h4" component="div">
                                            {card.value}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ color: card.color }}>{card.icon}</Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Paper sx={{ mt: 4, p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Bem-vindo ao APINfe
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Sistema completo para emissão de Notas Fiscais Eletrônicas. Utilize o menu lateral
                    para navegar entre as funcionalidades disponíveis.
                </Typography>
            </Paper>
        </Box>
    );
};
