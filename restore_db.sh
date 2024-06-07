#!/bin/bash
DATABASE_NAME=The_DOMinators
DATABASE_USER=postgres
DATABASE_PASSWORD=nidhish3

echo "Creating database..."
createdb -h localhost -U $DATABASE_USER -p 5432 $DATABASE_NAME

echo "Restoring database..."
psql -h localhost -U $DATABASE_USER -p 5432 -d $DATABASE_NAME -f The_DOMinators.sql

echo "Database restored successfully."
