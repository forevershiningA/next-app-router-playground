'use client';

import { Suspense } from 'react';
import { data } from '#/app/_internal/_data';
import AdditionCard from './AdditionCard';

export default function Page() {
  const additions = data.additions;

  return (
    <Suspense fallback={null}>
      <div className="space-y-9">
        {/* Statues */}
        <div>
          <h2 className="mb-3 text-lg font-medium text-white/80">Statues</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {additions
              .filter((add) => add.type === 'statue')
              .map((add) => (
                <AdditionCard key={add.id} addition={add} />
              ))}
          </div>
        </div>

        {/* Vases */}
        <div>
          <h2 className="mb-3 text-lg font-medium text-white/80">Vases</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {additions
              .filter((add) => add.type === 'vase')
              .map((add) => (
                <AdditionCard key={add.id} addition={add} />
              ))}
          </div>
        </div>

        {/* Applications */}
        <div>
          <h2 className="mb-3 text-lg font-medium text-white/80">Applications</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
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
