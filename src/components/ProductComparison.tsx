// Define columns to compare
  const columns = [
    // Price
    {
      id: 'price',
      header: 'Price',
      render: (product: Product) => `$${(product as any).price?.toFixed(2) || '0.00'}`
    },
    // Material
    {
      id: 'material',
      header: 'Material',
      render: (product: Product) => (product as any).material || 'N/A'
    },
    // Light Control
    {
      id: 'lightControl',
      header: 'Light Control',
      render: (product: Product) => (product as any).lightControl || 'N/A'
    },
    // Slat Sizes
    {
      id: 'slatSizes',
      header: 'Slat Sizes',
      render: (product: Product) => (product as any).slatSizes?.join(', ') || 'N/A'
    },
    // Mount Types
    {
      id: 'mountTypes',
      header: 'Mount Types',
      render: (product: Product) => (product as any).mountTypes?.join(', ') || 'Inside, Outside'
    },
    // Control Type
    {
      id: 'controlType',
      header: 'Control Type',
      render: (product: Product) => (product as any).controlType || 'Standard'
    },
    // Min Width
    {
      id: 'minWidth',
      header: 'Min Width',
      render: (product: Product) => (product as any).minWidth ? `${(product as any).minWidth}"` : 'N/A'
    },
    // Max Width
    {
      id: 'maxWidth',
      header: 'Max Width',
      render: (product: Product) => (product as any).maxWidth ? `${(product as any).maxWidth}"` : 'N/A'
    },
    // Energy Efficiency
    {
      id: 'energyEfficiency',
      header: 'Energy Efficiency',
      render: (product: Product) => (product as any).energyEfficiency || 'Standard'
    },
    // Availability
    {
      id: 'availability',
      header: 'Availability',
      render: () => 'In Stock'
    }
  ];
