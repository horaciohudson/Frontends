import React, { useState } from 'react';
import type { CostCenterTreeNode, CostCenterDTO } from '../types/costCenter';
import './CostCenterTree.css';

interface CostCenterTreeProps {
  costCenters: CostCenterTreeNode[];
  onEdit: (costCenter: CostCenterDTO) => void;
  onDelete: (costCenter: CostCenterDTO) => void;
  onAddChild: (parent: CostCenterDTO) => void;
}

interface TreeNodeProps {
  node: CostCenterTreeNode;
  level: number;
  onEdit: (costCenter: CostCenterDTO) => void;
  onDelete: (costCenter: CostCenterDTO) => void;
  onAddChild: (parent: CostCenterDTO) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, onEdit, onDelete, onAddChild }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    }
  };

  const costCenterAsDTO: CostCenterDTO = {
    id: node.id,
    tenantId: '',
    costCenterCode: node.costCenterCode,
    costCenterName: node.costCenterName,
    level: node.level,
    isActive: node.isActive,
    createdAt: '',
  };

  return (
    <div className="cost-center-tree-node">
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
        
        <span className="node-icon">🏢</span>
        
        <div className="node-info">
          <span className="node-code">{node.costCenterCode}</span>
          <span className="node-name">{node.costCenterName}</span>
          <span className="node-level">Nível {node.level}</span>
        </div>
        
        {!node.isActive && (
          <span className="inactive-badge">Inativo</span>
        )}
        
        <div className="node-actions">
          <button 
            className="action-btn add"
            onClick={() => onAddChild(costCenterAsDTO)}
            title="Adicionar sub-centro"
          >
            +
          </button>
          <button 
            className="action-btn edit"
            onClick={() => onEdit(costCenterAsDTO)}
            title="Editar"
          >
            ✏️
          </button>
          {node.isActive && (
            <button 
              className="action-btn delete"
              onClick={() => onDelete(costCenterAsDTO)}
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

const CostCenterTree: React.FC<CostCenterTreeProps> = ({ 
  costCenters, 
  onEdit, 
  onDelete, 
  onAddChild 
}) => {
  return (
    <div className="cost-center-tree">
      {costCenters.map(costCenter => (
        <TreeNode
          key={costCenter.id}
          node={costCenter}
          level={0}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
};

export default CostCenterTree;
