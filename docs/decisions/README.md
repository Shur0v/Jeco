# Architecture Decision Records (ADR)

## ADR-001: Replaceable Mock Commerce Service Contract
- **Decision**: Abstract all catalog, review, and promotion queries behind `ICommerceService` in `src/commerce/contracts/index.ts`.
- **Rationale**: Allows replacing in-memory mock data with a headless commerce API in a future phase without modifying React components.

## ADR-002: Deterministic Studio SVG Artwork Engine
- **Decision**: Render all product studio angles and editorial banners via deterministic SVG Data-URIs in `src/lib/artwork.ts`.
- **Rationale**: Eliminates fragile external image dependencies and ensures instant, 0ms loading with custom 3D metallic/enamel shading matching the 11 reference screenshots.
