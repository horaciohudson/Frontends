import React, { useState } from 'react';
import type { LedgerAccountTreeNode, LedgerAccountDTO } from '../types/ledgerAccount';
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_COLORS } from '../types/ledgerAccount';
import './LedgerAccountTree.css';

interface LedgerAccountTreeProps {
  accounts: LedgerAccountTreeNode[];
  onEdit: (account: LedgerAccountDTO) => void;
  onDelete: (account: LedgerAccountDTO) => void;
  onAddChild: (parent: LedgerAccountDTO) => void;
}

interface TreeNodeProps {
  node: LedgerAccountTreeNode;
  level: number;
  onEdit: (account: LedgerAccountDTO) => void;
  onDelete: (account: LedgerAccountDTO) => void;
  onAddChild: (parent: LedgerAccountDTO) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, onEdit, onDelete, onAddChild }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    }
  };

  const accountAsDTO: LedgerAccountDTO = {
    id: node.id,
    tenantId: '',
    accountCode: node.accountCode,
    accountName: node.accountName,
    accountType: node.accountType,
    level: node.level,
    isActive: node.isActive,
    createdAt: '',
  };

  return (
    <div className="ledger-account-tree-node">
      <div 
        className={`node-content ${!node.isActive ? 'inactive' : ''}`}
        style={{ paddingLeft: `${level * 24}px` }}
      >
        <button 
          className={`expand-btn ${hasChildren ? 'has-children' : ''}`}
          onClick={handleToggle}
        >
          {hasChildren ? (expanded ? '▼' : '▶') : '•'}
        </button>
        
        <div 
          className="account-type-badge"
          style={{ backgroundColor: ACCOUNT_TYPE_COLORS[node.accountType] }}
          title={ACCOUNT_TYPE_LABELS[node.accountType]}
        >
          {node.accountType.charAt(0)}
        </div>
        
        <div className="node-info">
          <span className="node-code">{node.accountCode}</span>
          <span className="node-name">{node.accountName}</span>
          <span 
            className="node-type"
            style={{ color: ACCOUNT_TYPE_COLORS[node.accountType] }}
          >
            {ACCOUNT_TYPE_LABELS[node.accountType]}
          </span>
        </div>
        
        {!node.isActive && (
          <span className="inactive-badge">Inativo</span>
        )}
        
        <div className="node-actions">
          <button 
            className="action-btn add"
            onClick={() => onAddChild(accountAsDTO)}
            title="Adicionar subconta"
          >
            +
          </button>
          <button 
            className="action-btn edit"
            onClick={() => onEdit(accountAsDTO)}
            title="Editar"
          >
            ✏️
          </button>
          {node.isActive && (
            <button 
              className="action-btn delete"
              onClick={() => onDelete(accountAsDTO)}
              title="Desativar"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      
      {hasChildren && expanded && (
        <div className="node-children">
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const LedgerAccountTree: React.FC<LedgerAccountTreeProps> = ({ 
  accounts, 
  onEdit, 
  onDelete, 
  onAddChild 
}) => {
  return (
    <div className="ledger-account-tree">
      {accounts.map(account => (
        <TreeNode
          key={account.id}
          node={account}
          level={0}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
};

export default LedgerAccountTree;
