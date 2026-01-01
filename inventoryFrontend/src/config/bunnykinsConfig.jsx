import React from 'react';
import moment from 'moment';
import { BsQrCode } from 'react-icons/bs';

/**
 * Bunnykins Entity Configuration
 */

export const bunnykinsTableColumns = [
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
    field: 'name',
    label: 'Name',
    bold: true,
  },
  {
    field: 'series',
    label: 'Series',
    hideOnMobile: true,
  },
  {
    field: 'productionyear',
    label: 'Production Year',
    hideOnMobile: true,
  },
  {
    field: 'condition',
    label: 'Condition',
    hideOnMobile: true,
  },
];

export const bunnykinsFormFields = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Teacher Bunnykins, etc.',
  },
  {
    name: 'series',
    label: 'Series',
    type: 'text',
    required: true,
    placeholder: 'e.g., Royal Doulton, Bunnykins Series 1, etc.',
  },
  {
    name: 'productionyear',
    label: 'Production Year',
    type: 'text',
    required: true,
    placeholder: 'e.g., 1990, 1985-1995, etc.',
  },
  {
    name: 'condition',
    label: 'Condition',
    type: 'select',
    required: true,
    options: ['Mint in Box', 'Mint', 'Excellent', 'Good', 'Fair', 'Damaged'],
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 4,
    placeholder: 'Additional details about the Bunnykins figurine...',
  },
  {
    name: 'quantity',
    label: 'Quantity',
    type: 'number',
    min: '1',
    placeholder: '1',
  },
];

// Custom actions for bunnykins table
export const getBunnykinsCustomActions = (handleQRClick) => [
  {
    onClick: (bunnykin) => handleQRClick(bunnykin),
    title: 'View QR Code',
    icon: (
      <BsQrCode
        className="text-xl"
        style={{ color: 'var(--usd-green)' }}
      />
    ),
  },
];
