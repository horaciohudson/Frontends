// src/pages/sales/SaleFormPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SaleService } from "../../service/Sale";
import { Sale, SaleCreateDTO } from "../../models/Sale";
import FormSale from "./FormSale";
import styles from "../../styles/sales/SaleFormPage.module.css";

export default function SaleFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [sale, setSale] = useState<Sale | null>(null);
    const [loading, setLoading] = useState(false);
    const isEditMode = !!id;

    // Load sale for editing
    useEffect(() => {
        if (isEditMode) {
            loadSale();
        }
    }, [id]);

    const loadSale = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const data = await SaleService.getById(id);
            setSale(data);
        } catch (err) {
            console.error("Error loading sale:", err);
            alert("Erro ao carregar venda. Redirecionando...");
            navigate("/comerciais/sales");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: SaleCreateDTO) => {
        try {
            setLoading(true);

            if (isEditMode && id) {
                await SaleService.update(id, data);
                alert("Venda atualizada com sucesso!");
            } else {
                await SaleService.create(data);
                alert("Venda criada com sucesso!");
            }

            navigate("/comerciais/sales");
        } catch (err) {
            console.error("Error saving sale:", err);
            alert("Erro ao salvar venda. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm("Tem certeza que deseja cancelar? As alterações não salvas serão perdidas.")) {
            navigate("/comerciais/sales");
        }
    };

    if (loading && isEditMode) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Carregando venda...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    {isEditMode ? "✏️ Editar Venda" : "➕ Nova Venda"}
                </h1>
            </div>

            <FormSale
                sale={sale}
                onSave={handleSave}
                onCancel={handleCancel}
                loading={loading}
            />
        </div>
    );
}
