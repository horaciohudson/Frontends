import { useEffect, useRef, useState, memo } from "react";
import api from "../../service/api";
import styles from "../../styles/transportadores/FormTrasnsportadorEndereco.module.css";

interface Endereco {
  id: number | null;
  transportadorId: number | null;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  tipoTransportadorEndereco: "COMERCIAL"; // Pode ser extendido para outros tipos, ex: "RESIDENCIAL"
}

interface Props {
  entidadeId: number;
  onSalvar: () => void;
}

const inicial: Endereco = {
  id: null,
  transportadorId: null,
  logradouro: "",
  numero: "",
  bairro: "",
  cidade: "",
  uf: "",
  cep: "",
  tipoTransportadorEndereco: "COMERCIAL",
};

function inicializarForm(entidadeId: number) {
  return {
    ...inicial,
    transportadorId: entidadeId,
  };
}

function FormFornecedorEndereco({ entidadeId, onSalvar }: Props) {
  console.log("🔄 FormTransportadorEndereco renderizado: entidadeId =", entidadeId);
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [form, setForm] = useState<Endereco>(inicializarForm(entidadeId));
  const [modoEdicao, setModoEdicao] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nomeFantasia, setNomeFantasia] = useState<string>(""); // Novo estado para razaoSocial
  const logradouroRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Carregar razaoSocial do fornecedor
  useEffect(() => {
    const carregarNomeFantasia = async () => {
      try {
        console.log("📤 Buscando transportador com ID:", entidadeId);
        const res = await api.get(`/transportadores/${entidadeId}`);
        setNomeFantasia(res.data.nomeFantasia || "");
        console.log("📥 Nome Fantasia recebida:", res.data.nomeFantasia);
      } catch (err: any) {
        console.error("Erro ao carregar nome Fantasia:", err);
        setError(err.response?.data?.message || "Falha ao carregar dados do transportador.");
      }
    };

    if (entidadeId) {
      carregarNomeFantasia();
    }
  }, [entidadeId]);

  // Carregar endereços
  useEffect(() => {
    console.log("📡 useEffect disparado: entidadeId =", entidadeId);
    setEnderecos([]);
    if (entidadeId && !isSubmitting) {
      carregarEnderecos(entidadeId);
    } else {
      setEnderecos([]);
      setForm(inicial);
      setModoEdicao(false);
      setAviso("Selecione um transportador.");
      setError(null);
    }
  }, [entidadeId, isSubmitting]);

  const carregarEnderecos = async (transportadorId: number) => {
    try {
      if (!transportadorId) {
        setError("ID do transportador inválido.");
        console.log("🚫 ID do transportador inválido:", entidadeId);
        return;
      }
      console.log("📤 Enviando GET para /transportadores-enderecos/transportador/", transportadorId);
      const res = await api.get(`/transportadores-enderecos/transportador/${transportadorId}`);
      console.log("📡 Resposta do GET /transportadores-enderecos/transportador:", JSON.stringify(res.data, null, 2));
      const lista = Array.isArray(res.data) ? res.data : res.data.content || [];
      const mappedLista = lista.map((e: any) => ({
        id: Number(e.id) || null,
        transportadorId: Number(e.transportadorId) || null,
        logradouro: e.logradouro || "",
        numero: e.numero || "",
        bairro: e.bairro || "",
        cidade: e.cidade || "",
        uf: e.uf || "",
        cep: e.cep || "",
        tipoTransportadorEndereco: e.tipoTransportadorEndereco || "COMERCIAL",
      }));
      console.log("📥 Endereços recebidos:", JSON.stringify(mappedLista, null, 2));
      setEnderecos(mappedLista);
      if (mappedLista.length > 0) {
        setAviso("Endereços carregados.");
      } else {
        setForm(inicializarForm(entidadeId));
        setAviso("Nenhum endereço encontrado. Crie um novo.");
      }
    } catch (err: any) {
      console.error("Erro ao carregar endereços:", err);
      setError(err.response?.data?.message || "Falha ao carregar endereços.");
    }
  };

  const resetarFormulario = () => {
    console.log("🧹 Resetando formulário: entidadeId =", entidadeId);
    setForm(inicializarForm(entidadeId));
    setModoEdicao(false);
    setError(null);
    setAviso(enderecos.length > 0 ? "Endereços carregados." : "Nenhum endereço encontrado. Crie um novo.");
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`📝 Alterando ${name}:`, value);
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔥 handleSalvar chamado:", JSON.stringify(form, null, 2));
    if (!formRef.current || e.currentTarget !== formRef.current) {
      console.log("🚫 Submissão ignorada: evento não originado do formulário");
      return;
    }
    if (isSubmitting) {
      console.log("🚫 Submissão ignorada: já em andamento");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setAviso(null);
    if (!form.transportadorId) {
      setError("Fornecedor não selecionado.");
      console.log("🚫 Validação falhou: transportadorId =", form.transportadorId);
      setIsSubmitting(false);
      return;
    }
    if (!form.logradouro) {
      setError("Logradouro é obrigatório.");
      console.log("🚫 Validação falhou: logradouro =", form.logradouro);
      setIsSubmitting(false);
      return;
    }
    try {
      const payload = {
        id: form.id,
        transportadorId: form.transportadorId,
        logradouro: form.logradouro,
        numero: form.numero || null,
        bairro: form.bairro || null,
        cidade: form.cidade || null,
        uf: form.uf || null,
        cep: form.cep || null,
        tipoEmpresaEndereco: form.tipoTransportadorEndereco,
      };
      let res;
      if (form.id) {
        console.log("📤 Enviando PUT para /transportadores-enderecos/", form.id);
        res = await api.put(`/transportadores-enderecos/${form.id}`, payload);
        console.log("✅ Resposta do atualizar:", JSON.stringify(res.data, null, 2));
        setAviso("Endereço atualizado com sucesso.");
        setEnderecos((prev) =>
          prev.map((e) => (e.id === res.data.id ? { ...res.data } : e))
        );
      } else {
        console.log("📤 Enviando POST para /transportadores-enderecos");
        res = await api.post("/transportadores-enderecos", payload);
        console.log("✅ Resposta do criar:", JSON.stringify(res.data, null, 2));
        setAviso("Endereço criado com sucesso.");
        setEnderecos((prev) => [...prev, { ...res.data }]);
      }
      resetarFormulario();
      onSalvar(); // Chama o callback para atualizar o estado pai
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      setError(err.response?.data?.message || "Falha ao salvar endereço.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditar = (endereco: Endereco) => {
    console.log("✏️ Editando endereço:", JSON.stringify(endereco, null, 2));
    setForm({ ...endereco });
    setModoEdicao(true);
    setAviso("Editando endereço.");
    logradouroRef.current?.focus();
  };

  const debounce = (func: Function, wait: number) => {
    let timeout: number;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleExcluir = debounce(async (id: number | null) => {
    console.log("🗑️ handleExcluir chamado: id =", id);
    if (!id) {
      setError("ID inválido para exclusão.");
      return;
    }
    if (excluindo) {
      console.log("🚫 Exclusão já em andamento");
      return;
    }
    if (!confirm("Deseja realmente excluir este endereço?")) {
      console.log("❌ Exclusão cancelada pelo usuário");
      return;
    }
    setExcluindo(true);
    try {
      console.log("📤 Enviando DELETE para /transportadores-enderecos/", id);
      await api.delete(`/transportadores-enderecos/${id}`);
      console.log("✅ Endereço excluído: id =", id);
      setEnderecos((prev) => prev.filter((e) => e.id !== id));
      setAviso("Endereço excluído com sucesso.");
      resetarFormulario();
      onSalvar(); // Chama o callback para atualizar o estado pai
    } catch (err: any) {
      console.error("Erro ao excluir:", err);
      setError(err.response?.data?.message || "Falha ao excluir endereço.");
    } finally {
      setExcluindo(false);
    }
  }, 100);

  const handleNovo = () => {
    console.log("➕ handleNovo chamado: entidadeId =", entidadeId);
    if (!entidadeId) {
      setError("Selecione um transportador.");
      console.log("🚫 Validação falhou: entidadeId =", entidadeId);
      return;
    }
    setForm(inicializarForm(entidadeId));
    setModoEdicao(true);
    setAviso("Cadastrando novo endereço.");
    setError(null);
    logradouroRef.current?.focus();
    console.log("📜 Form após handleNovo:", JSON.stringify(form, null, 2));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("⌨️ Enter bloqueado no input");
    }
  };

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}
      {aviso && <p className={styles.aviso}>{aviso}</p>}
      <div className={styles["form-actions"]}>
        {!modoEdicao && (
          <button
            type="button"
            className={styles["button-novo"]}
            onClick={handleNovo}
            disabled={!entidadeId} // Corrigido para usar entidadeId
          >
            + Novo Endereço
          </button>
        )}
      </div>
      <form ref={formRef} onSubmit={handleSalvar} className={styles["form-container"]}>
        <div className={styles["form-linha"]}>
          <div className={`${styles.coluna} ${styles["coluna-nome"]}`}>
            <label className={styles["form-label"]}>Fornecedor:</label>
            <input
              value={nomeFantasia}
              className={styles["form-input"]}
              disabled={true}
              type="text"
              aria-label="Transportador"
            />
          </div>
          <div className={`${styles.coluna} ${styles["coluna-valor"]}`}>
            <label className={styles["form-label"]}>Logradouro:</label>
            <input
              ref={logradouroRef}
              name="logradouro"
              value={form.logradouro}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles["form-input"]}
              disabled={!modoEdicao}
              type="text"
              required
              aria-label="Logradouro"
            />
          </div>
          <div className={`${styles.coluna} ${styles["coluna-valor"]}`}>
            <label className={styles["form-label"]}>Número:</label>
            <input
              name="numero"
              value={form.numero}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles["form-input"]}
              disabled={!modoEdicao}
              type="text"
              aria-label="Número"
            />
          </div>
        </div>
        <div className={styles["form-linha"]}>
          <div className={`${styles.coluna} ${styles["coluna-valor"]}`}>
            <label className={styles["form-label"]}>Bairro:</label>
            <input
              name="bairro"
              value={form.bairro}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles["form-input"]}
              disabled={!modoEdicao}
              type="text"
              aria-label="Bairro"
            />
          </div>
          <div className={`${styles.coluna} ${styles["coluna-valor"]}`}>
            <label className={styles["form-label"]}>Cidade:</label>
            <input
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles["form-input"]}
              disabled={!modoEdicao}
              type="text"
              aria-label="Cidade"
            />
          </div>
          <div className={`${styles.coluna} ${styles["coluna-valor"]}`}>
            <label className={styles["form-label"]}>Estado:</label>
            <input
              name="uf"
              value={form.uf}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles["form-input"]}
              disabled={!modoEdicao}
              type="text"
              aria-label="UF"
            />
          </div>
        </div>
        <div className={styles["form-linha"]}>
          <div className={`${styles.coluna} ${styles["coluna-valor"]}`}>
            <label className={styles["form-label"]}>CEP:</label>
            <input
              name="cep"
              value={form.cep}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={styles["form-input"]}
              disabled={!modoEdicao}
              type="text"
              aria-label="CEP"
            />
          </div>
          {/* Opcional: Campo para tipoEmpresaEndereco, se editável
          <div className={`${styles.coluna} ${styles["coluna-valor"]}`}>
            <label className={styles["form-label"]}>Tipo de Endereço:</label>
            <select
              name="tipoEmpresaEndereco"
              value={form.tipoEmpresaEndereco}
              onChange={(e) => setForm((prev) => ({ ...prev, tipoEmpresaEndereco: e.target.value as "COMERCIAL" }))}
              className={styles["form-input"]}
              disabled={!modoEdicao}
              aria-label="Tipo de Endereço"
            >
              <option value="COMERCIAL">Comercial</option>
              <option value="RESIDENCIAL">Residencial</option>
            </select>
          </div>
          */}
        </div>
        {modoEdicao && (
          <div className={styles["form-actions"]}>
            <button type="submit" className={styles.button} disabled={isSubmitting}>
              {form.id ? "Atualizar" : "Salvar"}
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.cancelar}`}
              onClick={resetarFormulario}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          </div>
        )}
      </form>
      <table className={styles["cliente-table"]}>
        <thead>
          <tr>
            <th>Logradouro</th>
            <th>Número</th>
            <th>Bairro</th>
            <th>Cidade</th>
            <th>Estado</th>
            <th>CEP</th>
            <th>Tipo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {enderecos.map((e) => (
            <tr key={e.id ?? `no-id-${e.logradouro}`}>
              <td>{e.logradouro}</td>
              <td>{e.numero}</td>
              <td>{e.bairro}</td>
              <td>{e.cidade}</td>
              <td>{e.uf}</td>
              <td>{e.cep}</td>
              <td>{e.tipoTransportadorEndereco}</td>
              <td>
                <button
                  className={styles["button-editar"]}
                  onClick={() => handleEditar(e)}
                  disabled={modoEdicao || isSubmitting}
                >
                  Editar
                </button>
                <button
                  className={styles["button-excluir"]}
                  onClick={() => handleExcluir(e.id)}
                  disabled={e.id == null || excluindo || modoEdicao || isSubmitting}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(FormFornecedorEndereco);
