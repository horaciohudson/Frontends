import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { ProductSize } from "../../models/ProductSize";
import { ProductSizeColor } from "../../models/ProductSizeColor";
import { Color } from "../../models/Color";
import { Size } from "../../models/Size";
import { ProductSizeColorService } from "../../service/ProductSizeColor";
import { ColorService } from "../../service/Color";
import { SizeService } from "../../service/Size";
import { ProductCostService, ProductCost } from "../../service/ProductCost";
import styles from "../../styles/productAccessories/FormProductSizeColors.module.css";

interface Props {
  productId: number;
  size: ProductSize;
}

const initialSizeColor: Partial<ProductSizeColor> = {
  id: null,
  productId: 0,
  sizeId: 0,
  colorId: 0,
  stock: 0,
  salePrice: 0,
  costPrice: 0,
  minimumStock: 0,
  active: true,
};

export default function FormProductSizeColors({ productId, size }: Props) {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);

  console.log("🎨 FormProductSizeColors renderizado:", { productId, size });

  const [sizeColors, setSizeColors] = useState<ProductSizeColor[]>([]);
  const [availableColors, setAvailableColors] = useState<Color[]>([]);
  const [availableSizes, setAvailableSizes] = useState<Size[]>([]);
  const [actualSizeId, setActualSizeId] = useState<number | null>(null);
  const [productCost, setProductCost] = useState<ProductCost | null>(null);
  const [form, setForm] = useState<Partial<ProductSizeColor>>(initialSizeColor);

  const [editingMode, setEditingMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const colorRef = useRef<HTMLSelectElement>(null);

  // ---- loads ----
  const loadProductCost = async () => {
    if (!productId) {
      console.log("⚠️ ProductId não disponível para carregar custos");
      return;
    }

    try {
      console.log("💰 Carregando custos do produto:", productId);
      const cost = await ProductCostService.getByProductId(productId);
      console.log("✅ Custos do produto carregados:", cost);
      setProductCost(cost);
    } catch (error: any) {
      console.error("❌ Erro ao carregar custos do produto:", error);
      // Não é erro crítico, produto pode não ter custos cadastrados
      setProductCost(null);
    }
  };

  const loadAvailableSizes = async () => {
    try {
      console.log("📏 Carregando tamanhos de referência...");
      const sizes = await SizeService.getAll();
      console.log("✅ Tamanhos de referência carregados:", sizes);
      setAvailableSizes(sizes.filter(s => s.active !== false));
      
      // Encontrar o size_id correto baseado no size.size (string)
      const matchingSize = sizes.find(s => s.sizeName === size.size || s.name === size.size);
      if (matchingSize) {
        console.log("🎯 Tamanho correspondente encontrado:", matchingSize);
        setActualSizeId(matchingSize.id);
      } else {
        console.error("❌ Tamanho não encontrado na tabela de referência:", size.size);
        console.log("🔍 Tamanhos disponíveis:", sizes.map(s => ({ id: s.id, sizeName: s.sizeName, name: s.name })));
        setError(`Tamanho "${size.size}" não encontrado na tabela de referência. Cadastre este tamanho primeiro.`);
      }
    } catch (error: any) {
      console.error("❌ Erro ao carregar tamanhos de referência:", error);
      setError(`Erro ao carregar tamanhos: ${error.message}`);
      setAvailableSizes([]);
    }
  };

  const loadAvailableColors = async () => {
    if (!actualSizeId) {
      console.log("⚠️ actualSizeId não disponível ainda");
      return;
    }

    try {
      console.log("🎨 Carregando cores disponíveis para size_id:", actualSizeId);
      console.log("🎨 Iniciando carregamento de cores...");
      
      // Buscar cores globais e específicas do tamanho
      console.log("🌍 Buscando cores globais...");
      const globalColors = await ColorService.getGlobalColors();
      console.log("✅ Cores globais carregadas:", globalColors);
      console.log("🔍 Primeira cor (estrutura):", globalColors[0]);
      
      console.log("🎯 Buscando cores específicas do tamanho...");
      const sizeSpecificColors = await ColorService.getColorsBySize(actualSizeId);
      console.log("✅ Cores específicas carregadas:", sizeSpecificColors);
      
      // Combinar cores (específicas do tamanho têm prioridade)
      const allColors = [...sizeSpecificColors, ...globalColors.filter(gc => 
        !sizeSpecificColors.some(sc => sc.id === gc.id)
      )];
      
      console.log("🎨 Total de cores combinadas:", allColors.length);
      console.log("✅ Cores disponíveis:", allColors);
      
      const activeColors = allColors.filter(c => c.active !== false);
      console.log("🟢 Cores ativas:", activeColors.length, activeColors);
      
      setAvailableColors(activeColors);
      
      // Limpar erro se carregou com sucesso
      if (activeColors.length > 0) {
        setError(null);
      }
    } catch (error: any) {
      console.error("❌ Erro ao carregar cores:", error);
      console.error("❌ Stack trace:", error.stack);
      
      // Mostrar erro específico para o usuário
      const errorMessage = error.response?.status === 403 
        ? "Acesso negado. Faça login no sistema para carregar as cores."
        : error.response?.data?.message || error.message || "Erro ao carregar cores do servidor";
      
      setError(`Erro ao carregar cores: ${errorMessage}`);
      setAvailableColors([]);
    }
  };

  const loadSizeColors = async () => {
    if (!productId || !actualSizeId) {
      console.log("⚠️ ProductId ou actualSizeId não disponível");
      return;
    }

    try {
      console.log("🎨 Carregando cores do tamanho:", { productId, actualSizeId });
      const colors = await ProductSizeColorService.getByProductAndSize(productId, actualSizeId);
      console.log("✅ Cores do tamanho carregadas:", colors);
      setSizeColors(colors);
      
      // Limpar formulário se estava em modo de edição para evitar conflitos
      if (editingMode && !form.id) {
        console.log("🔄 Limpando formulário para evitar conflitos");
        resetForm();
      }
    } catch (error: any) {
      console.error("❌ Erro ao carregar cores do tamanho:", error);
      
      // Se for erro 500, pode ser problema de query SQL, mas não é crítico para a funcionalidade
      if (error.response?.status === 500) {
        console.log("⚠️ Erro 500 ao carregar cores existentes, continuando sem elas");
        setSizeColors([]);
      } else {
        setSizeColors([]);
      }
    }
  };

  // initial loads
  useEffect(() => {
    loadAvailableSizes();
    loadProductCost();
  }, [size.size, productId]);

  useEffect(() => {
    if (actualSizeId) {
      loadAvailableColors();
    }
  }, [actualSizeId]);

  useEffect(() => {
    if (productId && actualSizeId) {
      loadSizeColors();
    }
  }, [productId, actualSizeId]);

  // ---- handlers ----
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  const validate = (): string | null => {
    if (!form.colorId) return "Selecione uma cor";
    if (!form.stock || form.stock < 0) return "Estoque deve ser maior ou igual a zero";
    if (!form.salePrice || form.salePrice <= 0) return "Preço de venda deve ser maior que zero";
    
    // Verificar se a cor já existe para este produto/tamanho (apenas para novos registros)
    if (!form.id) {
      const existingColor = sizeColors.find(sc => 
        sc.colorId === form.colorId
      );
      if (existingColor) {
        return `Esta cor já foi cadastrada para este tamanho. Use o botão "Editar" para modificar o registro existente.`;
      }
    }
    
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const msg = validate();
    if (msg) { 
      setError(msg); 
      return; 
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      if (!actualSizeId) {
        setError("ID do tamanho não encontrado. Verifique se o tamanho está cadastrado na tabela de referência.");
        return;
      }

      const payload = {
        ...form,
        productId,
        sizeId: actualSizeId!, // Usar o size_id correto da tabela tab_sizes
        stock: Number(form.stock) || 0,
        salePrice: Number(form.salePrice) || 0,
        costPrice: Number(form.costPrice) || 0,
        minimumStock: Number(form.minimumStock) || 0,
      };
      
      console.log("💾 Salvando cor do produto:", payload);
      
      const saved = await ProductSizeColorService.save(payload);
      console.log("✅ Cor salva:", saved);

      // Atualizar lista
      setSizeColors((prev) => 
        form.id ? prev.map((sc) => (sc.id === form.id ? saved : sc)) : [...prev, saved]
      );

      // Validar consistência de estoque
      const newColors = form.id 
        ? sizeColors.map(sc => sc.id === form.id ? saved : sc)
        : [...sizeColors, saved];
      
      const validation = await ProductSizeColorService.validateStockConsistency(
        productId, actualSizeId!, newColors
      );
      
      if (!validation.valid) {
        setError(`⚠️ Atenção: ${validation.message}`);
      }

      resetForm();
      setSuccessMessage("Cor salva com sucesso!");
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      console.error("❌ Erro ao salvar cor:", err);
      
      let errorMessage = "Erro desconhecido";
      
      if (err.response?.status === 400) {
        const backendMessage = err.response?.data?.message || err.response?.data || "";
        
        if (backendMessage.includes("Combination already exists")) {
          errorMessage = "Esta combinação de produto, tamanho e cor já existe. Use o botão 'Editar' na tabela para modificar o registro existente.";
        } else if (backendMessage.includes("Size not found")) {
          errorMessage = "Tamanho não encontrado. Verifique se o tamanho está cadastrado corretamente.";
        } else if (backendMessage.includes("Color not found")) {
          errorMessage = "Cor não encontrada. Verifique se a cor está cadastrada corretamente.";
        } else if (backendMessage.includes("Product not found")) {
          errorMessage = "Produto não encontrado. Verifique se o produto está cadastrado corretamente.";
        } else {
          errorMessage = `Erro de validação: ${backendMessage}`;
        }
      } else {
        errorMessage = err.response?.data?.message || err.message || "Erro desconhecido";
      }
      
      setError(`❌ ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    if (!actualSizeId) {
      setError("ID do tamanho não encontrado. Verifique se o tamanho está cadastrado na tabela de referência.");
      return;
    }

    // Pré-preencher preços com base nos custos do produto
    const defaultSalePrice = productCost?.grossValue || productCost?.netValue || 0;
    const defaultCostPrice = productCost?.averageCost || productCost?.acquisitionValue || 0;

    console.log("💰 Pré-preenchendo preços:", {
      productCost,
      defaultSalePrice,
      defaultCostPrice
    });

    setForm({
      ...initialSizeColor,
      productId,
      sizeId: actualSizeId,
      salePrice: defaultSalePrice,
      costPrice: defaultCostPrice,
    });
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    setTimeout(() => colorRef.current?.focus(), 0);
  };

  const handleEdit = (sizeColor: ProductSizeColor) => {
    setForm(sizeColor);
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    setTimeout(() => colorRef.current?.focus(), 0);
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    if (!window.confirm("Confirma a exclusão desta cor?")) return;
    
    try {
      console.log("🗑️ Deletando cor:", id);
      await ProductSizeColorService.delete(id);
      console.log("✅ Cor deletada");
      
      setSizeColors((prev) => prev.filter((sc) => sc.id !== id));
      if (form.id === id) {
        resetForm();
      }
    } catch (err: any) {
      console.error("❌ Erro ao deletar cor:", err);
      setError("Erro ao deletar cor");
    }
  };

  const resetForm = () => {
    setForm({
      ...initialSizeColor,
      productId,
      sizeId: actualSizeId || undefined,
    });
    setEditingMode(false);
    setError(null);
    setSuccessMessage(null);
  };

  // Calcular totais
  const totalColorStock = sizeColors.reduce((sum, sc) => sum + (sc.stock || 0), 0);
  const sizeStock = size.stock || 0;
  const remainingStock = sizeStock - totalColorStock;

  // Validação inicial
  if (!productId || !size.id) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>Produto ou tamanho não selecionado</p>
      </div>
    );
  }

  if (!actualSizeId && availableSizes.length > 0) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>
          Tamanho "{size.size}" não encontrado na tabela de referência. 
          <br />
          Cadastre este tamanho primeiro em Referenciais → Tamanhos.
        </p>
      </div>
    );
  }

  // ---------- RENDER ----------
  return (
    <div className={styles.container}>
      {/* Header com informações do tamanho */}
      <div className={styles.sizeInfo}>
        <h3>📏 Tamanho: {size.size}</h3>
        <div className={styles.stockInfo}>
          <span className={styles.totalStock}>
            Estoque Total: <strong>{sizeStock}</strong> peças
          </span>
          <span className={styles.colorStock}>
            Estoque em Cores: <strong>{totalColorStock}</strong> peças
          </span>
          <span className={`${styles.remainingStock} ${remainingStock < 0 ? styles.negative : ''}`}>
            Restante: <strong>{remainingStock}</strong> peças
          </span>
        </div>
        
        {/* Informações de preços do produto */}
        {productCost && (
          <div className={styles.priceInfo}>
            <h4>💰 Preços Base do Produto:</h4>
            <div className={styles.priceDetails}>
              {productCost.grossValue && (
                <span className={styles.priceItem}>
                  Preço Bruto: <strong>R$ {productCost.grossValue.toFixed(2)}</strong>
                </span>
              )}
              {productCost.netValue && (
                <span className={styles.priceItem}>
                  Preço Líquido: <strong>R$ {productCost.netValue.toFixed(2)}</strong>
                </span>
              )}
              {productCost.averageCost && (
                <span className={styles.priceItem}>
                  Custo Médio: <strong>R$ {productCost.averageCost.toFixed(2)}</strong>
                </span>
              )}
            </div>
            <p className={styles.priceNote}>
              ℹ️ Estes preços serão usados como base. Você pode modificar para preços específicos por tamanho/cor.
            </p>
          </div>
        )}
        
        {/* Informações sobre cores já cadastradas */}
        {sizeColors.length > 0 && (
          <div className={styles.existingColorsInfo}>
            <h4>🎨 Cores já cadastradas para este tamanho:</h4>
            <div className={styles.existingColorsList}>
              {sizeColors.map((sc) => {
                const stock = Number(sc.stock) || 0;
                const minStock = Number(sc.minimumStock) || 0;
                const isLowStock = minStock > 0 && stock < minStock;
                
                return (
                  <span key={sc.id} className={`${styles.existingColorItem} ${isLowStock ? styles.existingColorLowStock : ''}`}>
                    {sc.colorName || `Cor ${sc.colorId}`} (Estoque: {sc.stock})
                    {isLowStock && <span className={styles.lowStockAlert}> 🚨</span>}
                  </span>
                );
              })}
            </div>
            <p className={styles.existingColorsNote}>
              💡 Para modificar uma cor existente, use o botão "Editar" na tabela abaixo.
            </p>
          </div>
        )}
        
        {/* Alerta de estoque baixo */}
        {sizeColors.some(sc => {
          const stock = Number(sc.stock) || 0;
          const minStock = Number(sc.minimumStock) || 0;
          return minStock > 0 && stock < minStock;
        }) && (
          <div className={styles.lowStockAlert}>
            <h4>🚨 Alerta de Estoque Baixo!</h4>
            <p>As seguintes cores estão com estoque abaixo do mínimo:</p>
            <div className={styles.lowStockList}>
              {sizeColors
                .filter(sc => {
                  const stock = Number(sc.stock) || 0;
                  const minStock = Number(sc.minimumStock) || 0;
                  return minStock > 0 && stock < minStock;
                })
                .map(sc => (
                  <span key={sc.id} className={styles.lowStockItem}>
                    <strong>{sc.colorName || `Cor ${sc.colorId}`}</strong>: 
                    {sc.stock} / {sc.minimumStock} (mín)
                  </span>
                ))
              }
            </div>
            <p className={styles.lowStockNote}>
              📋 <strong>Ação necessária:</strong> Considere fazer pedido de compra para estes itens.
            </p>
          </div>
        )}
      </div>

      {/* Formulário */}
      <form onSubmit={handleSave} className={styles.form}>
        {/* Primeira linha do formulário */}
        <div className={styles.formRow}>
          <div className={styles.formCol}>
            <label className={styles.label}>Cor:</label>
            <select
              ref={colorRef}
              name="colorId"
              value={form.colorId || ''}
              onChange={handleChange}
              className={styles.input}
              disabled={!editingMode}
              required
            >
              <option value="">Selecione uma cor...</option>
              {availableColors.map((color) => {
                const isAlreadyUsed = sizeColors.some(sc => sc.colorId === color.id);
                return (
                  <option key={color.id} value={color.id || ''}>
                    {color.name} {color.sizeId ? '(específica)' : '(global)'} {isAlreadyUsed ? '✓ JÁ CADASTRADA' : ''}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div className={styles.formCol}>
            <label className={styles.label}>Estoque Atual:</label>
            <input
              type="number"
              name="stock"
              value={form.stock || ''}
              onChange={handleChange}
              className={styles.input}
              disabled={!editingMode}
              min="0"
              step="1"
              required
            />
          </div>
          
          <div className={styles.formCol}>
            <label className={styles.label}>🚨 Estoque Mínimo:</label>
            <input
              type="number"
              name="minimumStock"
              value={form.minimumStock || ''}
              onChange={handleChange}
              className={styles.input}
              disabled={!editingMode}
              min="0"
              step="1"
              placeholder="Ex: 5"
              title="Estoque mínimo para alertas de compra"
            />
          </div>
        </div>

        {/* Segunda linha do formulário */}
        <div className={styles.formRow}>
          <div className={styles.formCol}>
            <label className={styles.label}>Preço Venda:</label>
            <input
              type="number"
              name="salePrice"
              value={form.salePrice || ''}
              onChange={handleChange}
              className={styles.input}
              disabled={!editingMode}
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className={styles.formCol}>
            <label className={styles.label}>Preço Custo:</label>
            <input
              type="number"
              name="costPrice"
              value={form.costPrice || ''}
              onChange={handleChange}
              className={styles.input}
              disabled={!editingMode}
              min="0"
              step="0.01"
            />
          </div>
          
          <div className={styles.formCol}>
            <label className={styles.label}>Status do Estoque:</label>
            <div className={styles.stockStatusDisplay}>
              {form.stock && form.minimumStock ? (
                <span className={`${styles.stockStatus} ${
                  Number(form.stock) < Number(form.minimumStock) ? styles.stockLow :
                  Number(form.stock) > Number(form.minimumStock) * 2 ? styles.stockHigh :
                  styles.stockNormal
                }`}>
                  {Number(form.stock) < Number(form.minimumStock) ? '🔴 BAIXO' :
                   Number(form.stock) > Number(form.minimumStock) * 2 ? '🟢 ALTO' :
                   '🟡 NORMAL'}
                </span>
              ) : (
                <span className={styles.stockStatusEmpty}>-</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          {editingMode ? (
            <>
              <button type="submit" className={styles.saveButton} disabled={saving}>
                {form.id ? "Atualizar" : "Salvar"}
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={resetForm}
                disabled={saving}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.newButton}
              onClick={handleNew}
            >
              Nova Cor
            </button>
          )}
        </div>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      {/* Tabela de cores */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Cor</th>
            <th>Estoque</th>
            <th>Preço Venda</th>
            <th>Preço Custo</th>
            <th>Estoque Mín.</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {sizeColors.map((sizeColor) => {
            const stock = Number(sizeColor.stock) || 0;
            const minStock = Number(sizeColor.minimumStock) || 0;
            const isLowStock = minStock > 0 && stock < minStock;
            
            return (
              <tr key={sizeColor.id ?? `temp-${sizeColor.colorId}`} 
                  className={isLowStock ? styles.lowStockRow : ''}>
                <td>{sizeColor.colorName || `Cor ${sizeColor.colorId}`}</td>
                <td>
                  <span className={isLowStock ? styles.lowStockValue : ''}>
                    {sizeColor.stock}
                    {isLowStock && <span className={styles.lowStockAlert}> 🚨</span>}
                  </span>
                </td>
                <td>R$ {sizeColor.salePrice?.toFixed(2) || '0,00'}</td>
                <td>R$ {sizeColor.costPrice?.toFixed(2) || '0,00'}</td>
                <td>
                  <span className={styles.minimumStockValue}>
                    {sizeColor.minimumStock || 0}
                    {minStock > 0 && (
                      <span className={styles.minimumStockNote}> (mín)</span>
                    )}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleEdit(sizeColor)}
                    className={styles.editButton}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(sizeColor.id)}
                    className={styles.deleteButton}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            );
          })}
          {sizeColors.length === 0 && (
            <tr>
              <td colSpan={6} className={styles.noRecords}>
                Nenhuma cor cadastrada para este tamanho
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}