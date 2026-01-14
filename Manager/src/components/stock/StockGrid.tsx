import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Button,
  Chip,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ProductSizeColorDTO, StockEntryRequestDTO, Product, Size, Color } from '../../types/stock';

interface StockGridProps {
  productId?: number;
  products: Product[];
  sizes: Size[];
  colors: Color[];
  onSave?: (data: StockEntryRequestDTO) => Promise<void>;
  onRefresh?: () => void;
  readOnly?: boolean;
  showActions?: boolean;
}

interface EditableRow extends ProductSizeColorDTO {
  isNew?: boolean;
  isEditing?: boolean;
  hasChanges?: boolean;
  originalData?: ProductSizeColorDTO;
}

const StockGrid: React.FC<StockGridProps> = ({
  productId,
  products,
  sizes,
  colors,
  onSave,
  onRefresh,
  readOnly = false,
  showActions = true
}) => {
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Carregar dados
  const loadData = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/stock/product-size-colors/by-product/${productId}`);
      if (response.ok) {
        const data: ProductSizeColorDTO[] = await response.json();
        setRows(data.map(item => ({
          ...item,
          isEditing: false,
          hasChanges: false,
          originalData: { ...item }
        })));
      }
    } catch (err) {
      setError('Erro ao carregar dados do estoque');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Adicionar nova linha
  const addNewRow = () => {
    const newRow: EditableRow = {
      id: undefined,
      productId: productId!,
      productName: products.find(p => p.id === productId)?.name || '',
      sizeId: undefined,
      sizeName: '',
      colorId: undefined,
      colorName: '',
      stock: 0,
      salePrice: 0,
      costPrice: 0,
      minimumStock: 0,
      active: true,
      isNew: true,
      isEditing: true,
      hasChanges: true
    };
    
    setRows(prev => [...prev, newRow]);
    setHasChanges(true);
  };

  // Iniciar edição
  const startEdit = (index: number) => {
    setRows(prev => prev.map((row, i) => 
      i === index ? { ...row, isEditing: true, originalData: { ...row } } : row
    ));
  };

  // Cancelar edição
  const cancelEdit = (index: number) => {
    setRows(prev => prev.map((row, i) => {
      if (i === index) {
        if (row.isNew) {
          return null; // Remove new rows
        }
        return { 
          ...row.originalData!, 
          isEditing: false, 
          hasChanges: false 
        };
      }
      return row;
    }).filter(Boolean) as EditableRow[]);
    
    updateHasChanges();
  };

  // Confirmar edição
  const confirmEdit = (index: number) => {
    setRows(prev => prev.map((row, i) => 
      i === index ? { ...row, isEditing: false } : row
    ));
  };

  // Atualizar campo
  const updateField = (index: number, field: keyof EditableRow, value: any) => {
    setRows(prev => prev.map((row, i) => {
      if (i === index) {
        const updated = { ...row, [field]: value, hasChanges: true };
        
        // Atualizar nomes baseados nos IDs
        if (field === 'sizeId') {
          const size = sizes.find(s => s.id === value);
          updated.sizeName = size?.name || '';
        }
        if (field === 'colorId') {
          const color = colors.find(c => c.id === value);
          updated.colorName = color?.name || '';
        }
        
        return updated;
      }
      return row;
    }));
    
    setHasChanges(true);
  };

  // Remover linha
  const removeRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  // Verificar se há mudanças
  const updateHasChanges = () => {
    const changes = rows.some(row => row.hasChanges || row.isNew);
    setHasChanges(changes);
  };

  // Salvar alterações
  const saveChanges = async () => {
    if (!onSave || !productId) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const items = rows
        .filter(row => row.hasChanges || row.isNew)
        .map(row => ({
          productSizeColorId: row.id,
          sizeId: row.sizeId!,
          colorId: row.colorId!,
          quantity: row.stock!,
          salePrice: row.salePrice!,
          costPrice: row.costPrice!,
          action: row.isNew ? 'CREATE' : 'UPDATE'
        }));

      const request: StockEntryRequestDTO = {
        productId,
        reason: 'Stock Grid Update',
        notes: 'Updated via stock management grid',
        items
      };

      await onSave(request);
      await loadData(); // Recarregar dados
      setHasChanges(false);
    } catch (err) {
      setError('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  // Refresh
  const handleRefresh = () => {
    loadData();
    if (onRefresh) onRefresh();
  };

  // Renderizar célula editável
  const renderEditableCell = (
    row: EditableRow, 
    index: number, 
    field: keyof EditableRow, 
    type: 'text' | 'number' | 'select' = 'text',
    options?: { value: any; label: string }[]
  ) => {
    const value = row[field];
    
    if (!row.isEditing) {
      return (
        <TableCell>
          {type === 'number' && typeof value === 'number' 
            ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
            : String(value || '')
          }
        </TableCell>
      );
    }

    if (type === 'select' && options) {
      return (
        <TableCell>
          <FormControl size="small" fullWidth>
            <Select
              value={value || ''}
              onChange={(e) => updateField(index, field, e.target.value)}
            >
              {options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
      );
    }

    return (
      <TableCell>
        <TextField
          size="small"
          type={type}
          value={value || ''}
          onChange={(e) => updateField(index, field, 
            type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
          )}
          fullWidth
        />
      </TableCell>
    );
  };

  // Renderizar status do estoque
  const renderStockStatus = (row: EditableRow) => {
    const status = row.stockStatus || 'NORMAL';
    const colors = {
      LOW: 'error',
      NORMAL: 'success',
      HIGH: 'warning'
    } as const;
    
    return (
      <Chip 
        label={status} 
        color={colors[status as keyof typeof colors]} 
        size="small" 
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Toolbar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Grade de Estoque
          {hasChanges && <Chip label="Alterações pendentes" color="warning" size="small" sx={{ ml: 1 }} />}
        </Typography>
        
        {showActions && !readOnly && (
          <Box>
            <Button
              startIcon={<AddIcon />}
              onClick={addNewRow}
              disabled={!productId}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Adicionar
            </Button>
            
            <Button
              startIcon={<SaveIcon />}
              onClick={saveChanges}
              disabled={!hasChanges || saving}
              variant="contained"
              sx={{ mr: 1 }}
            >
              {saving ? <CircularProgress size={20} /> : 'Salvar'}
            </Button>
            
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tamanho</TableCell>
              <TableCell>Cor</TableCell>
              <TableCell align="right">Estoque</TableCell>
              <TableCell align="right">Preço Venda</TableCell>
              <TableCell align="right">Preço Custo</TableCell>
              <TableCell align="right">Estoque Mín.</TableCell>
              <TableCell>Status</TableCell>
              {showActions && <TableCell align="center">Ações</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow 
                key={row.id || `new-${index}`}
                sx={{ 
                  backgroundColor: row.isNew ? '#f3f4f6' : 'inherit',
                  '&:hover': { backgroundColor: '#f9fafb' }
                }}
              >
                {/* Tamanho */}
                {renderEditableCell(
                  row, index, 'sizeId', 'select',
                  sizes.map(s => ({ value: s.id, label: s.name }))
                )}
                
                {/* Cor */}
                {renderEditableCell(
                  row, index, 'colorId', 'select',
                  colors.map(c => ({ value: c.id, label: c.name }))
                )}
                
                {/* Estoque */}
                {renderEditableCell(row, index, 'stock', 'number')}
                
                {/* Preço Venda */}
                {renderEditableCell(row, index, 'salePrice', 'number')}
                
                {/* Preço Custo */}
                {renderEditableCell(row, index, 'costPrice', 'number')}
                
                {/* Estoque Mínimo */}
                {renderEditableCell(row, index, 'minimumStock', 'number')}
                
                {/* Status */}
                <TableCell>
                  {renderStockStatus(row)}
                </TableCell>
                
                {/* Ações */}
                {showActions && (
                  <TableCell align="center">
                    <Box display="flex" gap={0.5}>
                      {row.isEditing ? (
                        <>
                          <Tooltip title="Confirmar">
                            <IconButton 
                              size="small" 
                              onClick={() => confirmEdit(index)}
                              color="primary"
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancelar">
                            <IconButton 
                              size="small" 
                              onClick={() => cancelEdit(index)}
                              color="secondary"
                            >
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Editar">
                            <IconButton 
                              size="small" 
                              onClick={() => startEdit(index)}
                              disabled={readOnly}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remover">
                            <IconButton 
                              size="small" 
                              onClick={() => removeRow(index)}
                              color="error"
                              disabled={readOnly}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
            
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={showActions ? 8 : 7} align="center">
                  <Typography color="textSecondary">
                    {productId ? 'Nenhum item de estoque encontrado' : 'Selecione um produto'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StockGrid;