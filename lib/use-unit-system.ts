'use client';

import {
  resolveUnitSystemFromCurrency,
  type UnitSystem,
} from '#/lib/unit-system';
import { useCurrency } from '#/lib/use-currency';

export function useUnitSystem(): UnitSystem {
  const { currency } = useCurrency();
  return resolveUnitSystemFromCurrency(currency);
}
