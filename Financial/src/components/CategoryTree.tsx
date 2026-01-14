import React, { useState } from 'react';
import type { FinancialCategoryTreeNode } from '../types/financialCategory';
import type { FinancialCategoryDTO } from '../types/financialCategory';
import './CategoryTree.css';

interface CategoryTreeProps {
  categories: FinancialCategoryTreeNode[];
  onEdit: (category: FinancialCategoryDTO) => void;
  onDelete: (category: FinancialCategoryDTO) => void;
  onAddChild: (parent: FinancialCategoryDTO) => void;
}

interface TreeNodeProps {
  node: FinancialCategoryTreeNode;
  level: number;
  onEdit: (category: FinancialCategoryDTO) => void;
  onDelete: (category: FinancialCategoryDTO) => void;
  onAddChild: (parent: FinancialCategoryDTO) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, onEdit, onDelete, onAddChild }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    }
  };

  const categoryAsDTO: FinancialCategoryDTO = {
    id: node.id,
    tenantId: '',
    categoryCode: node.categoryCode,
    categoryName: node.categoryName,
    level: node.level,
    isActive: node.isActive,
    color: node.color,
    icon: node.icon,
    createdAt: '',
  };

  return (
    <div className="tree-node">
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
          className="node-color" 
          style={{ backgroundColor: node.color || '#94a3b8' }}
        />
        
        <span className="node-icon">{node.icon || '📁'}</span>
        
        <div className="node-info">
          <span className="node-code">{node.categoryCode}</span>
          <span className="node-name">{node.categoryName}</span>
        </div>
        
        {!node.isActive && (
          <span className="inactive-badge">Inativo</span>
        )}
        
        <div className="node-actions">
          <button 
            className="action-btn add"
            onClick={() => onAddChild(categoryAsDTO)}
            title="Adicionar subcategoria"
          >
            +
          </button>
          <button 
            className="action-btn edit"
            onClick={() => onEdit(categoryAsDTO)}
            title="Editar"
          >
            ✏️
          </button>
          {node.isActive && (
            <button 
              className="action-btn delete"
              onClick={() => onDelete(categoryAsDTO)}
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

const CategoryTree: React.FC<CategoryTreeProps> = ({ 
  categories, 
  onEdit, 
  onDelete, 
  onAddChild 
}) => {
  return (
    <div className="category-tree">
      {categories.map(category => (
        <TreeNode
          key={category.id}
          node={category}
          level={0}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
};

export default CategoryTree;
