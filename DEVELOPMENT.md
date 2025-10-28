# Next-DYO Development Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+ (recommended package manager)

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts

```bash
pnpm dev           # Start development server (http://localhost:3000)
pnpm build         # Build for production
pnpm start         # Start production server
pnpm lint          # Run ESLint
pnpm type-check    # Run TypeScript type checking
pnpm format        # Format code with Prettier
pnpm format:check  # Check code formatting
```

## Project Structure

```
next-dyo/
├── app/                    # Next.js App Router pages & routes
│   ├── inscriptions/      # Text customization UI
│   ├── select-additions/  # 3D additions selection
│   ├── select-material/   # Material/texture picker
│   ├── select-motifs/     # Laser-etched motifs
│   ├── select-shape/      # Headstone shape selector
│   ├── select-size/       # Dimension configuration
│   └── layout.tsx         # Root layout with 3D scene
├── components/            # Reusable React components
│   ├── three/            # Three.js 3D components
│   ├── system/           # System-level components
│   ├── ThreeScene.tsx    # Main 3D scene renderer
│   └── ...
├── lib/                   # Core logic & utilities
│   ├── headstone-store.ts        # Zustand state management
│   ├── headstone-constants.ts    # App constants
│   ├── scene-overlay-store.ts    # Overlay panel state
│   ├── xml-parser.ts             # Pricing & catalog parser
│   └── ...
├── public/                # Static assets (1.2GB)
│   ├── textures/         # Material textures (multi-resolution)
│   ├── shapes/           # SVG headstone shapes
│   ├── additions/        # 3D models (.glb files)
│   ├── motifs/           # Laser-etched motif images
│   └── xml/              # Configuration & pricing data
└── ui/                    # UI components & patterns
```

## Key Technologies

- **Framework**: Next.js 15.5.2 (App Router)
- **React**: 19.1.1
- **TypeScript**: 5.9.2
- **3D Graphics**: Three.js 0.180.0 with React Three Fiber
- **Styling**: Tailwind CSS 4.1.13
- **State**: Zustand 5.0.8
- **Validation**: Zod 4.1.5

## Development Workflow

### Making Changes

1. **Components**: Add/edit in `components/` directory
2. **Routes**: Add pages in `app/` following Next.js App Router conventions
3. **State**: Modify stores in `lib/` (headstone-store.ts, scene-overlay-store.ts)
4. **Styles**: Use Tailwind CSS classes (configured in tailwind.config.js)

### Code Quality

- Run `pnpm type-check` before committing
- Format code with `pnpm format`
- TypeScript strict mode is enabled
- ESLint configured for Next.js best practices

## 3D Scene Architecture

The application uses a persistent 3D scene rendered via ThreeScene component:
- Scene is mounted once in root layout
- Components update via Zustand stores
- Overlays rendered with SceneOverlayHost
- Camera supports 2D and 3D modes

## State Management

Primary state in `lib/headstone-store.ts`:
```typescript
- Shape (SVG path)
- Material (texture URL)
- Size (width, height, thickness)
- Inscriptions (lines array with font, color, position)
- Additions (3D models: statues, vases)
- Motifs (laser-etched images)
- Pricing data
```

## Asset Loading

Assets are loaded from `/public` directory:
- **Textures**: `/textures/forever/` and `/textures/phoenix/`
- **3D Models**: `/additions/{id}/model.glb`
- **Motifs**: `/motifs/{category}/{file}.png`
- **Shapes**: `/shapes/headstones/{name}.svg`

## Pricing System

Pricing calculated via XML parser (`lib/xml-parser.ts`):
- Loads from `/public/xml/{locale}/` directory
- Parses catalog data, materials, inscriptions
- Real-time price updates in header

## Common Tasks

### Adding a New Material
1. Add texture images to `/public/textures/`
2. Update catalog XML in `/public/xml/`
3. Image will appear in material selector

### Adding a New 3D Addition
1. Place .glb file in `/public/additions/{id}/model.glb`
2. Add thumbnail image
3. Update additions data in `app/_internal/_data.ts`

### Adding a New Motif Category
1. Create directory `/public/motifs/{category}/`
2. Add motif PNG images
3. Update motifs data in `app/_internal/_data.ts`

## Performance Considerations

- Large public directory (1.2GB) - use lazy loading
- 3D models optimized as .glb format
- Textures available in multiple resolutions (s, m, l)
- Image optimization enabled in next.config.ts
- Compression and minification enabled

## Browser Requirements

- WebGL support required for 3D rendering
- Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Troubleshooting

### 3D Scene Not Loading
- Check browser WebGL support
- Review ErrorBoundary fallback messages
- Check console for Three.js errors

### TypeScript Errors
- Run `pnpm type-check` to see all errors
- Ensure all dependencies installed
- Check tsconfig.json configuration

### Build Failures
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Check Node.js version (18+)

## Documentation

Additional documentation in markdown files:
- `ADDITIONS_IMPLEMENTATION.md` - Additions feature
- `MOTIFS_IMPLEMENTATION_SUMMARY.md` - Motifs system
- `COMPONENT_AUDIT.md` - Component health audit
- `FINAL_STATUS.md` - Implementation status

## Contributing

This is a proprietary application. For bugs or feature requests, contact the development team.

## License

See `license.md` for details.
