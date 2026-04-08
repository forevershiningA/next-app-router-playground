# React Hydration Error Fix

**Date:** 2026-01-30  
**Status:** ✅ Fixed

---

## Problem

React hydration error occurring on `/select-motifs` page:

```
Uncaught Error: Hydration failed because the server rendered HTML didn't match the client.
```

---

## Root Cause

The `select-motifs/page.tsx` component was using `typeof window !== 'undefined'` in the `useState` initializer:

```typescript
// ❌ PROBLEMATIC CODE
const [isDesktop, setIsDesktop] = useState(() => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
});
```

### Why This Causes Hydration Mismatch

1. **Server-side rendering (SSR)**:
   - `window` is undefined on the server
   - State initializes to `false`
   - HTML rendered with `showGrid = true` (on mobile paths)

2. **Client-side hydration**:
   - `window.innerWidth` is available
   - If screen width >= 1024px, state initializes to `true`
   - React expects `showGrid = false` but finds `showGrid = true` from server
   - **MISMATCH!** → Hydration error

---

## Solution

Initialize state with a consistent value on both server and client, then update in `useEffect`:

```typescript
// ✅ FIXED CODE
const [isDesktop, setIsDesktop] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsDesktop(window.innerWidth >= 1024);
  };

  handleResize(); // Set correct value on mount
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### How This Works

1. **Server-side rendering**:
   - State: `isDesktop = false`
   - HTML: Rendered assuming mobile view

2. **Client-side hydration**:
   - State: `isDesktop = false` (same as server!)
   - HTML matches perfectly ✅

3. **After hydration** (useEffect runs):
   - Checks actual window width
   - Updates `isDesktop` if needed
   - Re-renders with correct layout

---

## Key Principle

**Never use browser-only APIs in state initialization:**

### ❌ BAD - Causes Hydration Errors
```typescript
useState(() => window.innerWidth >= 1024)
useState(() => localStorage.getItem('key'))
useState(() => new Date().getHours())
useState(() => Math.random())
```

### ✅ GOOD - Safe for SSR
```typescript
// Initialize with safe default
useState(false)
useState(null)
useState('')

// Update in useEffect
useEffect(() => {
  setState(window.innerWidth >= 1024);
  setState(localStorage.getItem('key'));
  setState(new Date().getHours());
}, []);
```

---

## Files Modified

1. `app/select-motifs/page.tsx` - Fixed `isDesktop` state initialization

---

## Testing

### Before Fix
- Console error: "Hydration failed..."
- Page would flash/re-render after load
- React warning in development

### After Fix
- ✅ No hydration errors
- ✅ Clean console
- ✅ Smooth rendering
- ✅ Build succeeds without warnings

---

## Related Common Hydration Issues

### 1. Window/Document APIs
```typescript
// ❌ BAD
const [width, setWidth] = useState(window.innerWidth);

// ✅ GOOD
const [width, setWidth] = useState(0);
useEffect(() => setWidth(window.innerWidth), []);
```

### 2. Random Values
```typescript
// ❌ BAD
const [id] = useState(`id-${Math.random()}`);

// ✅ GOOD
import { useId } from 'react';
const id = useId(); // React 18+
```

### 3. Date/Time
```typescript
// ❌ BAD
const [time] = useState(new Date().toLocaleString());

// ✅ GOOD
const [time, setTime] = useState('');
useEffect(() => setTime(new Date().toLocaleString()), []);
```

### 4. LocalStorage
```typescript
// ❌ BAD
const [value] = useState(localStorage.getItem('key') || 'default');

// ✅ GOOD
const [value, setValue] = useState('default');
useEffect(() => {
  setValue(localStorage.getItem('key') || 'default');
}, []);
```

### 5. Browser Extensions
Some browser extensions inject HTML before React hydrates, causing mismatches. This is out of our control, but we can suppress the error:

```typescript
// Suppress hydration errors (use sparingly!)
<div suppressHydrationWarning>
  {typeof window !== 'undefined' && window.innerWidth}
</div>
```

---

## Prevention Checklist

When writing client components:

- [ ] No `window`, `document`, `navigator` in initial state
- [ ] No `localStorage`, `sessionStorage` in initial state
- [ ] No `Date.now()` or `Math.random()` in initial state
- [ ] No browser detection in initial state
- [ ] Use `useEffect` for all browser-specific logic
- [ ] Test in production build mode
- [ ] Check console for hydration warnings

---

## Build Status

✅ **Build successful** - No hydration warnings  
✅ **Production-ready** - All pages render correctly

---

## References

- [React Hydration Mismatch Docs](https://react.dev/link/hydration-mismatch)
- [Next.js SSR Best Practices](https://nextjs.org/docs/messages/react-hydration-error)
- [React useEffect Hook](https://react.dev/reference/react/useEffect)
