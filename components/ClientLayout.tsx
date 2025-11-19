'use client';

import RouterBinder from '#/components/system/RouterBinder';
import MainContent from '#/components/MainContent';
import ConditionalCanvas from '#/components/ConditionalCanvas';
import ConditionalNav from '#/components/ConditionalNav';
import { NavigationProvider } from '#/contexts/NavigationContext';

export default function ClientLayout({
  children,
  demos,
}: {
  children: React.ReactNode;
  demos: any[];
}) {
  return (
    <NavigationProvider>
      <RouterBinder />
      <ConditionalNav items={demos} />
      <MainContent>
        <ConditionalCanvas />
        {children}
      </MainContent>
    </NavigationProvider>
  );
}
