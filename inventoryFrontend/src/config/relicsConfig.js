import moment from 'moment';
import { BsQrCode } from 'react-icons/bs';

/**
 * Relics Entity Configuration
 */

export const relicsTableColumns = [
  {
    field: 'quantity',
    label: 'Quantity',
    hideOnMobile: false,
  },
  {
    field: 'added_date',
    label: 'Added Date',
    type: 'date',
    format: 'MM/DD/YYYY',
    hideOnMobile: true,
  },
  {
    field: 'image1',
    label: 'Image',
    type: 'image',
  },
  {
    field: 'type',
    label: 'Type',
    bold: true,
  },
  {
    field: 'origin',
    label: 'Origin',
    hideOnMobile: true,
  },
  {
    field: 'era',
    label: 'Era',
    hideOnMobile: true,
  },
  {
    field: 'condition',
    label: 'Condition',
    hideOnMobile: true,
  },
];

export const relicsFormFields = [
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [], // Will be populated from API
  },
  {
    name: 'origin',
    label: 'Origin',
    type: 'text',
    required: true,
    placeholder: 'e.g., Cherokee, Navajo, etc.',
  },
  {
    name: 'era',
    label: 'Era',
    type: 'text',
    required: true,
    placeholder: 'e.g., Pre-Columbian, Colonial, etc.',
  },
  {
    name: 'condition',
    label: 'Condition',
    type: 'select',
    required: true,
    options: ['Excellent', 'Good', 'Fair', 'Poor'],
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 4,
    placeholder: 'Additional details about the relic...',
  },
  {
    name: 'quantity',
    label: 'Quantity',
    type: 'number',
    required: true,
    min: '1',
    placeholder: 'Number of items',
  },
];

// Custom actions for relics table
export const getRelicsCustomActions = (handleQRClick) => [
  {
    onClick: (relic) => handleQRClick(relic),
    title: 'View QR Code',
    icon: (
      <BsQrCode
        className="text-xl"
        style={{ color: 'var(--usd-green)' }}
      />
    ),
  },
];
