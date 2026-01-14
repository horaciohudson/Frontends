import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Alert,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import StockGrid from '../../components/stock/StockGrid';
import { ProductSizeColorDTO, StockEntryRequestDTO, StockStatistics, Product, Size, Color } from '../../types/stock';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const StockManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>();
  const [products, setProducts] = useState<Product[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [statistics, setStatistics] = useState<StockStatistics | null>(null);
  const [lowStockItems, setLowStockItems] = useState<ProductSizeColorDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  // Carregar estatísticas quando produto muda
  useEffect(() => {
    if (selectedProductId) {
      loadStatistics();
    }
  }, [selectedProductId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [productsRes, sizesRes, colorsRes, lowStockRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/sizes'),
        fetch('/api/colors'),
        fetch('/api/stock/product-size-colors/low-stock')
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        // Assumir que todos os produtos retornados estão ativos
        setProducts(productsData.map((p: any) => ({ ...p, active: true })));
      }
      if (sizesRes.ok) setSizes(await sizesRes.json());
      if (colorsRes.ok) setColors(await colorsRes.json());
      if (lowStockRes.ok) setLowStockItems(await lowStockRes.json());
    } catch (err) {
      setError('Erro ao carregar dados iniciais');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    if (!selectedProductId) return;
    
    try {
      const response = await fetch(`/api/stock/product-size-colors/statistics?productId=${selectedProductId}`);
      if (response.ok) {
        setStatistics(await response.json());
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const handleSaveStockEntry = async (data: StockEntryRequestDTO) => {
    try {
      const response = await fetch('/api/stock/product-size-colors/stock-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar entrada de estoque');
      }

      // Recarregar estatísticas
      await loadStatistics();
    } catch (err) {
      throw err;
    }
  };

  const handleRefresh = () => {
    loadInitialData();
    if (selectedProductId) {
      loadStatistics();
    }
  };

  // Renderizar cards de estatísticas
  const renderStatisticsCards = () => {
    if (!statistics) return null;

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total de Itens
                  </Typography>
                  <Typography variant="h5">
                    {statistics.totalItems}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Estoque Total
                  </Typography>
                  <Typography variant="h5">
                    {statistics.totalStock.toLocaleString('pt-BR')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssessmentIcon color="info" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Valor Total
                  </Typography>
                  <Typography variant="h5">
                    R$ {statistics.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Estoque Baixo
                  </Typography>
                  <Typography variant="h5">
                    {statistics.lowStockCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Renderizar alertas de estoque baixo
  const renderLowStockAlert = () => {
    if (lowStockItems.length === 0) return null;

    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {lowStockItems.length} itens com estoque baixo:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {lowStockItems.slice(0, 5).map((item, index) => (
            <Chip
              key={index}
              label={`${item.productName} - ${item.sizeName} - ${item.colorName}`}
              size="small"
              color="warning"
            />
          ))}
          {lowStockItems.length > 5 && (
            <Chip
              label={`+${lowStockItems.length - 5} mais`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </Alert>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Estoque
      </Typography>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {renderLowStockAlert()}

      {/* Seletor de Produto */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Produto</InputLabel>
              <Select
                value={selectedProductId || ''}
                onChange={(e) => setSelectedProductId(e.target.value as number)}
                label="Produto"
              >
                <MenuItem value="">
                  <em>Selecione um produto</em>
                </MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.code} - {product.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1}>
              <Button variant="outlined" onClick={handleRefresh}>
                Atualizar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Estatísticas */}
      {selectedProductId && renderStatisticsCards()}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Grade de Edição" />
          <Tab label="Consulta de Estoque" />
          <Tab label="Movimentações" />
          <Tab label="Relatórios" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <StockGrid
          productId={selectedProductId}
          products={products}
          sizes={sizes}
          colors={colors}
          onSave={handleSaveStockEntry}
          onRefresh={handleRefresh}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Consulta de Estoque
        </Typography>
        <Typography color="textSecondary">
          Funcionalidade de consulta em desenvolvimento...
        </Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Movimentações de Estoque
        </Typography>
        <Typography color="textSecondary">
          Histórico de movimentações em desenvolvimento...
        </Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Relatórios
        </Typography>
        <Typography color="textSecondary">
          Relatórios de estoque em desenvolvimento...
        </Typography>
      </TabPanel>
    </Box>
  );
};

export default StockManagement;