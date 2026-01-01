# Scripts Directory

This directory contains utility scripts for development automation.

## Available Scripts

### `generate-sdk.sh`

Generates TypeScript SDK from OpenAPI specification with graceful error handling.

**Usage:**
```bash
bash scripts/generate-sdk.sh
```

**What it does:**
1. Checks if Laravel API documentation is accessible at `http://localhost:8888/api/documentation/json`
2. If accessible: Generates TypeScript SDK using `openapi-typescript-codegen`
3. If not accessible: Skips generation and displays a warning (won't fail the build)
4. Creates SDK output directory if it doesn't exist

**npm shortcuts:**
```bash
npm run generate-sdk        # Safe mode (uses this script)
npm run generate-sdk:force  # Force mode (requires server running)
```

**Why this script exists:**

The SDK generation requires the Laravel server to be running to fetch the OpenAPI spec. However, `npm run dev` needs to run before the server starts. This script gracefully handles the chicken-and-egg problem by:

- Allowing `npm run dev` to proceed even if the server isn't running yet
- Providing helpful messages when the server isn't available
- Preventing build failures due to missing API documentation

**Workflow:**

1. Run `composer run dev` (starts both Laravel + Vite)
2. SDK generation is attempted automatically
3. If Laravel isn't ready yet, it skips gracefully
4. Once Laravel is running, run `npm run generate-sdk:force` to generate the SDK

**Requirements:**
- bash shell
- curl (for checking server availability)
- npx (for running openapi-typescript-codegen)
- Laravel server running at port 8888
