import { useEffect, useRef, useState } from "react";
import { ProductColorService } from "../../service/ProductColor";
import { ProductColor } from "../../models/ProductColor";
import styles from "../../styles/productAccessories/FormProductCategory.module.css";

interface FormProductColorProps {
  onSelectColor?: (color: ProductColor | null) => void;
}

const initialColor: ProductColor = {
  id: null,
  name: "",
};

export default function FormProductColor({ onSelectColor }: FormProductColorProps) {

  const [colors, setColors] = useState<ProductColor[]>([]);
  const [form, setForm] = useState<ProductColor>(initialColor);

  const [editingMode, setEditingMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  // ---- loads ----
  const loadColors = async () => {
    try {
      console.log("🎨 Carregando cores...");
      const colorsList = await ProductColorService.getAll();
      console.log("📋 Cores carregadas:", colorsList);
      setColors(colorsList);
    } catch (error) {
      console.error("❌ Erro ao carregar cores:", error);
      setColors([]);
    }
  };

  // initial
  useEffect(() => {
    loadColors();
  }, []);

  // ---- handlers ----
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

      const payload = { name: form.name.trim() };
      console.log("📤 Enviando payload para o backend:", payload);

      let saved: ProductColor;
      if (form.id) {
        saved = await ProductColorService.update(form.id, payload);
        setColors((prev) => prev.map((c) => (c.id === form.id ? saved : c)));
      } else {
        saved = await ProductColorService.create(payload);
        setColors((prev) => [...prev, saved]);
      }

      resetForm();
      onSelectColor?.(saved);
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
    onSelectColor?.(null);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handleEdit = (color: ProductColor) => {
    setForm(color);
    setEditingMode(true);
    setError(null);
    setSuccessMessage(null);
    onSelectColor?.(color);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    if (!window.confirm("Tem certeza que deseja excluir esta cor?")) return;
    
    try {
      await ProductColorService.delete(id);
      setColors((prev) => prev.filter((c) => c.id !== id));
      if (form.id === id) {
        resetForm();
      }
      onSelectColor?.(null);
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
    onSelectColor?.(null);
  };

  // ---------- RENDER ----------
  return (
    <div className={styles["productCategory-form"]}>
      <form onSubmit={handleSave}>
        <div className={styles["productCategory-form-row"]}>
          <div className={styles["productCategory-form-col"]}>
            <label className={styles["productCategory-form-label"]}>Nome da Cor:</label>
            <input
              ref={nameRef}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={styles["productCategory-form-input"]}
              disabled={!editingMode}
              required
              maxLength={50}
              placeholder="Ex: Azul Marinho, Verde Claro..."
            />
          </div>
        </div>

        <div className={styles["productCategory-form-actions"]}>
          {editingMode ? (
            <>
              <button type="submit" className={styles["productCategory-button"]} disabled={saving}>
                {form.id ? "Atualizar" : "Salvar"}
              </button>
              <button
                type="button"
                className={`${styles["productCategory-button"]} ${styles.cancel}`}
                onClick={resetForm}
                disabled={saving}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles["productCategory-button-new"]}
              onClick={handleNew}
            >
              Novo
            </button>
          )}
        </div>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>

      <table className={styles["productCategory-table"]}>
        <thead>
          <tr>
            <th>Nome da Cor</th>
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
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      backgroundColor: getColorHex(color.name),
                      border: '1px solid #ccc',
                      flexShrink: 0
                    }} 
                  />
                  {color.name}
                </div>
              </td>
              <td>
                <button onClick={() => handleEdit(color)}>
                  Editar
                </button>
                <button onClick={() => handleDelete(color.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {colors.length === 0 && (
            <tr>
              <td colSpan={2}>Nenhuma cor cadastrada</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Helper para mostrar uma prévia visual da cor
function getColorHex(colorName: string): string {
  const colorMap: { [key: string]: string } = {
    'branco': '#FFFFFF',
    'preto': '#000000',
    'azul': '#0066CC',
    'vermelho': '#CC0000',
    'verde': '#00CC00',
    'amarelo': '#FFCC00',
    'rosa': '#FF69B4',
    'roxo': '#8A2BE2',
    'laranja': '#FF8C00',
    'cinza': '#808080',
    'marrom': '#8B4513',
    'bege': '#F5F5DC',
    'vinho': '#722F37',
    'navy': '#000080',
    'turquesa': '#40E0D0'
  };

  const normalizedName = colorName.toLowerCase().trim();
  
  // Busca exata
  if (colorMap[normalizedName]) {
    return colorMap[normalizedName];
  }
  
  // Busca parcial
  for (const [key, value] of Object.entries(colorMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  // Cor padrão
  return '#CCCCCC';
}