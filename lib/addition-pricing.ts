import { data } from '#/app/_internal/_data';

const getBaseAdditionId = (instanceId: string) => {
  const parts = instanceId.split('_');
  const lastPart = parts.at(-1);
  const hasInstanceSuffix =
    parts.length > 1 && lastPart !== undefined && /^\d+$/.test(lastPart);
  return hasInstanceSuffix ? parts.slice(0, -1).join('_') : instanceId;
};

export function getAdditionPricing(
  instanceId: string,
  requestedVariant = 1,
) {
  const baseId = getBaseAdditionId(instanceId);
  const addition = data.additions.find((item) => item.id === baseId);
  const sizes = addition?.sizes ?? [];
  const variant = sizes.length
    ? Math.min(
        sizes.length,
        Math.max(1, Math.round(requestedVariant || 1)),
      )
    : 1;

  return {
    baseId,
    addition,
    variant,
    price: sizes[variant - 1]?.retailPrice ?? sizes[0]?.retailPrice ?? 0,
  };
}

export function calculateAdditionsPrice(
  selectedAdditionIds: string[],
  additionOffsets: Record<string, { sizeVariant?: number } | undefined>,
) {
  return selectedAdditionIds.reduce(
    (total, instanceId) =>
      total +
      getAdditionPricing(
        instanceId,
        additionOffsets[instanceId]?.sizeVariant,
      ).price,
    0,
  );
}
