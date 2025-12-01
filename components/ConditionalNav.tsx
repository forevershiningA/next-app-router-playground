'use client';

import { usePathname } from 'next/navigation';
import { GlobalNav } from '#/ui/global-nav';
import DesignsTreeNav from '#/components/DesignsTreeNav';
import DesignerNav from '#/components/DesignerNav';
import { type DemoCategory } from '#/lib/db';

export default function ConditionalNav({ items }: { items: DemoCategory[] }) {
  const pathname = usePathname();
  
  // Check if we're on /designs route
  const isDesignsRoute = pathname?.startsWith('/designs');
  
  // Check if we're on homepage or other designer pages
  const isDesignerRoute = pathname === '/' || 
                         pathname?.startsWith('/select-') || 
                         pathname?.startsWith('/inscriptions') ||
                         pathname?.startsWith('/check-price');
  
  if (isDesignsRoute) {
    return (
      <div className="hidden md:block fixed top-0 left-0 z-10 flex h-full flex-col border-r border-gray-800 bg-gray-50" style={{ width: '400px' }}>
        <DesignsTreeNav />
      </div>
    );
  }
  
  if (isDesignerRoute) {
    return (
      <div className="hidden md:block fixed top-0 left-0 z-10 flex h-full flex-col border-r border-gray-800 bg-gray-50" style={{ width: '400px' }}>
        <DesignerNav />
      </div>
    );
  }
  
  return <GlobalNav items={items} />;
}
