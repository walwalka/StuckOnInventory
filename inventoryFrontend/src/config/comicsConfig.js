import moment from 'moment';
import { BsQrCode } from 'react-icons/bs';

/**
 * Comics Entity Configuration
 */

export const comicsTableColumns = [
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
    field: 'title',
    label: 'Title',
    bold: true,
  },
  {
    field: 'publisher',
    label: 'Publisher',
    hideOnMobile: true,
  },
  {
    field: 'series',
    label: 'Series',
    hideOnMobile: true,
  },
  {
    field: 'issuenumber',
    label: 'Issue Number',
    hideOnMobile: true,
  },
  {
    field: 'publicationyear',
    label: 'Publication Year',
    hideOnMobile: true,
  },
  {
    field: 'grade',
    label: 'Grade',
    hideOnMobile: true,
  },
  {
    field: 'condition',
    label: 'Condition',
    hideOnMobile: true,
  },
];

export const comicsFormFields = [
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    placeholder: 'e.g., The Amazing Spider-Man',
  },
  {
    name: 'publisher',
    label: 'Publisher',
    type: 'select',
    required: true,
    options: [], // Will be populated from API
  },
  {
    name: 'series',
    label: 'Series',
    type: 'text',
    required: true,
    placeholder: 'e.g., Volume 1, Vol. 2, etc.',
  },
  {
    name: 'issuenumber',
    label: 'Issue Number',
    type: 'text',
    required: true,
    placeholder: 'e.g., #1, #300, Annual #1',
  },
  {
    name: 'publicationyear',
    label: 'Publication Year',
    type: 'text',
    required: true,
    placeholder: 'e.g., 1962, 2023',
  },
  {
    name: 'grade',
    label: 'Grade',
    type: 'select',
    required: true,
    options: [
      'CGC 10.0 - Gem Mint',
      'CGC 9.9 - Mint',
      'CGC 9.8 - Near Mint/Mint',
      'CGC 9.6 - Near Mint+',
      'CGC 9.4 - Near Mint',
      'CGC 9.2 - Near Mint-',
      'CGC 9.0 - Very Fine/Near Mint',
      'CGC 8.5 - Very Fine+',
      'CGC 8.0 - Very Fine',
      'CGC 7.5 - Very Fine-',
      'CGC 7.0 - Fine/Very Fine',
      'CGC 6.5 - Fine+',
      'CGC 6.0 - Fine',
      'Ungraded',
    ],
  },
  {
    name: 'condition',
    label: 'Condition',
    type: 'select',
    required: true,
    options: ['Mint', 'Near Mint', 'Very Fine', 'Fine', 'Very Good', 'Good', 'Fair', 'Poor'],
  },
  {
    name: 'variant',
    label: 'Variant',
    type: 'text',
    placeholder: 'e.g., Variant Cover A, Retailer Exclusive, etc.',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 4,
    placeholder: 'Additional details about the comic...',
  },
  {
    name: 'quantity',
    label: 'Quantity',
    type: 'number',
    min: '1',
    placeholder: '1',
  },
];

// Custom actions for comics table
export const getComicsCustomActions = (handleQRClick) => [
  {
    onClick: (comic) => handleQRClick(comic),
    title: 'View QR Code',
    icon: (
      <BsQrCode
        className="text-xl"
        style={{ color: 'var(--usd-green)' }}
      />
    ),
  },
];
