import { useEffect, useRef, useState } from "react";
import { SizeService } from "../../service/Size";
import { Size } from "../../models/Size";
import styles from "../../styles/sizes/FormSize.module.css";

const initialSize: Size = {
  id: null,
  name: "",
  description: "",
  active: true,
  displayOrder: 0,
};

export default function FormSize() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [form, setForm] = useState<Size>(initialSize);

  const [editingMode, setEditingMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  // ---- loads ----
  const loadSizes = async () => {
    try {
      console.log("📏 Carregando tamanhos...");
      const sizesList = await SizeService.getAll();
      console.log("📋 Tamanhos carregados:", sizesList);
      setSizes(sizesList.filter(s => s.active !== false));
    } catch (error) {
      console.error("❌ Erro ao carregar tamanhos:", error);
      setSizes([]);
    }
  };

  // initial
  useEffect(() => {
    loadSizes();
  }, []);

  // ---- handlers ----
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (name === 'displayOrder' ? parseInt(value) || 0 : value)
    }));
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Nome é obrigatório";
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validate();
    if (msg) { setError(msg); return; }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const payload = { 
        name: form.name.trim(),
        description: form.description?.trim() || "",
        active: form.active,
        displayOrder: form.displayOrder || 0
      };
      console.log("📤 Enviando payload para o backend:", payload);

      let saved: Size;
      if (form.id) {
        saved = await SizeService.update(form.id, payload);
        setSizes((prev) => prev.map((s) => (s.id === form.id ? saved : s)));
      } else {
        saved = await SizeService.create(payload);
        setSizes((prev) => [...prev, saved]);
      }

      resetForm();
      setSuccessMessage("Tamanho salvo com sucesso!");
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      console.error("❌ Erro ao salvar tamanho:", err);
      setError("Erro ao salvar tamanho: " + (err.message || "Erro desconhecido"));
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setForm(initialSize);
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handleEdit = (size: Size) => {
    setForm(size);
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    if (!window.confirm("Tem certeza que deseja excluir este tamanho?")) return;
    
    try {
      await SizeService.delete(id);
      setSizes((prev) => prev.filter((s) => s.id !== id));
      if (form.id === id) {
        resetForm();
      }
      setSuccessMessage("Tamanho excluído com sucesso!");
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      setError("Erro ao excluir tamanho");
    }
  };

  const resetForm = () => {
    setForm(initialSize);
    setEditingMode(false);
    setError(null);
    setSuccessMessage(null);
  };

  // ---------- RENDER ----------
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📏 Cadastro de Tamanhos</h2>
      
      <form className={styles.form} onSubmit={handleSave}>
        <div className={styles.formRow}>
          <div className={styles.formCol}>
            <label className={styles.label}>Nome do Tamanho:</label>
            <input
              ref={nameRef}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={styles.input}
              disabled={!editingMode}
              required
              maxLength={50}
              placeholder="Ex: P, M, G, 36, 38..."
            />
          </div>
          <div className={styles.formCol}>
            <label className={styles.label}>Descrição:</label>
            <input
              type="text"
              name="description"
              value={form.description || ""}
              onChange={handleChange}
              className={styles.input}
              disabled={!editingMode}
              maxLength={100}
              placeholder="Ex: Pequeno, Médio, Grande..."
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formCol}>
            <label className={styles.label}>Ordem de Exibição:</label>
            <input
              type="number"
              name="displayOrder"
              value={form.displayOrder || 0}
              onChange={handleChange}
              className={styles.input}
              disabled={!editingMode}
              min="0"
              placeholder="0"
            />
          </div>
          <div className={styles.formCol}>
            <label className={styles.label}>
              <input
                type="checkbox"
                name="active"
                checked={form.active || false}
                onChange={handleChange}
                disabled={!editingMode}
                className={styles.checkbox}
              />
              Ativo
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          {editingMode ? (
            <>
              <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} disabled={saving}>
                {form.id ? "Atualizar" : "Salvar"}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={resetForm}
                disabled={saving}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonNew}`}
              onClick={handleNew}
            >
              Novo
            </button>
          )}
        </div>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Ordem</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((size) => (
            <tr key={size.id ?? `temp-${size.name}`}>
              <td><strong>{size.name}</strong></td>
              <td>{size.description}</td>
              <td>{size.displayOrder}</td>
              <td>
                <span className={size.active ? styles.statusActive : styles.statusInactive}>
                  {size.active ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td>
                <button 
                  className={`${styles.actionButton} ${styles.editButton}`}
                  onClick={() => handleEdit(size)}
                >
                  Editar
                </button>
                <button 
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => handleDelete(size.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {sizes.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                Nenhum tamanho cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}