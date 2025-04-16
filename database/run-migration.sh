#!/bin/bash

# Get database credentials from .env file
source .env

# Print status
echo "Running migration to align database schema with application..."

# Run the migration
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -f migration.sql

# Check if migration was successful
if [ $? -eq 0 ]; then
  echo "Migration completed successfully!"
else
  echo "Migration failed. Please check the error messages above."
fi
