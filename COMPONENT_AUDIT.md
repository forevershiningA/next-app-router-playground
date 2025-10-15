# Component Audit Report - Next DYO

**Date:** October 15, 2025  
**Auditor:** AI Assistant  
**Total Components Analyzed:** 20 files

---

## Executive Summary

The components directory contains well-structured React components for a headstone customization application using Three.js and Next.js. Overall code quality is **GOOD** with modern patterns, but there are several areas requiring attention for production readiness.

**Risk Level:** 🟡 MEDIUM

---

## Critical Issues 🔴

### 1. **HeadstoneInscription.tsx** - Type Safety Issues
**Line 58:** `const { camera, gl, controls, scene } = useThree() as any;`
- ❌ Using `as any` defeats TypeScript safety
- **Impact:** Runtime errors if Three.js API changes
- **Fix:** Properly type the destructured values
```typescript
const { camera, gl, controls, scene } = useThree() as {
  camera: THREE.Camera;
  gl: THREE.WebGLRenderer;
  controls: any; // OrbitControls type from drei
  scene: THREE.Scene;
};
```

### 2. **AdditionModel.tsx** - Missing Error Boundaries
**Lines 16-22:** GLTF loading with try/catch but no user feedback
```typescript
try {
  gltf = useGLTF(`/additions/${id}/${id}.gltf`);
} catch {
  gltf = useGLTF(`/additions/${id}/Art${id}.gltf`);
}
```
- ❌ Silent failures if both paths fail
- ❌ No loading state or error message to user
- **Impact:** White screen or missing models with no explanation
- **Fix:** Add error boundary component and loading states

### 3. **RouterBinder.tsx** - Unhandled Promise Rejections
**Lines 35-62:** Fetch without proper error handling
```typescript
fetch('/xml/au_EN/inscriptions.xml')
  .then(res => res.text())
  .then(xmlText => { /* ... */ })
  .catch(err => console.error('Failed to load inscriptions XML:', err));
```
- ❌ Error only logged to console, user not notified
- ❌ Application may be in broken state if XML fails
- **Impact:** Silent failures affecting pricing/limits
- **Fix:** Show user-facing error and set sensible defaults

---

## High Priority Issues 🟠

### 4. **SvgHeadstone.tsx** - Complex Component Needs Refactoring
**Lines 1-468:** Single component with 468 lines, multiple responsibilities
- ❌ Mixes SVG parsing, geometry creation, material setup, UV mapping
- ❌ Difficult to test and maintain
- **Impact:** High cognitive load, bug-prone
- **Recommendation:** Extract into smaller hooks:
  - `useSVGLoader(url)`
  - `useGeometryBuilder(shape, config)`
  - `useMaterialSetup(textures, config)`
  - `useUVMapping(geometry, outline)`

### 5. **HeadstoneInscription.tsx** - Performance Concerns
**Line 208-213:** BoxHelper created on every render cycle
```typescript
useFrame(() => {
  if (selected && helperRef.current && groupRef.current) {
    helperRef.current.update();
    helperRef.current.scale.setScalar(1.01);
  }
});
```
- ⚠️ BoxHelper update on every frame (60fps) even when not needed
- **Impact:** Unnecessary GPU/CPU work
- **Fix:** Only update when selection changes or object moves

### 6. **Missing PropTypes Validation**
Multiple components lack runtime prop validation:
- `SceneOverlayController.tsx`
- `SelectSizeOverlayCard.tsx`
- `OverlayPortal.tsx`

**Recommendation:** Add runtime validation with Zod or PropTypes

### 7. **ThreeScene.tsx** - Inconsistent Loading States
**Lines 72-85:** Multiple loading indicators
```typescript
const loading = useHeadstoneStore((s) => s.loading);
return (
  <>
    <ViewToggleButton />
    {loading && <div>...</div>} {/* First loader */}
    <Canvas>
      <Suspense fallback={null}> {/* No fallback! */}
```
- ❌ Canvas Suspense has `fallback={null}` while separate loading div exists
- **Impact:** Confusing UX, inconsistent loading behavior
- **Fix:** Unified loading strategy

---

## Medium Priority Issues 🟡

### 8. **Memory Leaks - Missing Cleanup**

#### HeadstoneInscription.tsx (Lines 176-186)
```typescript
React.useEffect(() => {
  if (!dragging) return;
  // ... event listeners added
  return () => {
    canvas.removeEventListener('pointermove', onMove);
    // ...
  };
}, [dragging, gl, controls, placeFromClientXY]);
```
- ⚠️ Dependency on `placeFromClientXY` causes effect to re-run frequently
- **Fix:** Use `useCallback` with stable deps

#### SvgHeadstone.tsx - Three.js Resources
- ⚠️ Materials and geometries created in useMemo but never disposed
- **Impact:** Memory leaks on component unmount or catalog changes
- **Fix:** Add cleanup in useEffect

### 9. **Accessibility Issues**

#### MobileHeader.tsx (Lines 28-35)
```typescript
<button onClick={...} className="cursor-pointer...">
  <Bars3Icon className="h-6 w-6" />
</button>
```
- ❌ No `aria-label` on button
- ❌ Icon-only button without text alternative
- **Fix:** Add proper ARIA labels

#### SceneOverlayController.tsx (Line 221)
```typescript
<div onPointerDown={...} onDoubleClick={() => setCollapsed((c) => !c)}>
```
- ❌ Double-click interaction not keyboard accessible
- **Fix:** Add keyboard handler for Enter/Space

### 10. **Hard-coded Values and Magic Numbers**

#### HeadstoneBaseAuto.tsx
```typescript
const baseW = Math.max(hsW * 1.4, 0.05);  // Why 1.4?
const baseD = Math.max(hsD * 2.0, 0.05);  // Why 2.0?
```

#### Scene.tsx
```typescript
const topColor = vec3(0.4, 0.7, 1.0);  // Define as constants
```

**Recommendation:** Extract to configuration constants with comments explaining rationale

---

## Code Quality Issues 💭

### 11. **Inconsistent Error Handling Patterns**
- Some components use try/catch
- Others use optional chaining
- RouterBinder uses promise .catch()
- No unified error handling strategy

**Recommendation:** Implement consistent error handling:
```typescript
// Standardized error handler
function useErrorHandler() {
  return (error: Error, context: string) => {
    console.error(`[${context}]`, error);
    // Log to error tracking service
    // Show user-friendly toast notification
  };
}
```

### 12. **Type Safety Inconsistencies**
- Mix of `any` types and proper typing
- Some refs typed as `React.RefObject<THREE.Group | null>`, others as `React.RefObject<THREE.Group>`
- Inconsistent use of type imports (`import type`)

### 13. **Component Organization**
Current structure:
```
components/
├── three/
│   ├── headstone/
│   └── overlays/
├── hooks/
└── system/
```

**Recommendation:** Consider feature-based organization:
```
components/
├── headstone/
│   ├── three/
│   ├── overlays/
│   └── hooks/
├── shared/
└── system/
```

---

## Best Practices Violations ⚠️

### 14. **React Hook Dependencies**

#### SceneOverlayController.tsx (Line 90)
```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [specificKey, globalKey]);
```
- ❌ Disabled exhaustive-deps rule
- **Impact:** Potential stale closure bugs
- **Fix:** Either fix dependencies or document why it's safe

### 15. **Direct DOM Manipulation**

#### Multiple components
```typescript
document.body.style.cursor = 'grabbing';  // HeadstoneInscription.tsx:178
```
- ⚠️ Should use CSS classes for better maintainability
- **Fix:** Define cursor styles in CSS and toggle classes

### 16. **Performance - Unnecessary Re-renders**

#### MobileHeader.tsx (Lines 13-18)
```typescript
const inscriptionCost = useHeadstoneStore((s) => s.inscriptionCost);
const price = catalog
  ? calculatePrice(catalog.product.priceModel, quantity) + inscriptionCost
  : 0;
```
- ⚠️ `calculatePrice` called on every render
- **Fix:** Use `useMemo` or move calculation to store

---

## Security Considerations 🔒

### 17. **XSS Vulnerability - XML Parsing**

#### RouterBinder.tsx (Line 37-39)
```typescript
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
```
- ⚠️ XML parsing without sanitization
- **Impact:** If XML source is compromised, could execute malicious code
- **Fix:** Validate XML schema, sanitize content

### 18. **Path Traversal Risk**

#### AdditionModel.tsx (Lines 18-22)
```typescript
gltf = useGLTF(`/additions/${id}/${id}.gltf`);
```
- ⚠️ User-controlled `id` used in file path
- **Impact:** If `id` contains `../`, could access unauthorized files
- **Fix:** Validate/sanitize `id` parameter
```typescript
const sanitizedId = id.replace(/[^a-zA-Z0-9_-]/g, '');
```

---

## Recommendations by Priority

### Immediate Actions (Week 1)
1. ✅ Add error boundaries around Three.js components
2. ✅ Fix type safety issues (remove `as any`)
3. ✅ Implement proper error handling for XML/GLTF loading
4. ✅ Add input sanitization for file paths
5. ✅ Fix memory leaks in HeadstoneInscription

### Short Term (Month 1)
6. 📝 Refactor SvgHeadstone.tsx into smaller composable hooks
7. 📝 Implement unified error handling strategy
8. 📝 Add comprehensive loading states
9. 📝 Improve accessibility (ARIA labels, keyboard navigation)
10. 📝 Add runtime prop validation

### Medium Term (Quarter 1)
11. 🔄 Reorganize component structure
12. 🔄 Extract magic numbers to configuration
13. 🔄 Add performance monitoring
14. 🔄 Implement comprehensive testing strategy
15. 🔄 Create component documentation

---

## Testing Recommendations

### Missing Test Coverage
Currently no test files found. Recommend:

1. **Unit Tests** (Jest + React Testing Library)
   - Component rendering
   - User interactions
   - State management (Zustand store)

2. **Integration Tests**
   - Three.js scene rendering
   - Inscription drag-and-drop
   - Material/shape switching

3. **E2E Tests** (Playwright)
   - Complete customization flow
   - Save/load functionality
   - Cross-browser compatibility

---

## Performance Audit

### Identified Bottlenecks

1. **SvgHeadstone.tsx** - Complex geometry calculations in render path
2. **HeadstoneInscription.tsx** - BoxHelper updates every frame
3. **Scene.tsx** - Shader compilation on every mount

### Optimization Opportunities

```typescript
// 1. Memoize expensive calculations
const geometry = useMemo(() => createGeometry(shape), [shape]);

// 2. Use instanced meshes for repeated elements
<instancedMesh count={10} args={[geometry, material, 10]} />

// 3. Implement LOD (Level of Detail)
<Lod distances={[0, 10, 20]}>
  <mesh geometry={highDetail} />
  <mesh geometry={mediumDetail} />
  <mesh geometry={lowDetail} />
</Lod>
```

---

## Documentation Needs

### Missing Documentation
- [ ] Component props interfaces
- [ ] Three.js coordinate system explanation
- [ ] State management architecture
- [ ] File loading conventions
- [ ] Error handling patterns

### Recommended Additions
```typescript
/**
 * HeadstoneInscription - 3D text component for headstone customization
 * 
 * @remarks
 * Renders editable 3D text on the front face of a headstone mesh.
 * Supports drag-and-drop positioning via raycasting.
 * 
 * @param id - Unique identifier for the inscription
 * @param headstone - API reference to parent headstone mesh
 * @param text - Text content to display
 * @param height - Font height in SVG units
 * 
 * @example
 * ```tsx
 * <HeadstoneInscription
 *   id="line-1"
 *   headstone={headstoneAPI}
 *   text="In Loving Memory"
 *   height={50}
 *   editable
 * />
 * ```
 */
```

---

## Conclusion

The codebase demonstrates **modern React and Three.js patterns** with good separation of concerns. However, production readiness requires:

1. **Error Handling**: Comprehensive error boundaries and user feedback
2. **Type Safety**: Remove `any` types, proper TypeScript usage
3. **Security**: Input validation and sanitization
4. **Performance**: Memory leak fixes, render optimization
5. **Testing**: Comprehensive test coverage
6. **Documentation**: Component APIs and architecture

**Overall Grade: B-** (Good foundation, needs production hardening)

**Estimated Effort to Production-Ready: 2-3 weeks** (1 developer)

---

## Appendix: Quick Wins Checklist

- [ ] Add `<ErrorBoundary>` wrapper in layout.tsx
- [ ] Replace all `as any` with proper types
- [ ] Add `aria-label` to icon buttons
- [ ] Implement `useMemo` for expensive calculations
- [ ] Add `.dispose()` cleanup for Three.js resources
- [ ] Create constants file for magic numbers
- [ ] Add loading skeletons instead of spinners
- [ ] Validate XML schema before parsing
- [ ] Sanitize file path inputs
- [ ] Add PropTypes or Zod validation
