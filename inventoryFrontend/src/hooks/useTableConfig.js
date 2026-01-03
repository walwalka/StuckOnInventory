import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import moment from 'moment';

/**
 * Hook to fetch and transform table configuration
 * @param {string} tableName - Table name (without custom_data_ prefix)
 * @returns {Object} - React Query result with transformed config
 */
export const useTableConfig = (tableName) => {
  return useQuery({
    queryKey: ['tableConfig', tableName],
    queryFn: async () => {
      const { data } = await api.get(`/tables/${tableName}/definition`);

      // Transform fields to table columns format
      const tableColumns = data.fields
        .filter(f => f.show_in_table)
        .map(field => {
          const column = {
            field: field.field_name,
            label: field.field_label,
            hideOnMobile: !field.show_in_mobile,
            bold: field.is_bold
          };

          // Add type-specific formatting
          if (field.field_type === 'currency') {
            column.type = 'currency';
            column.render = (value) => {
              if (value === null || value === undefined) return '-';
              return `$${parseFloat(value).toFixed(2)}`;
            };
          } else if (field.field_type === 'date') {
            column.type = 'date';
            column.format = 'MM/DD/YYYY';
            column.render = (value) => {
              if (!value) return '-';
              return moment.utc(value).format('MM/DD/YYYY');
            };
          } else if (field.field_type === 'month-year') {
            column.type = 'date';
            column.format = 'MM/YYYY';
            column.render = (value) => {
              if (!value) return '-';
              return moment.utc(value).format('MM/YYYY');
            };
          }

          return column;
        });

      // Add standard columns
      tableColumns.push({
        field: 'quantity',
        label: 'Quantity',
        type: 'number',
        hideOnMobile: false
      });

      tableColumns.push({
        field: 'added_date',
        label: 'Date Added',
        type: 'date',
        format: 'MM/DD/YYYY',
        hideOnMobile: true,
        render: (value) => {
          if (!value) return '-';
          return moment.utc(value).format('MM/DD/YYYY');
        }
      });

      // Transform fields to form fields format
      const formFields = await Promise.all(data.fields.map(async (field) => {
        const formField = {
          name: field.field_name,
          label: field.field_label,
          type: field.field_type,
          required: field.is_required,
          placeholder: field.placeholder || `Enter ${field.field_label}`
        };

        // If field has lookup_table_name, fetch lookup values dynamically
        if (field.lookup_table_name && field.field_type === 'select') {
          try {
            const lookupResponse = await api.get(`/tables/lookups/${field.lookup_table_name}`);
            const lookupValues = lookupResponse.data.values;

            // Extract display value from value_data
            // Prefer 'name' field if it exists, otherwise use first key
            formField.options = lookupValues.map(val => {
              const displayValue = val.value_data.name || val.value_data[Object.keys(val.value_data)[0]];
              return {
                value: displayValue,
                label: displayValue,
                data: val.value_data // Preserve full data for auto-population
              };
            });

            // Store lookup table name for later use
            formField.lookupTableName = field.lookup_table_name;
          } catch (error) {
            console.error(`Failed to fetch lookup values for ${field.lookup_table_name}`, error);
            formField.options = [];
          }
        }
        // Fallback to hardcoded options from field definition
        else if (field.options) {
          try {
            formField.options = typeof field.options === 'string'
              ? JSON.parse(field.options)
              : field.options;
          } catch (e) {
            formField.options = [];
          }
        }

        // Add help text if present
        if (field.help_text) {
          formField.helpText = field.help_text;
        }

        // Add validation rules if present
        if (field.validation_rules) {
          try {
            const rules = typeof field.validation_rules === 'string'
              ? JSON.parse(field.validation_rules)
              : field.validation_rules;

            if (rules.min !== undefined) formField.min = rules.min;
            if (rules.max !== undefined) formField.max = rules.max;
            if (rules.pattern !== undefined) formField.pattern = rules.pattern;
          } catch (e) {
            console.warn('Failed to parse validation rules:', e);
          }
        }

        // Handle textarea specific settings
        if (field.field_type === 'textarea') {
          formField.rows = 4;
        }

        // Handle number/currency specific settings
        if (field.field_type === 'number' || field.field_type === 'currency') {
          formField.step = field.field_type === 'currency' ? '0.01' : '1';
        }

        return formField;
      }));

      return {
        table: data.table,
        tableColumns,
        formFields
      };
    },
    enabled: !!tableName
  });
};
