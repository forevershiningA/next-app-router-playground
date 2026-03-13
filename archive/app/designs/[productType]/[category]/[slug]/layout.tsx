import { ReactNode } from 'react';

export default function DesignLayout({ children }: { children: ReactNode }) {
  // The children will include the DesignPageClient component
  // which has the breadcrumb, header, price quote, and design details
  // Sidebar is added in parent category layout to avoid duplication
  return <>{children}</>;
}
