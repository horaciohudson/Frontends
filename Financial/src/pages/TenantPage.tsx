import React, { useState, useEffect } from 'react';
import TenantForm from '../components/forms/tenant/TenantForm';
import { tenantService } from '../services/tenantService';
import type { Tenant } from '../services/tenantService';
import '../styles/pages/TenantPage.css';

const TenantPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carregar tenants do backend
  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantService.getAllTenants();
      setTenants(data);
    } catch (error) {
      console.error('Erro ao carregar tenants:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao carregar Sistemas Clientes. Verifique se o backend está rodando.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: { code: string; name: string; status: string }) => {
    try {
      setLoading(true);
      setMessage(null);

      if (editingTenant) {
        // Atualizar tenant existente
        const updatedTenant = await tenantService.updateTenant(editingTenant.id, {
          name: formData.name,
          status: formData.status
        });
        setTenants(prev => prev.map(t => t.id === editingTenant.id ? updatedTenant : t));
        setMessage({ type: 'success', text: 'Sistema Cliente atualizado com sucesso!' });
      } else {
        // Criar novo tenant
        const newTenant = await tenantService.createTenant(formData);
        setTenants(prev => [...prev, newTenant]);
        setMessage({ type: 'success', text: 'Sistema Cliente criado com sucesso!' });
      }

      setShowForm(false);
      setEditingTenant(null);
    } catch (error) {
      console.error('Erro ao salvar Sistema Cliente:', error);
      setMessage({
        type: 'error',
        text: editingTenant ? 'Erro ao atualizar Sistema Cliente' : 'Erro ao salvar Sistema Cliente'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setShowForm(true);
  };

  const handleDelete = async (tenant: Tenant) => {
    if (window.confirm(`Tem certeza que deseja excluir o tenant "${tenant.name}"?`)) {
      try {
        setLoading(true);
        await tenantService.deleteTenant(tenant.id);
        setTenants(prev => prev.filter(t => t.id !== tenant.id));
        setMessage({ type: 'success', text: 'Sistema Cliente excluído com sucesso!' });
      } catch (error) {
        console.error('Erro ao excluir Sistema Cliente:', error);
        setMessage({ type: 'error', text: 'Erro ao excluir Sistema Cliente' });
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap = {
      'ACTIVE': 'Ativo',
      'INACTIVE': 'Inativo',
      'BLOCKED': 'Bloqueado'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusBadge = (status: string) => {
    const statusClass = {
      'ACTIVE': 'status-active',
      'INACTIVE': 'status-inactive',
      'BLOCKED': 'status-suspended'
    };

    return (
      <span className={`status-badge ${statusClass[status as keyof typeof statusClass] || 'status-inactive'}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="tenant-page">
      <div className="tenant-page-header">
        <h1 className="tenant-page-title">Gerenciamento de Sistema Cliente</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          Novo Sistema Cliente
        </button>
      </div>

      {message && (
        <div className={`tenant-page-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <TenantForm
          initialData={editingTenant ? {
            code: editingTenant.code,
            name: editingTenant.name,
            status: editingTenant.status
          } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTenant(null);
            setMessage(null);
          }}
          loading={loading}
          isEditing={!!editingTenant}
        />
      )}

      <div className="tenant-page-content">
        <div className="tenant-table-header">
          <h2>Sistemas Clientes Cadastrados</h2>
          <span className="tenant-count">{tenants.length} registro(s)</span>
        </div>

        {loading && !showForm ? (
          <div className="loading-message">Carregando tenants...</div>
        ) : (
          <div className="tenant-table">
            {tenants.length === 0 ? (
              <div className="empty-message">Nenhum sistema cliente cadastrado</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Status</th>
                    <th>Criado em</th>
                    <th>Criado por</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(tenant => (
                    <tr key={tenant.id}>
                      <td>{tenant.code}</td>
                      <td>{tenant.name}</td>
                      <td>{getStatusBadge(tenant.status)}</td>
                      <td>{formatDate(tenant.createdAt)}</td>
                      <td>{tenant.createdBy}</td>
                      <td className="actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(tenant)}
                          disabled={loading}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(tenant)}
                          disabled={loading}
                        >
                          🗑️ Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantPage;