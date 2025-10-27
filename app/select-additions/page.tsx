'use client';

import { Suspense } from 'react';
import { data } from '#/app/_internal/_data';
import AdditionCard from './AdditionCard';

export default function Page() {
  const additions = data.additions;

  return (
    <Suspense fallback={null}>
      <div className="space-y-6">
        {/* Statues */}
        <div>
          <h2 className="mb-3 text-sm font-medium text-white/60">Statues</h2>
          <div className="grid grid-cols-3 gap-2">
            {additions
              .filter((add) => add.type === 'statue')
              .map((add) => (
                <AdditionCard key={add.id} addition={add} />
              ))}
          </div>
        </div>

        {/* Vases */}
        <div>
          <h2 className="mb-3 text-sm font-medium text-white/60">Vases</h2>
          <div className="grid grid-cols-3 gap-2">
            {additions
              .filter((add) => add.type === 'vase')
              .map((add) => (
                <AdditionCard key={add.id} addition={add} />
              ))}
          </div>
        </div>

        {/* Applications */}
        <div>
          <h2 className="mb-3 text-sm font-medium text-white/60">Applications</h2>
          <div className="grid grid-cols-3 gap-2">
            {additions
              .filter((add) => add.type === 'application')
              .map((add) => (
                <AdditionCard key={add.id} addition={add} />
              ))}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
