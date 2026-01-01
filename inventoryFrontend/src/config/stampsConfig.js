import moment from 'moment';
import { BsQrCode } from 'react-icons/bs';

/**
 * Stamps Entity Configuration
 */

export const stampsTableColumns = [
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
    field: 'country',
    label: 'Country',
    bold: true,
  },
  {
    field: 'denomination',
    label: 'Denomination',
    hideOnMobile: true,
  },
  {
    field: 'issueyear',
    label: 'Issue Year',
    hideOnMobile: true,
  },
  {
    field: 'condition',
    label: 'Condition',
    hideOnMobile: true,
  },
];

export const stampsFormFields = [
  {
    name: 'country',
    label: 'Country',
    type: 'text',
    required: true,
    placeholder: 'e.g., USA, Canada, etc.',
  },
  {
    name: 'denomination',
    label: 'Denomination',
    type: 'text',
    required: true,
    placeholder: 'e.g., 5¢, 10¢, $1, etc.',
  },
  {
    name: 'issueyear',
    label: 'Issue Year',
    type: 'text',
    required: true,
    placeholder: 'e.g., 1999, 2000-2005, etc.',
  },
  {
    name: 'condition',
    label: 'Condition',
    type: 'select',
    required: true,
    options: ['Mint', 'Excellent', 'Good', 'Fair', 'Poor'],
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 4,
    placeholder: 'Additional details about the stamp...',
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

// Custom actions for stamps table
export const getStampsCustomActions = (handleQRClick) => [
  {
    onClick: (stamp) => handleQRClick(stamp),
    title: 'View QR Code',
    icon: (
      <BsQrCode
        className="text-xl"
        style={{ color: 'var(--usd-green)' }}
      />
    ),
  },
];
