import { useEffect, useRef, useState } from "react";
import { ColorService } from "../../service/Color";
import { SizeService } from "../../service/Size";
import { Color } from "../../models/Color";
import { Size } from "../../models/Size";
import styles from "../../styles/colors/FormColor.module.css";

const initialColor: Color = {
  id: null,
  name: "",
  hexCode: "",
  active: true,
  displayOrder: 0,
  sizeId: null,
};

export default function FormColor() {
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [form, setForm] = useState<Color>(initialColor);

  const [editingMode, setEditingMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  // ---- loads ----
  const loadColors = async () => {
    try {
      console.log("🎨 Carregando cores...");
      const colorsList = await ColorService.getAll();
      console.log("📋 Cores carregadas:", colorsList);
      console.log("📋 Primeira cor:", colorsList[0]);
      console.log("📋 Estrutura da primeira cor:", JSON.stringify(colorsList[0], null, 2));
      setColors(colorsList.filter(c => c.active !== false));
    } catch (error) {
      console.error("❌ Erro ao carregar cores:", error);
      setColors([]);
    }
  };

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
    loadColors();
    loadSizes();
  }, []);

  // ---- handlers ----
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
        name === 'displayOrder' ? parseInt(value) || 0 :
          name === 'sizeId' ? (value === '' ? null : value) :
            value
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
        hexCode: form.hexCode?.trim() || "",
        active: form.active,
        displayOrder: form.displayOrder || 0,
        sizeId: form.sizeId
      };
      console.log("📤 Enviando payload para o backend:", payload);

      let saved: Color;
      if (form.id) {
        saved = await ColorService.update(form.id, payload);
        setColors((prev) => prev.map((c) => (c.id === form.id ? saved : c)));
      } else {
        saved = await ColorService.create(payload);
        setColors((prev) => [...prev, saved]);
      }

      resetForm();
      setSuccessMessage("Cor salva com sucesso!");
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      console.error("❌ Erro ao salvar cor:", err);
      setError("Erro ao salvar cor: " + (err.message || "Erro desconhecido"));
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setForm(initialColor);
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handleEdit = (color: Color) => {
    setForm(color);
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handleDelete = async (id: string | null) => {
    if (!id) return;
    if (!window.confirm("Tem certeza que deseja excluir esta cor?")) return;

    try {
      await ColorService.delete(id);
      setColors((prev) => prev.filter((c) => c.id !== id));
      if (form.id === id) {
        resetForm();
      }
      setSuccessMessage("Cor excluída com sucesso!");
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      setError("Erro ao excluir cor");
    }
  };

  const resetForm = () => {
    setForm(initialColor);
    setEditingMode(false);
    setError(null);
    setSuccessMessage(null);
  };

  const getSizeName = (sizeId: string | null | undefined) => {
    if (!sizeId) return "Global";
    const size = sizes.find(s => s.id === sizeId);
    return size ? (size.name || size.sizeName) : `ID: ${sizeId}`;
  };

  // ---------- RENDER ----------
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🎨 Cadastro de Cores</h2>

      <form className={styles.form} onSubmit={handleSave}>
        <div className={styles.formRow}>
          <div className={styles.formCol}>
            <label className={styles.label}>Nome da Cor:</label>
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
              placeholder="Ex: Azul Marinho, Verde Claro..."
            />
          </div>
          <div className={styles.formCol}>
            <label className={styles.label}>Código Hex:</label>
            <input
              type="text"
              name="hexCode"
              value={form.hexCode || ""}
              onChange={handleChange}
              className={styles.input}
              disabled={!editingMode}
              maxLength={7}
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formCol}>
            <label className={styles.label}>Tamanho Específico:</label>
            <select
              name="sizeId"
              value={form.sizeId || ""}
              onChange={handleChange}
              className={styles.input}
              disabled={!editingMode}
            >
              <option value="">Global (todos os tamanhos)</option>
              {sizes.map((size) => (
                <option key={size.id} value={size.id || ""}>
                  {size.name || size.sizeName} {size.description ? `- ${size.description}` : ''}
                </option>
              ))}
            </select>
          </div>
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
        </div>

        <div className={styles.formRow}>
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
            <th>Cor</th>
            <th>Nome</th>
            <th>Tamanho</th>
            <th>Ordem</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {colors.map((color) => (
            <tr key={color.id ?? `temp-${color.name}`}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: color.hexCode || '#CCCCCC',
                      border: '1px solid #ccc',
                      flexShrink: 0
                    }}
                  />
                </div>
              </td>
              <td><strong>{color.name}</strong></td>
              <td>{getSizeName(color.sizeId)}</td>
              <td>{color.displayOrder}</td>
              <td>
                <span className={color.active ? styles.statusActive : styles.statusInactive}>
                  {color.active ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td>
                <button
                  className={`${styles.actionButton} ${styles.editButton}`}
                  onClick={() => handleEdit(color)}
                >
                  Editar
                </button>
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => handleDelete(color.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {colors.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                Nenhuma cor cadastrada
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}