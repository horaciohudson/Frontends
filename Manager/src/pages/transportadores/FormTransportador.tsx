import { useEffect, useRef, useState } from "react";
import styles from "../../styles/transportadores/FormTransportador.module.css";
import { Transportador } from "../../models/Transportador";
import api from "../../service/api";

interface Empresa {
  id: number;
  nomeFantasia: string;
}

interface FormaPagamento {
  id: number;
  nome: string;
}

interface Props {
  transportador: Transportador | null;
  transportadores: Transportador[];
  onEditar: (transportador: Transportador) => void;
  onSalvar: () => void;
}

const inicial: Transportador = {
  idTransportador: 0,
  empresaId: 0,
  nomeFantasia: "", // Adicionado
  diasPrazoEntrega: 0,
  formaPagamento: 0,
  tipoTransporte: "",
  ativo: true,
  observacoes: "",
  
};

export default function FormTransportador({ transportador, transportadores, onEditar, onSalvar }: Props) {
  const [dados, setDados] = useState<Transportador>(inicial);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLSelectElement>(null);

  const empresaMap = new Map(empresas.map(e => [e.id, e.nomeFantasia]));
  const formaPagamentoMap = new Map(formasPagamento.map(fp => [fp.id, fp.nome]));

  // Debug transportadores prop
  useEffect(() => {
    console.log("Transportadores prop:", transportadores);
  }, [transportadores]);

  // Fetch empresas and formasPagamento
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [empresasRes, formasPagamentoRes] = await Promise.all([
          api.get("/empresas"),
          api.get("/formas-pagamento"),
        ]);
        console.log("Empresas API Response:", empresasRes.data); // Debug
        console.log("Formas Pagamento API Response:", formasPagamentoRes.data); // Debug
        setEmpresas(empresasRes.data);
        const formasData = Array.isArray(formasPagamentoRes.data) ? formasPagamentoRes.data : formasPagamentoRes.data.content || [];
        setFormasPagamento(formasData);
        setError(null);
      } catch (err: any) {
        console.error("Erro ao buscar dados:", err);
        setError("Falha ao carregar empresas ou formas de pagamento.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (transportador) {
      setDados(transportador);
      setModoEdicao(true);
    } else {
      setDados(inicial);
      setModoEdicao(false);
    }
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [transportador]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setDados((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : (name === "empresaId" || name === "formaPagamento" ? Number(value) : value),
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dados.empresaId === 0) {
      setError("Selecione uma empresa.");
      return;
    }
    if (dados.formaPagamento === 0) {
      setError("Selecione uma forma de pagamento.");
      return;
    }
    if (dados.diasPrazoEntrega < 0) {
      setError("O prazo de entrega não pode ser negativo.");
      return;
    }

    const payload = {
      empresaId: dados.empresaId,
      nomeFantasia : dados.nomeFantasia,
      diasPrazoEntrega: dados.diasPrazoEntrega,
      formaPagamento: dados.formaPagamento,
      tipoTransporte: dados.tipoTransporte,
      ativo: dados.ativo,
      observacoes: dados.observacoes,
    };

    try {
      if (dados.idTransportador) {
        await api.put(`/transportadores/${dados.idTransportador}`, payload);
      } else {
        await api.post("/transportadores", payload);
      }
      console.log("Calling onSalvar"); // Debug
      onSalvar();
      setDados({ ...inicial, empresaId: dados.empresaId, formaPagamento: dados.formaPagamento });
      setModoEdicao(true);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao salvar transportador:", err);
      setError(err.response?.data?.message || "Falha ao salvar transportador.");
    }
  };

  const handleNovo = () => {
    setDados(inicial);
    setModoEdicao(true);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Deseja realmente excluir este transportador?")) return;
    try {
      await api.delete(`/transportadores/${id}`);
      console.log("Calling onSalvar after delete"); // Debug
      onSalvar();
      setError(null);
    } catch (err: any) {
      console.error("Erro ao excluir transportador:", err);
      setError(err.response?.data?.message || "Falha ao excluir transportador.");
    }
  };

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>Carregando dados...</p>}

      <form className={styles["form-container"]} onSubmit={handleSubmit} autoComplete="new-transportador">
        <div className={styles["form-linha"]}>
          <div className={`${styles.coluna} ${styles["coluna-empresa"]}`}>
            <label className={styles["form-label"]}>Empresa:</label>
            <select
              name="empresaId"
              value={dados.empresaId}
              onChange={handleChange}
              required
              disabled={!modoEdicao || loading}
              className={styles["form-input"]}
              ref={inputRef}
            >
              <option value={0}>Selecione</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.nomeFantasia}</option>
              ))}
            </select>
          </div>

          <div className={`${styles.coluna} ${styles["coluna-forma-pagamento"]}`}>
            <label className={styles["form-label"]}>Forma de Pagamento:</label>
            <select
              name="formaPagamento"
              value={dados.formaPagamento}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!modoEdicao || loading}
            >
              <option value={0}>Selecione</option>
              {formasPagamento.map((fp) => (
                <option key={fp.id} value={fp.id}>{fp.nome}</option>
              ))}
            </select>
          </div>

          <div className={`${styles.coluna} ${styles["coluna-prazo"]}`}>
            <label className={styles["form-label"]}>Prazo Entrega:</label>
            <input
              type="number"
              name="diasPrazoEntrega"
              value={dados.diasPrazoEntrega}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!modoEdicao || loading}
              placeholder="Ex: 30 dias"
              min="0"
              autoComplete="off"
            />
          </div>
        </div>

        <div className={styles["form-linha"]}>
          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Tipo Transporte:</label>
            <input
              type="text"
              name="tipoTransporte"
              value={dados.tipoTransporte}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!modoEdicao || loading}
              placeholder="Ex: Rodoviário"
              autoComplete="off"
            />
          </div>

          <div className={styles.coluna}>
            <label className={styles["form-label"]}>Ativo:</label>
            <input
              type="checkbox"
              name="ativo"
              checked={dados.ativo}
              onChange={handleChange}
              disabled={!modoEdicao || loading}
            />
          </div>

          <div className={styles.coluna} style={{ flex: 1 }}>
            <label className={styles["form-label"]}>Observações:</label>
            <textarea
              name="observacoes"
              value={dados.observacoes}
              onChange={handleChange}
              className={styles["form-input"]}
              disabled={!modoEdicao || loading}
              placeholder="Observações sobre o transportador"
              rows={3}
            />
          </div>
        </div>

        <div className={styles["form-actions"]}>
          {modoEdicao ? (
            <>
              <button type="submit" className={styles.button} disabled={loading}>Salvar</button>
              <button
                type="button"
                className={`${styles.button} ${styles.cancelar}`}
                onClick={() => {
                  setModoEdicao(false);
                  setDados(inicial);
                  setError(null);
                }}
                disabled={loading}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["button-novo"]}
              onClick={handleNovo}
              disabled={loading}
            >
              + Novo Transportador
            </button>
          )}
        </div>
      </form>

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Pagamento</th>
            <th>Prazo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4}>Carregando transportadores...</td>
            </tr>
          ) : transportadores.length > 0 ? (
            transportadores.map((f) => {
              console.log("Rendering transportador:", f); // Debug each row
              return (
                <tr key={f.idTransportador || Math.random()}>
                  <td>{empresaMap.get(f.empresaId) || "Empresa não encontrada"}</td>
                  <td>{formaPagamentoMap.get(f.formaPagamento) || "Forma de pagamento não encontrada"}</td>
                  <td>{f.diasPrazoEntrega} dias</td>
                  <td>
                    <button className={styles["button-editar"]} onClick={() => onEditar(f)}>Editar</button>
                    <button className={styles["button-excluir"]} onClick={() => handleExcluir(f.idTransportador!)}>Excluir</button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4}>Nenhum transportador cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
