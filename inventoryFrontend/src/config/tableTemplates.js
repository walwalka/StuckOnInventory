/**
 * Pre-defined table templates for common collectible types
 * Users can start with these templates and customize them
 */

export const tableTemplates = [
  {
    id: 'blank',
    name: 'Blank Table',
    description: 'Start from scratch with no pre-defined fields',
    icon: 'MdTableChart',
    table: {
      table_name: '',
      display_name: '',
      description: '',
      icon: 'MdFolder',
      is_shared: false
    },
    fields: []
  },
  {
    id: 'coins',
    name: 'Coin Collection',
    description: 'Track coins with type, mint, year, circulation, grade, and value',
    icon: 'GiCoins',
    table: {
      table_name: 'coins',
      display_name: 'Coin Inventory',
      description: 'My coin collection',
      icon: 'GiCoins',
      is_shared: false
    },
    fields: [
      {
        field_name: 'type',
        field_label: 'Type',
        field_type: 'select',
        is_required: true,
        placeholder: 'Select coin type',
        lookup_table_id: 'lookup_cointypes',
        show_in_table: true,
        show_in_mobile: true,
        is_bold: true,
        help_text: 'The type or denomination of the coin',
        display_order: 0
      },
      {
        field_name: 'mintlocation',
        field_label: 'Mint Location',
        field_type: 'select',
        is_required: true,
        placeholder: 'Select mint location',
        lookup_table_id: 'lookup_mintlocations',
        show_in_table: true,
        show_in_mobile: true,
        is_bold: false,
        help_text: 'Where the coin was minted',
        display_order: 1
      },
      {
        field_name: 'mintyear',
        field_label: 'Mint Year',
        field_type: 'date',
        is_required: true,
        placeholder: 'Select year',
        show_in_table: true,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Year the coin was minted',
        display_order: 2
      },
      {
        field_name: 'circulation',
        field_label: 'Circulation',
        field_type: 'text',
        is_required: true,
        placeholder: 'e.g., Circulated, Uncirculated',
        show_in_table: true,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Circulation status',
        display_order: 3
      },
      {
        field_name: 'grade',
        field_label: 'Grade',
        field_type: 'select',
        is_required: true,
        placeholder: 'Select grade',
        options: ['Poor', 'Fair', 'Good', 'Very Good', 'Fine', 'Very Fine', 'Extremely Fine', 'About Uncirculated', 'Uncirculated', 'Proof'],
        show_in_table: true,
        show_in_mobile: true,
        is_bold: false,
        help_text: 'Coin grade/condition',
        display_order: 4
      },
      {
        field_name: 'face_value',
        field_label: 'Face Value',
        field_type: 'currency',
        is_required: false,
        placeholder: '0.00',
        show_in_table: true,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Original face value of the coin',
        display_order: 5
      },
      {
        field_name: 'estimated_value',
        field_label: 'Estimated Value',
        field_type: 'currency',
        is_required: false,
        placeholder: '0.00',
        show_in_table: true,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Current estimated market value',
        display_order: 6
      }
    ]
  },
  {
    id: 'comics',
    name: 'Comic Book Collection',
    description: 'Organize comics by title, series, issue, publisher, grade, and condition',
    icon: 'GiBookCover',
    table: {
      table_name: 'comics',
      display_name: 'Comic Book Inventory',
      description: 'My comic book collection',
      icon: 'GiBookCover',
      is_shared: false
    },
    fields: [
      {
        field_name: 'title',
        field_label: 'Title',
        field_type: 'text',
        is_required: true,
        placeholder: 'e.g., Amazing Spider-Man',
        show_in_table: true,
        show_in_mobile: true,
        is_bold: true,
        help_text: 'Comic book title',
        display_order: 0
      },
      {
        field_name: 'publisher',
        field_label: 'Publisher',
        field_type: 'select',
        is_required: true,
        placeholder: 'Select publisher',
        lookup_table_id: 'lookup_comicpublishers',
        show_in_table: true,
        show_in_mobile: true,
        is_bold: false,
        help_text: 'Publishing company',
        display_order: 1
      },
      {
        field_name: 'series',
        field_label: 'Series',
        field_type: 'text',
        is_required: true,
        placeholder: 'e.g., Vol 1, Vol 2',
        show_in_table: true,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Series or volume',
        display_order: 2
      },
      {
        field_name: 'issuenumber',
        field_label: 'Issue Number',
        field_type: 'text',
        is_required: true,
        placeholder: 'e.g., #1, #252',
        show_in_table: true,
        show_in_mobile: true,
        is_bold: false,
        help_text: 'Issue number',
        display_order: 3
      },
      {
        field_name: 'publicationyear',
        field_label: 'Publication Year',
        field_type: 'text',
        is_required: true,
        placeholder: 'e.g., 1962',
        show_in_table: true,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Year published',
        display_order: 4
      },
      {
        field_name: 'grade',
        field_label: 'Grade',
        field_type: 'text',
        is_required: true,
        placeholder: 'e.g., 9.8, CGC 9.6',
        show_in_table: true,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Professional grade (CGC, CBCS, etc.)',
        display_order: 5
      },
      {
        field_name: 'condition',
        field_label: 'Condition',
        field_type: 'select',
        is_required: true,
        placeholder: 'Select condition',
        options: ['Poor', 'Fair', 'Good', 'Very Good', 'Fine', 'Very Fine', 'Near Mint', 'Mint'],
        show_in_table: true,
        show_in_mobile: true,
        is_bold: false,
        help_text: 'Physical condition',
        display_order: 6
      },
      {
        field_name: 'variant',
        field_label: 'Variant',
        field_type: 'text',
        is_required: false,
        placeholder: 'e.g., Variant Cover A, Incentive 1:25',
        show_in_table: false,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Cover variant or special edition',
        display_order: 7
      },
      {
        field_name: 'description',
        field_label: 'Description',
        field_type: 'textarea',
        is_required: false,
        placeholder: 'Additional notes',
        show_in_table: false,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Additional information',
        display_order: 8
      }
    ]
  },
  {
    id: 'stamps',
    name: 'Stamp Collection',
    description: 'Catalog stamps by country, denomination, issue year, and condition',
    icon: 'GiStamper',
    table: {
      table_name: 'stamps',
      display_name: 'Stamp Inventory',
      description: 'My stamp collection',
      icon: 'GiStamper',
      is_shared: false
    },
    fields: [
      {
        field_name: 'country',
        field_label: 'Country',
        field_type: 'select',
        is_required: true,
        placeholder: 'Select country',
        lookup_table_id: 'lookup_countries',
        show_in_table: true,
        show_in_mobile: true,
        is_bold: true,
        help_text: 'Country of origin',
        display_order: 0
      },
      {
        field_name: 'denomination',
        field_label: 'Denomination',
        field_type: 'text',
        is_required: true,
        placeholder: 'e.g., 5¢, $1',
        show_in_table: true,
        show_in_mobile: true,
        is_bold: false,
        help_text: 'Face value denomination',
        display_order: 1
      },
      {
        field_name: 'issueyear',
        field_label: 'Issue Year',
        field_type: 'text',
        is_required: true,
        placeholder: 'e.g., 1945',
        show_in_table: true,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Year issued',
        display_order: 2
      },
      {
        field_name: 'condition',
        field_label: 'Condition',
        field_type: 'select',
        is_required: true,
        placeholder: 'Select condition',
        options: ['Poor', 'Fair', 'Good', 'Very Good', 'Fine', 'Very Fine', 'Extremely Fine', 'Superb', 'Mint'],
        show_in_table: true,
        show_in_mobile: true,
        is_bold: false,
        help_text: 'Physical condition',
        display_order: 3
      },
      {
        field_name: 'description',
        field_label: 'Description',
        field_type: 'textarea',
        is_required: false,
        placeholder: 'e.g., Victory Issue, Commemorative series',
        show_in_table: false,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Additional information',
        display_order: 4
      }
    ]
  },
  {
    id: 'relics',
    name: 'Historical Relics',
    description: 'Document historical artifacts by type, origin, era, and condition',
    icon: 'GiAncientColumns',
    table: {
      table_name: 'relics',
      display_name: 'Historical Relics',
      description: 'My historical relic collection',
      icon: 'GiAncientColumns',
      is_shared: false
    },
    fields: [
      {
        field_name: 'type',
        field_label: 'Type',
        field_type: 'select',
        is_required: true,
        placeholder: 'Select relic type',
        lookup_table_id: 'lookup_relictypes',
        show_in_table: true,
        show_in_mobile: true,
        is_bold: true,
        help_text: 'Type or category of relic',
        display_order: 0
      },
      {
        field_name: 'origin',
        field_label: 'Origin',
        field_type: 'text',
        is_required: true,
        placeholder: 'e.g., Ancient Rome, Medieval Europe',
        show_in_table: true,
        show_in_mobile: true,
        is_bold: false,
        help_text: 'Historical origin or culture',
        display_order: 1
      },
      {
        field_name: 'era',
        field_label: 'Era',
        field_type: 'text',
        is_required: true,
        placeholder: 'e.g., Bronze Age, Medieval',
        show_in_table: true,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Historical era or time period',
        display_order: 2
      },
      {
        field_name: 'condition',
        field_label: 'Condition',
        field_type: 'select',
        is_required: true,
        placeholder: 'Select condition',
        options: ['Fragments', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent', 'Pristine'],
        show_in_table: true,
        show_in_mobile: true,
        is_bold: false,
        help_text: 'Current physical condition',
        display_order: 3
      },
      {
        field_name: 'description',
        field_label: 'Description',
        field_type: 'textarea',
        is_required: false,
        placeholder: 'Detailed description and provenance',
        show_in_table: false,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Additional information',
        display_order: 4
      }
    ]
  },
  {
    id: 'bunnykins',
    name: 'Bunnykins Collection',
    description: 'Track Royal Doulton Bunnykins by name, series, production year, and condition',
    icon: 'GiRabbit',
    table: {
      table_name: 'bunnykins',
      display_name: 'Bunnykins Collection',
      description: 'My Bunnykins figurine collection',
      icon: 'GiRabbit',
      is_shared: false
    },
    fields: [
      {
        field_name: 'name',
        field_label: 'Name',
        field_type: 'text',
        is_required: true,
        placeholder: 'e.g., Bathtime Bunnykins',
        show_in_table: true,
        show_in_mobile: true,
        is_bold: true,
        help_text: 'Official name of the figurine',
        display_order: 0
      },
      {
        field_name: 'series',
        field_label: 'Series',
        field_type: 'text',
        is_required: true,
        placeholder: 'e.g., DB Series, Limited Edition',
        show_in_table: true,
        show_in_mobile: true,
        is_bold: false,
        help_text: 'Royal Doulton series',
        display_order: 1
      },
      {
        field_name: 'productionyear',
        field_label: 'Production Year',
        field_type: 'text',
        is_required: true,
        placeholder: 'e.g., 1984',
        show_in_table: true,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Year first produced',
        display_order: 2
      },
      {
        field_name: 'condition',
        field_label: 'Condition',
        field_type: 'select',
        is_required: true,
        placeholder: 'Select condition',
        options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent', 'Mint in Box'],
        show_in_table: true,
        show_in_mobile: true,
        is_bold: false,
        help_text: 'Current condition',
        display_order: 3
      },
      {
        field_name: 'description',
        field_label: 'Description',
        field_type: 'textarea',
        is_required: false,
        placeholder: 'Additional details about this figurine',
        show_in_table: false,
        show_in_mobile: false,
        is_bold: false,
        help_text: 'Additional information',
        display_order: 4
      }
    ]
  }
];

/**
 * Get template by ID
 */
export const getTemplateById = (id) => {
  return tableTemplates.find(t => t.id === id);
};

/**
 * Get all template options for selector
 */
export const getTemplateOptions = () => {
  return tableTemplates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    icon: t.icon
  }));
};
