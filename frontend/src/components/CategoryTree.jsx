import { useState, useEffect } from 'react';

function TreeNode({ node, onEdit, onDelete, onAddChild, level = 0, initialExpanded = true }) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const hasChildren = node.children && node.children.length > 0;

  // Sync expanded state when search changes
  useEffect(() => {
    setIsExpanded(initialExpanded);
  }, [initialExpanded]);

  return (
    <div className="select-none">
      <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer group">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-6 h-6 flex items-center justify-center"
          style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
        >
          <span className="text-gray-600">{isExpanded ? '▼' : '▶'}</span>
        </button>

        {node.image ? (
          <img
            src={node.image}
            alt={node.name}
            className="w-14 h-14 object-cover rounded border border-gray-200"
          />
        ) : (
          <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
            <span className="text-gray-400 text-[10px] text-center px-1">No img</span>
          </div>
        )}

        <div
          className="flex-1 min-w-0"
          onClick={() => onEdit(node)}
        >
          <div className="text-sm font-medium text-gray-900 truncate">
            {node.name}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {node.slug}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            node.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {node.is_active ? 'Active' : 'Inactive'}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Edit
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node);
            }}
            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Add Child
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node);
            }}
            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div style={{ marginLeft: `${(level + 1) * 20}px` }}>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({ tree = [], onEdit, onDelete, onAddChild, isLoading = false }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filterTree = (nodes, term) => {
    if (!term) return nodes;

    return nodes.reduce((acc, node) => {
      const matches = node.name.toLowerCase().includes(term.toLowerCase()) ||
                     node.slug.toLowerCase().includes(term.toLowerCase());
      
      const filteredChildren = filterTree(node.children || [], term);
      
      if (matches || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren,
          // Force expand if it's a match or has matching children
          _isExpanded: true 
        });
      }
      return acc;
    }, []);
  };

  const filteredTree = filterTree(tree, searchTerm);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Category Hierarchy</h2>
      </div>

      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
        <input
          type="text"
          placeholder="Search hierarchy..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {tree.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-500 text-lg">No categories yet</p>
        </div>
      ) : filteredTree.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          No matches found for "{searchTerm}"
        </div>
      ) : (
        <div className="space-y-1 border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-[500px] overflow-y-auto">
          {filteredTree.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              initialExpanded={searchTerm !== ''}
            />
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500 mt-4">
        💡 Hover over items to see available actions
      </p>
    </div>
  );
}
