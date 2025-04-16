/**
 * PostgreSQL schema and queries for bulk_uploads table
 * This tracks and manages bulk product uploads via CSV/Excel
 */

// Table creation SQL for bulk uploads
const createBulkUploadTableSQL = `
CREATE TABLE IF NOT EXISTS bulk_uploads (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES users(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  upload_type VARCHAR(50) NOT NULL, -- products, inventory, prices, etc.
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  successful_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  results JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bulk_uploads_vendor ON bulk_uploads(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bulk_uploads_user ON bulk_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_uploads_status ON bulk_uploads(status);
CREATE INDEX IF NOT EXISTS idx_bulk_uploads_type ON bulk_uploads(upload_type);
`;

// Table creation SQL for bulk upload errors
const createBulkUploadErrorsTableSQL = `
CREATE TABLE IF NOT EXISTS bulk_upload_errors (
  id SERIAL PRIMARY KEY,
  upload_id INTEGER NOT NULL REFERENCES bulk_uploads(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  column_name VARCHAR(255),
  error_message TEXT NOT NULL,
  row_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bulk_upload_errors_upload ON bulk_upload_errors(upload_id);
`;

// Create a new bulk upload entry
const createBulkUploadSQL = `
INSERT INTO bulk_uploads (
  vendor_id, user_id, filename, file_path, file_size, mime_type, status, upload_type
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;
`;

// Update bulk upload status
const updateBulkUploadStatusSQL = `
UPDATE bulk_uploads
SET
  status = $2,
  error_message = $3,
  updated_at = CURRENT_TIMESTAMP,
  completed_at = CASE WHEN $2 IN ('completed', 'failed') THEN CURRENT_TIMESTAMP ELSE completed_at END
WHERE id = $1
RETURNING *;
`;

// Update bulk upload progress
const updateBulkUploadProgressSQL = `
UPDATE bulk_uploads
SET
  total_rows = $2,
  processed_rows = $3,
  successful_rows = $4,
  failed_rows = $5,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
`;

// Update bulk upload results
const updateBulkUploadResultsSQL = `
UPDATE bulk_uploads
SET
  results = $2,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
`;

// Log a bulk upload error
const logBulkUploadErrorSQL = `
INSERT INTO bulk_upload_errors (
  upload_id, row_number, column_name, error_message, row_data
) VALUES ($1, $2, $3, $4, $5)
RETURNING *;
`;

// Get all bulk uploads for a vendor
const getVendorBulkUploadsSQL = `
SELECT bu.*,
  u.name as user_name,
  u.email as user_email
FROM blinds.bulk_uploads bu
JOIN blinds.users u ON bu.user_id = u.user_id
WHERE bu.vendor_id = $1
ORDER BY bu.created_at DESC
LIMIT $2 OFFSET $3;
`;

// Get a specific bulk upload
const getBulkUploadSQL = `
SELECT bu.*,
  u.name as user_name,
  u.email as user_email
FROM blinds.bulk_uploads bu
JOIN blinds.users u ON bu.user_id = user_id
WHERE buser_id = $1 AND bu.vendor_id = $2;
`;

// Get errors for a bulk upload
const getBulkUploadErrorsSQL = `
SELECT * FROM blinds.bulk_upload_errors
WHERE upload_id = $1
ORDER BY row_number
LIMIT $2 OFFSET $3;
`;

// Get bulk upload statistics by type
const getBulkUploadStatsSQL = `
SELECT
  upload_type,
  COUNT(*) as total_uploads,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_uploads,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_uploads,
  SUM(successful_rows) as total_successful_rows,
  SUM(failed_rows) as total_failed_rows
FROM bulk_uploads
WHERE vendor_id = $1
GROUP BY upload_type
ORDER BY total_uploads DESC;
`;

// Define expected columns for different upload types
const expectedColumns = {
  products: [
    { name: 'sku', required: true, type: 'string', description: 'Unique product identifier' },
    { name: 'name', required: true, type: 'string', description: 'Product name' },
    { name: 'type', required: true, type: 'string', description: 'Product type (e.g., blinds, shades)' },
    { name: 'description', required: false, type: 'string', description: 'Product description' },
    { name: 'price', required: true, type: 'number', description: 'Base product price' },
    { name: 'min_width', required: true, type: 'number', description: 'Minimum width in inches' },
    { name: 'max_width', required: true, type: 'number', description: 'Maximum width in inches' },
    { name: 'min_height', required: true, type: 'number', description: 'Minimum height in inches' },
    { name: 'max_height', required: true, type: 'number', description: 'Maximum height in inches' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Whether the product is active' }
  ],

  inventory: [
    { name: 'sku', required: true, type: 'string', description: 'Product SKU' },
    { name: 'variant_id', required: false, type: 'string', description: 'Variant identifier' },
    { name: 'quantity', required: true, type: 'number', description: 'Available quantity' },
    { name: 'location', required: false, type: 'string', description: 'Storage location' },
    { name: 'reorder_point', required: false, type: 'number', description: 'Threshold to reorder' },
    { name: 'lead_time_days', required: false, type: 'number', description: 'Days to restock' }
  ],

  prices: [
    { name: 'sku', required: true, type: 'string', description: 'Product SKU' },
    { name: 'variant_id', required: false, type: 'string', description: 'Variant identifier' },
    { name: 'base_price', required: true, type: 'number', description: 'Base product price' },
    { name: 'sale_price', required: false, type: 'number', description: 'Sale price if applicable' },
    { name: 'min_quantity', required: false, type: 'number', description: 'Minimum quantity for price' },
    { name: 'width', required: false, type: 'number', description: 'Width in inches' },
    { name: 'height', required: false, type: 'number', description: 'Height in inches' }
  ]
};

// Get template columns for a specific upload type
const getTemplateColumns = (uploadType) => {
  return expectedColumns[uploadType] || [];
};

// Export all functions and constants
module.exports = {
  createBulkUploadTableSQL,
  createBulkUploadErrorsTableSQL,
  createBulkUploadSQL,
  updateBulkUploadStatusSQL,
  updateBulkUploadProgressSQL,
  updateBulkUploadResultsSQL,
  logBulkUploadErrorSQL,
  getVendorBulkUploadsSQL,
  getBulkUploadSQL,
  getBulkUploadErrorsSQL,
  getBulkUploadStatsSQL,
  expectedColumns,
  getTemplateColumns
};
