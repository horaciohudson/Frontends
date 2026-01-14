import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../styles/transportadores/FormTransportadoresTabs.module.css";
import FormTransportador from "./FormTransportador";
import FormTransportadorEndereco from "./FormTransportadorEndereco"; // Ajuste: Corrigir typo
import { Transportador } from "../../models/Transportador";
import api from "../../service/api";
import { TRANSLATION_NAMESPACES } from "../../locales";


export default function TransportadorTabs() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
  const [aba, setAba] = useState<"transportador" | "endereco">("transportador");
  const [transportadores, setTransportadores] = useState<Transportador[]>([]);
  const [transportadorAtual, setTransportadorAtual] = useState<Transportador | null>(null);

  const [error, setError] = useState<string | null>(null); // Ajuste: Estado para erros
  const [nomeFantasia, setNomeFantasia] = useState<string | null>(null); // Ajuste: Nome fantasia

  const carregar = async () => {
    try {
      const res = await api.get("/transportadores");
      setTransportadores(res.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar transportadores:", err);
      setError("Falha ao carregar transportadores.");
    }
  };

  const carregarEnderecos = async (transportadorId: number | null) => {
    try {
      if (!transportadorId) {
        // setEnderecos([]);
        return;
      }
      await api.get(`/transportadores-enderecos/transportador/${transportadorId}`); // Ajuste: Filtrar por transportador
      // setEnderecos(res.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar endereços:", err);
      setError("Falha ao carregar endereços.");
    }
  };

  const carregarNomeFantasia = async (empresaId: number | null) => {
    try {
      if (!empresaId) {
        setNomeFantasia(null);
        return;
      }
      const res = await api.get(`/empresas/${empresaId}`);
      setNomeFantasia(res.data.nomeFantasia || res.data.razaoSocial || "Empresa sem nome");
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar nome fantasia:", err);
      setNomeFantasia(null);
      setError("Falha ao carregar nome da empresa.");
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    carregarEnderecos(transportadorAtual?.idTransportador || null);
    carregarNomeFantasia(transportadorAtual?.empresaId || null);
  }, [transportadorAtual]);

  const handleEditar = (f: Transportador) => {
    setTransportadorAtual(f);
    setAba("transportador");
  };

  const handleSalvar = () => {
    carregar();
    // Ajuste: Não resetar transportadorAtual para permitir continuar na aba "endereco"
    // setTransportadorAtual(null);
    setAba("transportador");
  };

  const abasHabilitadas = !!transportadorAtual;

  return (
    <div className={styles.container}>
      <h2>{t("transportadores.title")}</h2>
      {error && <p className={styles.error}>{error}</p>} {/* Ajuste: Exibir erros */}
      {transportadorAtual && (
        <div className={styles.transportadorAtivo}>
          {t("transportadores.activeTransportador")}: <strong>{nomeFantasia || `ID ${transportadorAtual.idTransportador}`}</strong>
        </div>
      )}
      <div className={styles.abas}>
        <button
          className={`${styles.aba} ${aba === "transportador" ? styles.ativa : ""}`}
          onClick={() => setAba("transportador")}
        >
          {t("transportadores.transportador")}
        </button>
        <button
          className={`${styles.aba} ${aba === "endereco" ? styles.ativa : ""}`}
          onClick={() => abasHabilitadas && setAba("endereco")}
          disabled={!abasHabilitadas}
        >
          {t("transportadores.address")}
        </button>
      </div>
      <div className={styles.conteudo}>
        {aba === "transportador" && (
          <FormTransportador
            transportador={transportadorAtual}
            transportadores={transportadores}
            onEditar={handleEditar}
            onSalvar={handleSalvar}
          />
        )}
        {aba === "endereco" && transportadorAtual && (
          <FormTransportadorEndereco

            entidadeId={transportadorAtual.idTransportador!}
            onSalvar={handleSalvar}
          />
        )}
      </div>
    </div>
  );
}
