import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Group } from "../../models/Group";
import { getGroups, createGroup, updateGroup, deleteGroup } from "../../service/Group";
import FormGroup from "./FormGroup";
import ListGroup from "./ListGroup";

export default function GroupPage() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  const [groups, setGroups] = useState<Group[]>([]);
  const [editing, setEditing] = useState<Group | null>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const groupsData = await getGroups();
      console.log("Groups loaded:", groupsData);
      setGroups(groupsData);
    } catch (err: any) {
      console.error(t("groups.loadError"), err);
      setError(t("groups.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [t]);

  const handleSave = async (group: Group) => {
    try {
      setError(null);
      console.log("Saving group:", group);
      
      if (group.id && group.id !== 0) {
        console.log("Updating group with ID:", group.id);
        const updated = await updateGroup(group.id, group);
        console.log("Update response:", updated);
        setGroups(prev => prev.map(g => g.id === group.id ? updated : g));
      } else {
        console.log("Creating new group");
        const { id, createdAt, updatedAt, ...groupData } = group;
        const created = await createGroup(groupData);
        console.log("Create response:", created);
        setGroups(prev => [...prev, created]);
      }
      setEditing(null);
    } catch (err: any) {
      console.error(t("groups.saveError"), err);
      setError(t("groups.saveError"));
      alert(`Erro ao salvar: ${err.message}`);
    }
  };

  const handleEdit = (group: Group) => setEditing(group);
  const handleCancel = () => setEditing(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este grupo?")) {
      return;
    }
    
    try {
      setError(null);
      console.log("Deleting group with ID:", id);
      await deleteGroup(id);
      setGroups(prev => prev.filter(g => g.id !== id));
    } catch (err: any) {
      console.error(t("groups.deleteError"), err);
      setError(t("groups.deleteError"));
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  const filteredGroups = groups.filter(g =>
    (g.name ?? "").toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: "2rem" }}>Carregando grupos...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{t("groups.title")}</h2>

      {error && (
        <div style={{ 
          color: "red", 
          backgroundColor: "#ffebee", 
          padding: "1rem", 
          marginBottom: "1rem", 
          borderRadius: "4px" 
        }}>
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder={t("groups.search")}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "300px" }}
      />
      
      <FormGroup
        group={editing}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      
      <ListGroup
        groups={filteredGroups}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
