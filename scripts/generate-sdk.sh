#!/bin/bash

# Generate TypeScript SDK from OpenAPI spec
# This script gracefully handles cases where the docs haven't been generated yet

API_DOCS_FILE="./storage/api-docs/api-docs.json"
OUTPUT_DIR="./resources/js/sdk"

# Check if the API documentation file exists
if [ -f "$API_DOCS_FILE" ]; then
    echo "Generating TypeScript SDK from OpenAPI spec..."
    npx openapi-typescript-codegen --input "$API_DOCS_FILE" --output "$OUTPUT_DIR" --client axios
    echo "SDK generation complete!"
else
    echo "⚠️  API documentation not found at $API_DOCS_FILE"
    echo "   Run 'php artisan l5-swagger:generate' to create the documentation first."
    echo "   Then run 'composer run generate-sdk' to generate the TypeScript SDK."

    # Create empty SDK directory if it doesn't exist to prevent build errors
    mkdir -p "$OUTPUT_DIR"
fi
