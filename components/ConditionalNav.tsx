'use client';

import { usePathname } from 'next/navigation';
import { GlobalNav } from '#/ui/global-nav';
import DesignsTreeNav from '#/components/DesignsTreeNav';
import { type DemoCategory } from '#/lib/db';

export default function ConditionalNav({ items }: { items: DemoCategory[] }) {
  const pathname = usePathname();
  
  // Check if we're on /designs route
  const isDesignsRoute = pathname?.startsWith('/designs');
  
  if (isDesignsRoute) {
    return (
      <div className="fixed top-0 left-0 z-10 flex h-full flex-col border-r border-gray-800 bg-gray-50" style={{ width: '400px' }}>
        <DesignsTreeNav />
      </div>
    );
  }
  
  return <GlobalNav items={items} />;
}
