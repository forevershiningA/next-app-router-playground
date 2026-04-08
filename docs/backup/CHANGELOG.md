# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- ESLint configuration for Next.js with TypeScript rules
- Additional npm scripts: `lint`, `type-check`, `format`, `format:check`
- Node.js and pnpm engine requirements in package.json
- Development guide (DEVELOPMENT.md)
- Enhanced .gitignore to exclude logs, build artifacts, and IDE files
- Enhanced .prettierignore for better performance

### Changed
- Fixed Tailwind CSS content paths to match actual project structure (was `./src/**/*`, now `./app/**/*`, `./components/**/*`, etc.)
- Improved next.config.ts with image optimization, compression, and remote patterns
- Renamed `prettier` script to `format` (with additional `format:check`)

### Optimized
- Enabled swcMinify for production builds
- Added AVIF and WebP image format support
- Enabled compression in Next.js config
- Added logging configuration for better debugging

## [Previous] - 2025-10-15

### Completed
- Motifs system migration to TypeScript
- Component security audit with 29/29 fixes
- 3D model batch conversion (79 models)
- Additions overlay implementation
- Inscription overlay implementation
- Complete headstone designer functionality
