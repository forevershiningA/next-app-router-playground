import { ReactNode } from 'react';

export default function DesignLayout({ children }: { children: ReactNode }) {
  // Sidebar is added in parent category layout to avoid duplication
  return <>{children}</>;
}
