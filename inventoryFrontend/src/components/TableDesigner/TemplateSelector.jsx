import React from 'react';
import { tableTemplates } from '../../config/tableTemplates';
import * as GiIcons from 'react-icons/gi';
import * as MdIcons from 'react-icons/md';

// Helper to get icon component
const getIcon = (iconName) => {
  if (GiIcons[iconName]) return GiIcons[iconName];
  if (MdIcons[iconName]) return MdIcons[iconName];
  return MdIcons.MdFolder;
};

const TemplateSelector = ({ onSelectTemplate, onCancel }) => {
  return (
    <div className="usd-panel p-6">
      <h2 className="text-2xl mb-4">Choose a Template</h2>
      <p className="usd-muted mb-6">
        Start with a pre-built template for common collectibles, or create a blank table from scratch.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tableTemplates.map((template) => {
          const Icon = getIcon(template.icon);
          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className="usd-panel border-2 border-gray-300 hover:usd-border-green hover:shadow-lg transition p-6 text-left rounded-lg"
            >
              <div className="flex items-start gap-4">
                <Icon className="text-4xl flex-shrink-0" style={{ color: 'var(--usd-copper)' }} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold usd-text-green mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm usd-muted">
                    {template.description}
                  </p>
                  {template.id !== 'blank' && (
                    <p className="text-xs usd-muted mt-2">
                      {template.fields.length} pre-configured fields
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={onCancel}
          className="usd-btn-copper px-6 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TemplateSelector;
