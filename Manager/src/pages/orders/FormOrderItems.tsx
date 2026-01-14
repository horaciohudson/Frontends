// src/components/orders/FormOrderItems.tsx
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { OrderItemDTO } from "../../models/Order";
import { Product } from "../../models/Product";
import { ProductSize } from "../../models/ProductSize";
import { UnitType } from "../../enums";
import { UUID } from "../../types/common";
import { upsertOrderItem, listOrderItems, deleteOrderItem, getOrder, updateOrder } from "../../service/Order";
import { getProduct } from "../../service/product";
import { listProductSizes } from "../../service/productSize";
import ProductSearchDialog from "../../components/ProductSearchDialog";
import SizeColorGridDialog, { GridItem } from "../../components/SizeColorGridDialog";

import styles from "../../styles/orders/FormOrderItems.module.css";

type Props = {
  orderId: UUID;
  customerName?: string;
  onItemSelected?: (itemId: UUID | null) => void;
};

export default function FormOrderItems({ orderId, customerName, onItemSelected }: Props) {
  const { t } = useTranslation([TRANSLATION_NAMESPACES.COMMERCIAL, TRANSLATION_NAMESPACES.ENUMS]);
  const [data, setData] = useState<OrderItemDTO>({ orderId, itemSeq: 1 });
  const [items, setItems] = useState<OrderItemDTO[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const [selectedServiceName, setSelectedServiceName] = useState<string>("");
  const [itemType, setItemType] = useState<'product' | 'service'>('product');
  const [availableSizes, setAvailableSizes] = useState<ProductSize[]>([]);

  // Grid de Tamanho x Cor
  const [isSizeColorGridOpen, setIsSizeColorGridOpen] = useState(false);
  const [selectedProductForGrid, setSelectedProductForGrid] = useState<{ id: string; name: string } | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<UUID | null>(null); // Para seleção de linha na tabela

  const set = <K extends keyof OrderItemDTO>(k: K, v: OrderItemDTO[K]) =>
    setData(p => ({ ...p, [k]: v }));

  // Calcular valor total automaticamente quando quantity ou unitPrice mudarem
  useEffect(() => {
    if (data.quantity && data.unitPrice) {
      const totalValue = Number(data.quantity) * Number(data.unitPrice);
      console.log('💰 Calculating total value:', data.quantity, 'x', data.unitPrice, '=', totalValue);
      setData(p => ({ ...p, totalValue: totalValue }));
    } else {
      setData(p => ({ ...p, totalValue: undefined }));
    }
  }, [data.quantity, data.unitPrice]);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Loading items for order:', orderId);
      const itemsList = await listOrderItems(orderId);
      console.log('📦 Loaded items:', itemsList);
      setItems(Array.isArray(itemsList) ? itemsList : []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(t("orderItems.loadError"));
      console.error('❌ Error loading items:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, t]);

  useEffect(() => {
    if (orderId) {
      loadItems();
    }
  }, [orderId, loadItems]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('🔍 onSubmit called - data:', data);
    console.log('🔍 onSubmit called - editingMode:', editingMode);

    // Validação básica
    if (itemType === 'product' && !data.productId) {
      setError('Selecione um produto');
      return;
    }
    if (itemType === 'service' && !data.serviceId) {
      setError('Selecione um serviço');
      return;
    }
    if (!data.quantity || data.quantity <= 0) {
      setError('Quantidade deve ser maior que zero');
      return;
    }
    if (!data.unitPrice || data.unitPrice <= 0) {
      setError('Preço unitário deve ser maior que zero');
      return;
    }

    try {
      setIsLoading(true);

      // Garantir que o totalItemValue está calculado antes de enviar
      const finalData = { ...data };
      if (finalData.quantity && finalData.unitPrice) {
        finalData.totalValue = Number(finalData.quantity) * Number(finalData.unitPrice);
        console.log('💰 Recalculating total before save:', finalData.quantity, 'x', finalData.unitPrice, '=', finalData.totalValue);
      }

      // Definir isProduct baseado no tipo de item selecionado
      finalData.isProduct = itemType === 'product';

      console.log('💾 Saving item with final data:', finalData);
      console.log('💰 Total value being sent:', finalData.totalValue);
      console.log('📦 isProduct:', finalData.isProduct);
      await upsertOrderItem(orderId, finalData);
      setSuccessMessage(t("orderItems.saveSuccess"));
      setTimeout(() => setSuccessMessage(null), 3000);
      setEditingMode(false);
      await loadItems();

      // Atualizar totais do pedido principal
      await updateOrderTotals();

      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(t("orderItems.saveError"));
      console.error('❌ Error saving item:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEdit = (item: OrderItemDTO) => {
    console.log('✏️ Editing item:', item);
    setData(item);
    setEditingMode(true);

    // Notificar o pai sobre o item selecionado
    if (onItemSelected && item.id) {
      onItemSelected(item.id);
    }

    // Determinar tipo do item e configurar estado
    if (item.productId) {
      setItemType('product');
      loadProductName(item.productId);
    } else if (item.serviceId) {
      setItemType('service');
      setSelectedServiceName(`ID: ${item.serviceId}`); // Placeholder até implementar busca de serviços
    }

    setTimeout(() => document.querySelector('input')?.focus(), 0);
  };

  const handleDelete = async (item: OrderItemDTO) => {
    if (!item.id || !confirm(t("orderItems.confirmDelete"))) return;
    try {
      setIsLoading(true);
      console.log('🗑️ Deleting item:', item.id);
      await deleteOrderItem(orderId, item.id);
      setSuccessMessage(t("orderItems.deleteSuccess"));
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadItems();

      // Atualizar totais do pedido principal
      await updateOrderTotals();

      if (data.id === item.id) {
        resetForm();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(t("orderItems.deleteError"));
      console.error('❌ Error deleting item:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNew = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault(); // Prevent any form submission
    console.log('🆕 Creating new item');
    const nextSeq = Math.max(...items.map(i => i.itemSeq || 0), 0) + 1;
    setData({ orderId, itemSeq: nextSeq, totalValue: undefined });
    setSelectedProductName("");
    setSelectedServiceName("");
    setItemType('product');
    setAvailableSizes([]);
    setEditingMode(true);
    setTimeout(() => document.querySelector('input')?.focus(), 0);
  };

  const resetForm = () => {
    const nextSeq = Math.max(...items.map(i => i.itemSeq || 0), 0) + 1;
    setData({ orderId, itemSeq: nextSeq, totalValue: undefined });
    setSelectedProductName("");
    setSelectedServiceName("");
    setItemType('product');
    setAvailableSizes([]);
    setEditingMode(false);
    setError(null);
    // Não limpar seleção da linha ao resetar formulário
    // para permitir acesso às sub-tabs
  };

  const handleProductSelect = async (product: Product) => {
    console.log('🔍 handleProductSelect - product:', product);
    console.log('🔍 handleProductSelect - subCategoryId:', (product as any).subCategoryId);

    set("productId", String(product.id));
    set("serviceId", undefined); // Limpar serviceId se estava selecionado
    setSelectedProductName(product.name);
    if (!data.description) {
      set("description", product.name);
    }
    // Auto-fill unit price from product cost if available
    if ((product as any).productCost?.netValue) {
      set("unitPrice", Number((product as any).productCost.netValue));
    }

    // Load available sizes for this product's subcategory
    // Backend returns subCategoryId directly, not as productSubCategory.id
    const subCategoryId = (product as any).subCategoryId || product.productSubCategory?.id;

    if (subCategoryId) {
      console.log('🔍 Loading sizes for subcategory:', subCategoryId);
      try {
        const sizes = await listProductSizes(subCategoryId);
        console.log('🔍 Loaded sizes:', sizes);
        setAvailableSizes(sizes);
        // Clear current size selection when product changes
        set("size", undefined);
      } catch (err) {
        console.error("Error loading product sizes:", err);
        setAvailableSizes([]);
      }
    } else {
      console.log('⚠️ Product has no subcategory, cannot load sizes');
      setAvailableSizes([]);
    }

    // Verificar se o produto tem variações (tamanho/cor) e abrir grade
    setSelectedProductForGrid({
      id: String(product.id),
      name: product.name
    });
    setIsSizeColorGridOpen(true);
  };

  const loadProductName = useCallback(async (productId: string) => {
    try {
      const product = await getProduct(productId);
      setSelectedProductName(product.name);
    } catch (err) {
      console.error("Error loading product name:", err);
    }
  }, []);

  // Função para calcular e atualizar o total do pedido
  const updateOrderTotals = useCallback(async () => {
    try {
      console.log('🧮 Calculating order totals...');

      // Buscar todos os itens do pedido
      const allItems = await listOrderItems(orderId);
      console.log('📦 All items for calculation:', allItems);

      // Calcular totais
      let totalProducts = 0;
      let totalServices = 0;

      allItems.forEach(item => {
        const itemTotal = item.totalValue || 0;
        if (item.productId) {
          totalProducts += itemTotal;
        } else if (item.serviceId) {
          totalServices += itemTotal;
        }
      });

      const totalOrder = totalProducts + totalServices;

      console.log('💰 Calculated totals:');
      console.log('  - Total Products:', totalProducts);
      console.log('  - Total Services:', totalServices);
      console.log('  - Total Order:', totalOrder);

      // Buscar o pedido atual
      const currentOrder = await getOrder(orderId);

      // Atualizar o pedido com os novos totais
      const updatedOrder = {
        ...currentOrder,
        totalProducts,
        totalServices,
        totalOrder
      };

      console.log('📝 Updating order with new totals:', updatedOrder);
      await updateOrder(orderId, updatedOrder);
      console.log('✅ Order totals updated successfully');

    } catch (error) {
      console.error('❌ Error updating order totals:', error);
    }
  }, [orderId]);

  // Handler para itens da grade tamanho x cor
  const handleSizeColorGridConfirm = async (gridItems: GridItem[]) => {
    try {
      setIsLoading(true);
      setIsSizeColorGridOpen(false);

      // Pegar próxima sequência
      let nextSeq = items.length > 0
        ? Math.max(...items.map(i => i.itemSeq || 0)) + 1
        : 1;

      console.log('📊 Creating', gridItems.length, 'items from grid');

      for (const gridItem of gridItems) {
        const newItem: OrderItemDTO = {
          orderId,
          itemSeq: nextSeq++,
          productId: selectedProductForGrid ? selectedProductForGrid.id : undefined,
          isProduct: true, // Itens da grade são sempre produtos
          description: selectedProductForGrid
            ? `${selectedProductForGrid.name} - ${gridItem.sizeName} - ${gridItem.colorName}`
            : `${gridItem.sizeName} - ${gridItem.colorName}`,
          size: gridItem.sizeName,
          colorId: gridItem.colorId,
          colorName: gridItem.colorName,
          quantity: gridItem.quantity,
          unitPrice: gridItem.unitPrice,
          totalValue: gridItem.quantity * gridItem.unitPrice,
          unitType: UnitType.UNIT
        };

        console.log('💾 Creating grid item:', newItem);
        await upsertOrderItem(orderId, newItem);
      }

      setSuccessMessage(`${gridItems.length} itens adicionados com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 3000);

      await loadItems();
      await updateOrderTotals();

      setSelectedProductForGrid(null);
      resetForm();

    } catch (err) {
      console.error('❌ Error creating grid items:', err);
      setError('Erro ao criar itens da grade');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data.productId && !selectedProductName) {
      loadProductName(data.productId);
    }
  }, [data.productId, selectedProductName, loadProductName]);

  return (
    <div className={styles.container}>
      <form onSubmit={onSubmit} className={styles["form-container"]}>
        {/* Display customer info */}
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Cliente</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={customerName || "Nenhum cliente selecionado"}
              disabled={true}
              style={{ backgroundColor: '#f8f9fa', color: '#6c757d', fontWeight: '500' }}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>ID do Pedido</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={orderId || ""}
              disabled={true}
              style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
            />
          </div>
          <div className={styles.coluna}>
            {/* Espaço vazio */}
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Tipo de Item</label>
            <select
              className={styles["form-select"]}
              value={itemType}
              onChange={e => {
                const newType = e.target.value as 'product' | 'service';
                setItemType(newType);
                // Limpar seleções anteriores
                if (newType === 'product') {
                  set("serviceId", undefined);
                  setSelectedServiceName("");
                } else {
                  set("productId", undefined);
                  setSelectedProductName("");
                  setAvailableSizes([]);
                }
              }}
              disabled={!editingMode}
            >
              <option value="product">Produto</option>
              <option value="service">Serviço</option>
            </select>
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>
              {itemType === 'product' ? 'Produto' : 'Serviço'}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                className={styles["form-input"]}
                value={
                  itemType === 'product'
                    ? (selectedProductName || (data.productId ? `ID: ${data.productId}` : ""))
                    : (selectedServiceName || (data.serviceId ? `ID: ${data.serviceId}` : ""))
                }
                disabled={true}
                placeholder={itemType === 'product' ? "Nenhum produto selecionado" : "Nenhum serviço selecionado"}
                style={{ flex: 1, backgroundColor: '#f8f9fa', color: '#495057' }}
              />
              {editingMode && (
                <button
                  type="button"
                  className={styles["button-search"]}
                  onClick={() => {
                    if (itemType === 'product') {
                      setIsProductDialogOpen(true);
                    } else {
                      // TODO: Implementar dialog de busca de serviços
                      alert('Busca de serviços será implementada em breve');
                    }
                  }}
                  title={itemType === 'product' ? "Pesquisar produto" : "Pesquisar serviço"}
                >
                  🔍
                </button>
              )}
            </div>
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderItems.description")}</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.description ?? ""}
              onChange={e => set("description", e.target.value)}
              disabled={!editingMode}
            />
          </div>
        </div>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderItems.quantity")}</label>
            <input
              type="number"
              step="0.01"
              className={styles["form-input"]}
              value={data.quantity ?? ""}
              onChange={e => set("quantity", e.target.value === "" ? undefined : Number(e.target.value))}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderItems.unitPrice")}</label>
            <input
              type="number"
              step="0.01"
              className={styles["form-input"]}
              value={data.unitPrice ?? ""}
              onChange={e => set("unitPrice", e.target.value === "" ? undefined : Number(e.target.value))}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderItems.unitType")}</label>
            <select
              className={styles["form-select"]}
              value={data.unitType ?? ""}
              onChange={e => set("unitType", e.target.value === "" ? undefined : e.target.value as UnitType)}
              disabled={!editingMode}
            >
              <option value="">{t("buttons.select")}</option>
              <option value={UnitType.UNIT}>{t('enums:unitType.UNIT')}</option>
              <option value={UnitType.PIECE}>{t('enums:unitType.PIECE')}</option>
              <option value={UnitType.METER}>{t('enums:unitType.METER')}</option>
              <option value={UnitType.KILO}>{t('enums:unitType.KILO')}</option>
              <option value={UnitType.LITER}>{t('enums:unitType.LITER')}</option>
              <option value={UnitType.HOUR}>{t('enums:unitType.HOUR')}</option>
              <option value={UnitType.KWH}>{t('enums:unitType.KWH')}</option>
            </select>
          </div>
        </div>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderItems.size")}</label>
            <select
              className={styles["form-select"]}
              value={data.size ?? ""}
              onChange={e => set("size", e.target.value || undefined)}
              disabled={!editingMode || availableSizes.length === 0 || itemType === 'service'}
            >
              <option value="">
                {itemType === 'service'
                  ? "Não aplicável para serviços"
                  : availableSizes.length === 0
                    ? "Selecione um produto primeiro"
                    : t("buttons.select")
                }
              </option>
              {itemType === 'product' && availableSizes.map(size => (
                <option key={size.id} value={size.size}>
                  {size.size}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>{t("orderItems.weight")}</label>
            <input
              type="number"
              step="0.01"
              className={styles["form-input"]}
              value={data.weight ?? ""}
              onChange={e => set("weight", e.target.value === "" ? undefined : Number(e.target.value))}
              disabled={!editingMode}
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Valor Total (Calculado)</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.totalValue != null ? `R$ ${Number(data.totalValue).toFixed(2)}` : "R$ 0,00"}
              disabled={true}
              style={{ backgroundColor: '#e9ecef', color: '#495057', fontWeight: 'bold' }}
              title="Valor calculado automaticamente: Quantidade × Preço Unitário"
            />
          </div>
        </div>
        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles.button} disabled={isLoading}>
                {data.id ? t("buttons.update") : t("buttons.save")}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelar}`}
                onClick={resetForm}
                disabled={isLoading}
              >
                {t("buttons.cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-novo"]}
              onClick={handleNew}
            >
              {t("orderItems.newItem")}
            </button>
          )}
        </div>
        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      {isLoading ? (
        <p className={styles.loading}>{t("buttons.loading")}</p>
      ) : items.length > 0 ? (
        <table className={styles["items-table"]}>
          <thead>
            <tr>
              <th>Seq</th>
              <th>Tipo</th>
              <th>Produto/Serviço</th>
              <th>Descrição</th>
              <th>Quantidade</th>
              <th>Preço Unit.</th>
              <th>Valor Total</th>
              <th>Unidade</th>
              <th>Tamanho</th>
              <th>Peso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              // Usar isProduct do backend para determinar o tipo
              const isProductItem = item.isProduct !== undefined ? item.isProduct : (item.productId != null);
              const itemTypeDisplay = isProductItem ? '📦' : '🔧';
              const itemTypeLabel = isProductItem ? 'Produto' : 'Serviço';

              // Exibir nome do produto/serviço se disponível
              const itemNameDisplay = isProductItem
                ? (item.productName || item.description || (item.productId ? `Produto ID: ${item.productId}` : '-'))
                : (item.serviceName || item.description || (item.serviceId ? `Serviço ID: ${item.serviceId}` : '-'));

              const isSelected = selectedRowId === item.id;

              const handleRowClick = () => {
                if (item.id) {
                  setSelectedRowId(item.id);
                  if (onItemSelected) {
                    onItemSelected(item.id);
                  }
                }
              };

              return (
                <tr
                  key={item.id || `${item.orderId}-${item.itemSeq}`}
                  onClick={handleRowClick}
                  className={isSelected ? styles.selectedRow : ''}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#e3f2fd' : undefined,
                  }}
                  title="Clique para selecionar este item"
                >
                  <td>{item.itemSeq}</td>
                  <td title={itemTypeLabel}>{itemTypeDisplay} {itemTypeLabel}</td>
                  <td><strong>{itemNameDisplay}</strong></td>
                  <td>{item.description || '-'}</td>
                  <td>{item.quantity || '-'}</td>
                  <td>R$ {item.unitPrice != null ? Number(item.unitPrice).toFixed(2) : "0.00"}</td>
                  <td style={{ fontWeight: 'bold', color: '#28a745' }}>
                    R$ {item.totalValue != null ? Number(item.totalValue).toFixed(2) : "0.00"}
                  </td>
                  <td>{item.unitType ? t(`enums:unitType.${item.unitType}`) : '-'}</td>
                  <td>{item.size || '-'}</td>
                  <td>{item.weight || '-'}</td>
                  <td>
                    <button
                      className={styles["button-editar"]}
                      onClick={() => handleEdit(item)}
                    >
                      {t("buttons.edit")}
                    </button>
                    <button
                      className={styles["button-excluir"]}
                      onClick={() => handleDelete(item)}
                    >
                      {t("buttons.delete")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className={styles.empty}>{t("orderItems.noItems")}</p>
      )}

      <ProductSearchDialog
        isOpen={isProductDialogOpen}
        onClose={() => setIsProductDialogOpen(false)}
        onSelect={handleProductSelect}
      />

      {selectedProductForGrid && (
        <SizeColorGridDialog
          isOpen={isSizeColorGridOpen}
          productId={selectedProductForGrid.id}
          productName={selectedProductForGrid.name}
          onClose={() => {
            setIsSizeColorGridOpen(false);
            setSelectedProductForGrid(null);
          }}
          onConfirm={handleSizeColorGridConfirm}
        />
      )}
    </div>
  );
}