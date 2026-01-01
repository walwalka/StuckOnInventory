import React from 'react';
import moment from 'moment';
import { BiSolidMagicWand } from 'react-icons/bi';
import { BsQrCode } from 'react-icons/bs';

/**
 * Coins Entity Configuration
 * Defines the structure, validation, and display rules for coins
 */

export const coinsTableColumns = [
  {
    field: 'quantity',
    label: 'Quantity',
    hideOnMobile: true,
    defaultValue: 1,
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
    field: 'mintlocation',
    label: 'Mint Location',
    hideOnMobile: true,
  },
  {
    field: 'mintyear',
    label: 'Minted Year',
    hideOnMobile: true,
    render: (value) => (value ? moment.utc(value).format('YYYY') : '-'),
  },
  {
    field: 'circulation',
    label: 'Circulated',
    hideOnMobile: true,
  },
  {
    field: 'grade',
    label: 'Grade',
    hideOnMobile: true,
  },
  {
    field: 'face_value',
    label: 'Face Value',
    type: 'currency',
    hideOnMobile: true,
  },
  {
    field: 'estimated_value',
    label: 'Est. Value',
    type: 'currency',
    hideOnMobile: true,
  },
];

export const coinsFormFields = [
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    placeholder: 'Please Select a value',
    options: [], // Will be populated from API
  },
  {
    name: 'mintlocation',
    label: 'Mint Location',
    type: 'select',
    required: true,
    placeholder: 'Please Select a mint location',
    options: [], // Will be populated from API
  },
  {
    name: 'mintyear',
    label: 'Mint Year',
    type: 'select',
    required: true,
    placeholder: 'Select year',
    options: Array.from({ length: 400 }, (_, i) => 1700 + i),
    validate: (value) => {
      if (!/^\d{4}$/.test(value)) {
        return 'Enter a 4-digit year (e.g., 1999)';
      }
      return null;
    },
  },
  {
    name: 'circulation',
    label: 'Circulation',
    type: 'select',
    required: true,
    placeholder: 'Please Select a value',
    options: ['Yes', 'No', 'Unsure'],
  },
  {
    name: 'grade',
    label: 'Grade',
    type: 'text',
    required: true,
    placeholder: 'e.g., MS-65, AU-50, VF-20, Good-4',
  },
  {
    name: 'face_value',
    label: 'Face Value (USD)',
    type: 'number',
    step: '0.01',
    placeholder: 'Auto-filled from coin type',
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

// Custom actions for coins table
export const getCoinsCustomActions = (handleGetEstimate, estimating, handleQRClick) => [
  {
    onClick: (coin) => handleQRClick(coin),
    title: 'View QR Code',
    icon: (
      <BsQrCode
        className="text-xl"
        style={{ color: 'var(--usd-green)' }}
      />
    ),
  },
  {
    onClick: (coin) => handleGetEstimate(coin.id),
    disabled: (coin) => estimating[coin.id],
    title: 'Get AI value estimate',
    icon: (
      <BiSolidMagicWand
        className="text-xl"
        style={{ color: 'var(--usd-green)' }}
      />
    ),
  },
];
