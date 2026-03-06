# Brand Command Update Report

**Date:** 2026-03-05  
**Change:** Migrated brand commands to the `brand-assets` API endpoints

## Summary

The Karis CLI brand workflow was updated from the legacy `/api/v1/brand` endpoints to the newer `brand-assets` API surface.

Updated endpoints:

- `GET /api/v1/brand-assets/selection`
- `POST /api/v1/brand-assets/analyze`
- `POST /api/v1/brand-assets/customizations`

## Main Changes

### API Client

- Added `BrandAssetsSnapshot` and related asset types.
- Kept `BrandProfile` as a compatibility alias.
- Updated `getBrand()`, `createBrand()`, and `updateBrand()` to use the new endpoints.

### `brand init`

- Simplified the flow to require only a domain.
- Moved profile generation to backend analysis.
- Improved progress feedback and summary output.

### `brand show`

- Expanded output to include brand assets such as colors, logos, fonts, and links.

### `brand edit`

- Switched to the customizations endpoint.
- Limited editing to LLM-generated custom fields.

## Outcome

- Better UX for initialization
- Richer brand asset display
- Cleaner type safety around optional fields
- CLI aligned with the current backend API shape
