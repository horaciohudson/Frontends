import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Activity } from "../../models/Activity";
import api from "../../service/api";
import FormActivity from "./FormActivity";
import ListActivity from "./ListActivity";

export default function ActivityPage() {
  const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    api.get("/activities")
      .then(res => setActivities(res.data.content))
      .catch(err => console.error(t("activities.loadError"), err));
  }, [t]);

  const handleSave = async (activity: Activity) => {
    try {
      if (activity.id && activity.id !== 0) {
        const res = await api.put(`/activities/${activity.id}`, activity);
        setActivities(prev => prev.map(a => a.id === activity.id ? res.data : a));
      } else {
        const res = await api.post("/activities", activity);
        setActivities(prev => [...prev, res.data]);
      }
      setEditing(null);
    } catch (err) {
      console.error(t("activities.saveError"), err);
    }
  };

  const handleEdit = (activity: Activity) => setEditing(activity);
  const handleCancel = () => setEditing(null);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/activities/${id}`);
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(t("activities.deleteError"), err);
    }
  };

  const filteredActivities = activities.filter(a =>
    (a.name ?? "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{t("activities.title")}</h2>
      <input
        type="text"
        placeholder={t("activities.search")}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "300px" }}
      />
      <FormActivity
        activity={editing}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      <ListActivity
        activities={filteredActivities}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
