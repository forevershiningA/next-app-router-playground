'use client';

import RouterBinder from '#/components/system/RouterBinder';
import MainContent from '#/components/app-shell/MainContent';
import ConditionalCanvas from '#/components/app-shell/ConditionalCanvas';
import ConditionalNav from '#/components/app-shell/ConditionalNav';
import DefaultDesignLoader from '#/components/projects/DefaultDesignLoader';
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
      <DefaultDesignLoader />
      <ConditionalNav items={demos} />
      <MainContent>
        <ConditionalCanvas />
        {children}
      </MainContent>
    </NavigationProvider>
  );
}
