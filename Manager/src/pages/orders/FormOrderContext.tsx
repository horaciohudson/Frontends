// src/components/orders/FormOrderContext.tsx
import { useCallback, useEffect, useState } from "react";
import { OrderContextDTO } from "../../models/Order";
import { NoteType } from "../../enums";
import { UUID } from "../../types/common";
import { upsertOrderContext, listOrderContexts, deleteOrderContext } from "../../service/Order";

import styles from "../../styles/orders/FormOrderContext.module.css";

type Props = {
  orderId: UUID;
  customerName?: string;
};

export default function FormOrderContext({ orderId, customerName }: Props) {
  const [data, setData] = useState<OrderContextDTO>({ orderId });
  const [contexts, setContexts] = useState<OrderContextDTO[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const set = <K extends keyof OrderContextDTO>(k: K, v: OrderContextDTO[K]) =>
    setData(p => ({ ...p, [k]: v }));

  const loadContexts = useCallback(async () => {
    try {
      console.log("📋 Loading order contexts for orderId:", orderId);
      setIsLoading(true);
      const contextsList = await listOrderContexts(orderId);
      console.log("📊 Order contexts response:", contextsList);
      console.log("📊 Response type:", typeof contextsList);
      console.log("📊 Is array:", Array.isArray(contextsList));

      // Se retornar um array de contextos
      if (Array.isArray(contextsList) && contextsList.length > 0) {
        console.log("✅ Setting order contexts:", contextsList);
        // Log detalhado de cada contexto
        contextsList.forEach((ctx: any, idx: number) => {
          console.log(`📋 Context ${idx}:`, {
            orderId: ctx.orderId,
            noteType: ctx.noteType,
            fiscalObservation: ctx.fiscalObservation,
            invoiceNumber: ctx.invoiceNumber,
            invoiceSeries: ctx.invoiceSeries,
            createdAt: ctx.createdAt,
            updatedAt: ctx.updatedAt
          });
        });
        setContexts(contextsList);
      }
      // Se retornar um único contexto
      else if (contextsList && (contextsList as any).orderId) {
        const singleContext = contextsList as any;
        console.log("✅ Setting single order context:", singleContext);
        console.log("📋 Single context details:", {
          orderId: singleContext.orderId,
          noteType: singleContext.noteType,
          fiscalObservation: singleContext.fiscalObservation,
          invoiceNumber: singleContext.invoiceNumber,
          invoiceSeries: singleContext.invoiceSeries,
          createdAt: singleContext.createdAt,
          updatedAt: singleContext.updatedAt
        });
        setContexts([singleContext]);
      }
      // Verificar se tem propriedade content (paginação)
      else if (contextsList && (contextsList as any).content && Array.isArray((contextsList as any).content)) {
        const paginatedResponse = contextsList as any;
        console.log("✅ Found paginated contexts:", paginatedResponse.content);
        paginatedResponse.content.forEach((ctx: any, idx: number) => {
          console.log(`📋 Paginated Context ${idx}:`, {
            orderId: ctx.orderId,
            noteType: ctx.noteType,
            fiscalObservation: ctx.fiscalObservation,
            invoiceNumber: ctx.invoiceNumber,
            invoiceSeries: ctx.invoiceSeries,
            createdAt: ctx.createdAt,
            updatedAt: ctx.updatedAt
          });
        });
        setContexts(paginatedResponse.content);
      }
      // Se não houver contextos
      else {
        console.log("❌ No order contexts found");
        setContexts([]);
      }

      // Sempre manter formulário limpo
      setData({ orderId });
      setEditingMode(false);
    } catch (err: unknown) {
      // If 404 or no context found, it's not an error - just no context yet
      console.log("❌ Error loading order contexts:", err);
      setContexts([]);
      setData({ orderId });
      setEditingMode(false);
      console.log("No context found for order, starting fresh");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      loadContexts();
    }
  }, [orderId, loadContexts]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validação: impedir salvamento de contexto vazio
    if (!data.noteType && !data.fiscalObservation) {
      setError("Por favor, preencha pelo menos o tipo de nota ou a observação fiscal antes de salvar.");
      return;
    }

    try {
      setIsLoading(true);
      console.log("💾 Saving context data:", data);
      const result = await upsertOrderContext(orderId, data);
      console.log("💾 Save result:", result);
      setSuccessMessage("Contexto salvo com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
      setEditingMode(false);
      await loadContexts();
      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError("Erro ao salvar contexto");
      console.error("Erro ao salvar contexto", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditFromTable = (context: OrderContextDTO) => {
    setData(context);
    setEditingMode(true);
    setTimeout(() => document.querySelector('select')?.focus(), 0);
  };

  const handleDeleteFromTable = async () => {
    if (!confirm("Tem certeza que deseja excluir este contexto?")) return;
    try {
      setIsLoading(true);
      console.log("🗑️ Deleting context for orderId:", orderId);
      await deleteOrderContext(orderId);
      setSuccessMessage("Contexto excluído com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadContexts();
      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError("Erro ao excluir contexto");
      console.error("Erro ao excluir contexto", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNew = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // CRÍTICO: Impede que o botão dispare o submit do form
    e.stopPropagation(); // Impede propagação do evento
    setData({ orderId });
    setEditingMode(true);
    setTimeout(() => document.querySelector('select')?.focus(), 0);
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
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Tipo de Nota</label>
            <select
              className={styles["form-select"]}
              value={data.noteType ?? ""}
              onChange={e => set("noteType", e.target.value === "" ? undefined : e.target.value as NoteType)}
              disabled={!editingMode}
            >
              <option value="">Selecione...</option>
              <option value={NoteType.ENTRY}>Entrada</option>
              <option value={NoteType.EXIT}>Saída</option>
            </select>
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Número da Nota</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.invoiceNumber ?? ""}
              onChange={e => set("invoiceNumber", e.target.value)}
              disabled={!editingMode}
              placeholder="Número da nota fiscal..."
            />
          </div>
        </div>
        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Série da Nota</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={data.invoiceSeries ?? ""}
              onChange={e => set("invoiceSeries", e.target.value)}
              disabled={!editingMode}
              placeholder="Série da nota fiscal..."
            />
          </div>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Observação Fiscal</label>
            <textarea
              className={styles["form-textarea"]}
              value={data.fiscalObservation ?? ""}
              onChange={e => set("fiscalObservation", e.target.value)}
              disabled={!editingMode}
              rows={4}
              placeholder="Digite a observação fiscal..."
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
              Novo Contexto
            </button>
          )}
        </div>
        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      {/* Tabela de contextos */}
      {isLoading ? (
        <p className={styles.loading}>Carregando contextos...</p>
      ) : contexts.length > 0 ? (
        <table className={styles["context-table"]}>
          <thead>
            <tr>
              <th>Tipo de Nota</th>
              <th>Número da Nota</th>
              <th>Série</th>
              <th>Observação Fiscal</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contexts.map((context, index) => {

              // Formatação correta do tipo de nota
              let noteTypeDisplay = '-';
              if (context.noteType === 'ENTRY') {
                noteTypeDisplay = 'Entrada';
              } else if (context.noteType === 'EXIT') {
                noteTypeDisplay = 'Saída';
              } else if (context.noteType) {
                noteTypeDisplay = context.noteType; // Mostrar valor bruto se não reconhecer
                console.log(`⚠️ Unknown noteType: ${context.noteType}`);
              }

              // Formatação da observação fiscal
              const fiscalObservationDisplay = context.fiscalObservation || '-';

              return (
                <tr key={context.orderId || `context-${index}`}>
                  <td>{noteTypeDisplay}</td>
                  <td>{context.invoiceNumber || '-'}</td>
                  <td>{context.invoiceSeries || '-'}</td>
                  <td>{fiscalObservationDisplay}</td>
                  <td>
                    <button
                      type="button"
                      className={styles["button-editar"]}
                      onClick={() => handleEditFromTable(context)}
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
        <p className={styles.empty}>Nenhum contexto cadastrado para este pedido.</p>
      )}
    </div>
  );
}
