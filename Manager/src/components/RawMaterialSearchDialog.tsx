// src/components/RawMaterialSearchDialog.tsx
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../locales";
import { RawMaterial } from "../models/RawMaterial";
import api from "../service/api";
import styles from "../styles/components/ProductSearchDialog.module.css"; // Reuse same styles

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (rawMaterial: RawMaterial) => void;
};

export default function RawMaterialSearchDialog({ isOpen, onClose, onSelect }: Props) {
    const { t } = useTranslation([TRANSLATION_NAMESPACES.COMMERCIAL]);
    const [searchQuery, setSearchQuery] = useState("");
    const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadRawMaterials = useCallback(async (query: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.get("/raw-materials", {
                params: { q: query || undefined }
            });
            const data = response.data?.content || response.data || [];
            setRawMaterials(Array.isArray(data) ? data : []);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError("Erro ao carregar matérias primas");
            console.error("Error loading raw materials:", errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load raw materials only when dialog opens
    useEffect(() => {
        if (isOpen) {
            loadRawMaterials("");
            setSearchQuery("");
        }
    }, [isOpen, loadRawMaterials]);

    // Debounce search
    useEffect(() => {
        if (!isOpen) return;

        const timeoutId = setTimeout(() => {
            loadRawMaterials(searchQuery);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, isOpen, loadRawMaterials]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSelect = (rawMaterial: RawMaterial) => {
        onSelect(rawMaterial);
        onClose();
        setSearchQuery("");
    };

    const handleClose = () => {
        onClose();
        setSearchQuery("");
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Pesquisar Matéria Prima</h2>
                    <button className={styles.closeButton} onClick={handleClose}>
                        ✕
                    </button>
                </div>

                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Digite o nome ou referência da matéria prima..."
                        value={searchQuery}
                        onChange={handleSearch}
                        autoFocus
                    />
                </div>

                <div className={styles.content}>
                    {isLoading ? (
                        <p className={styles.message}>Carregando...</p>
                    ) : error ? (
                        <p className={styles.error}>{error}</p>
                    ) : rawMaterials.length === 0 ? (
                        <p className={styles.message}>Nenhuma matéria prima encontrada</p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Referência</th>
                                    <th>Grupo</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rawMaterials.map((rm) => (
                                    <tr
                                        key={rm.idRawMaterial}
                                        className={styles.row}
                                        onDoubleClick={() => handleSelect(rm)}
                                    >
                                        <td>{rm.idRawMaterial}</td>
                                        <td>{rm.name}</td>
                                        <td>{rm.reference || "-"}</td>
                                        <td>{rm.groupName || "-"}</td>
                                        <td>
                                            <button
                                                className={styles.selectButton}
                                                onClick={() => handleSelect(rm)}
                                            >
                                                Selecionar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
