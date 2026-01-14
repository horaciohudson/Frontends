// src/components/orders/FormOrderFinancial.tsx
import { useCallback, useEffect, useState } from "react";
import { OrderFinancialDTO } from "../../models/Order";
import { UUID } from "../../types/common";
import { upsertOrderFinancial, listOrderFinancials, deleteOrderFinancial } from "../../service/Order";

import styles from "../../styles/orders/FormOrderFinancial.module.css";

type Props = {
  orderId: UUID;
  customerName?: string;
};

export default function FormOrderFinancial({ orderId, customerName }: Props) {
  const [data, setData] = useState<OrderFinancialDTO>({ orderId });
  const [financials, setFinancials] = useState<OrderFinancialDTO[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const set = <K extends keyof OrderFinancialDTO>(k: K, v: OrderFinancialDTO[K]) =>
    setData(p => ({ ...p, [k]: v }));

  const loadFinancials = useCallback(async () => {
    try {
      console.log("💰 Loading order financials for orderId:", orderId);
      setIsLoading(true);
      const financialsList = await listOrderFinancials(orderId);
      console.log("📊 Order financials response:", financialsList);
      console.log("📊 Response type:", typeof financialsList);
      console.log("📊 Is array:", Array.isArray(financialsList));
      
      // Se retornar um array de financials
      if (Array.isArray(financialsList) && financialsList.length > 0) {
        console.log("✅ Setting order financials:", financialsList);
        setFinancials(financialsList);
      } 
      // Se retornar um único financial
      else if (financialsList && (financialsList as any).orderId) {
        const singleFinancial = financialsList as any;
        console.log("✅ Setting single order financial:", singleFinancial);
        setFinancials([singleFinancial]);
      } 
      // Verificar se tem propriedade content (paginação)
      else if (financialsList && (financialsList as any).content && Array.isArray((financialsList as any).content)) {
        const paginatedResponse = financialsList as any;
        console.log("✅ Found paginated financials:", paginatedResponse.content);
        setFinancials(paginatedResponse.content);
      }
      // Se não houver financials
      else {
        console.log("❌ No order financials found");
        setFinancials([]);
      }
      
      // Sempre manter formulário limpo
      setData({ orderId });
      setEditingMode(false);
    } catch (err: unknown) {
      // If 404 or no financial found, it's not an error - just no financial yet
      console.log("❌ Error loading order financials:", err);
      setFinancials([]);
      setData({ orderId });
      setEditingMode(false);
      console.log("No financial found for order, starting fresh");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      loadFinancials();
    }
  }, [orderId, loadFinancials]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validação: impedir salvamento de financial vazio
    if (!data.freightValue && !data.discountPercentage && !data.discountValue) {
      setError("Por favor, preencha pelo menos um dos campos antes de salvar.");
      return;
    }

    try {
      setIsLoading(true);
      console.log("💾 Saving financial data:", data);
      const result = await upsertOrderFinancial(orderId, data);
      console.log("💾 Save result:", result);
      setSuccessMessage("Dados financeiros salvos com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
      setEditingMode(false);
      await loadFinancials();
      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError("Erro ao salvar dados financeiros");
      console.error("Erro ao salvar dados financeiros", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditFromTable = (financial: OrderFinancialDTO) => {
    setData(financial);
    setEditingMode(true);
    setTimeout(() => document.querySelector('input')?.focus(), 0);
  };

  const handleDeleteFromTable = async () => {
    if (!confirm("Tem certeza que deseja excluir estes dados financeiros?")) return;
    try {
      setIsLoading(true);
      console.log("🗑️ Deleting financial for orderId:", orderId);
      await deleteOrderFinancial(orderId);
      setSuccessMessage("Dados financeiros excluídos com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadFinancials();
      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError("Erro ao excluir dados financeiros");
      console.error("Erro ao excluir dados financeiros", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNew = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // CRÍTICO: Impede que o botão dispare o submit do form
    e.stopPropagation(); // Impede propagação do evento
    setData({ orderId });
    setEditingMode(true);
    setTimeout(() => document.querySelector('input')?.focus(), 0);
  };

  const resetForm = () => {
    setData({ orderId });
    setEditingMode(false);
    setError(null);
    setSuccessMessage(null);
  };

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
            <label className={styles["form-label"]}>Valor do Frete</label>
            <input
              type="number"
              step="0.01"
              className={styles["form-input"]}
              value={data.freightValue ?? ""}
              onChange={e => set("freightValue", e.target.value === "" ? undefined : Number(e.target.value))}
              disabled={!editingMode}
              placeholder="0.00"
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Desconto (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className={styles["form-input"]}
              value={data.discountPercentage ?? ""}
              onChange={e => set("discountPercentage", e.target.value === "" ? undefined : Number(e.target.value))}
              disabled={!editingMode}
              placeholder="0.00"
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Valor do Desconto</label>
            <input
              type="number"
              step="0.01"
              className={styles["form-input"]}
              value={data.discountValue ?? ""}
              onChange={e => set("discountValue", e.target.value === "" ? undefined : Number(e.target.value))}
              disabled={!editingMode}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className={styles["form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles.button} disabled={isLoading}>
                Salvar
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelar}`}
                onClick={resetForm}
                disabled={isLoading}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-novo"]}
              onClick={handleNew}
            >
              Novo Financeiro
            </button>
          )}
        </div>
        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      {/* Tabela de dados financeiros */}
      {isLoading ? (
        <p className={styles.loading}>Carregando dados financeiros...</p>
      ) : financials.length > 0 ? (
        <table className={styles["financial-table"]}>
          <thead>
            <tr>
              <th>Valor do Frete</th>
              <th>Desconto (%)</th>
              <th>Valor do Desconto</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {financials.map((financial, index) => {
              // Formatação dos valores
              const freightDisplay = financial.freightValue != null ? 
                `R$ ${Number(financial.freightValue).toFixed(2)}` : 
                'R$ 0,00';
              
              const discountPercentageDisplay = financial.discountPercentage != null ? 
                `${Number(financial.discountPercentage).toFixed(2)}%` : 
                '0,00%';
              
              const discountValueDisplay = financial.discountValue != null ? 
                `R$ ${Number(financial.discountValue).toFixed(2)}` : 
                'R$ 0,00';
              
              return (
                <tr key={financial.orderId || `financial-${index}`}>
                  <td>{freightDisplay}</td>
                  <td>{discountPercentageDisplay}</td>
                  <td>{discountValueDisplay}</td>
                  <td>
                    <button
                      type="button"
                      className={styles["button-editar"]}
                      onClick={() => handleEditFromTable(financial)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles["button-excluir"]}
                      onClick={handleDeleteFromTable}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className={styles.empty}>Nenhum dado financeiro cadastrado para este pedido.</p>
      )}
    </div>
  );
} 
