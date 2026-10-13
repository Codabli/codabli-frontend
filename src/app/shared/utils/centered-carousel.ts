export function getCenteredItemIndex(
  track: HTMLElement,
  itemSelector: string,
): number {
  const trackCenter =
    track.getBoundingClientRect().left + track.clientWidth / 2;
  const items = track.querySelectorAll<HTMLElement>(itemSelector);
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  items.forEach((item, index) => {
    const bounds = item.getBoundingClientRect();
    const distance = Math.abs(bounds.left + bounds.width / 2 - trackCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

export function scrollToCenteredItem(
  track: HTMLElement,
  itemSelector: string,
  index: number,
  instant = false,
): void {
  const item = track.querySelectorAll<HTMLElement>(itemSelector)[index];
  if (!item) return;

  const trackCenter =
    track.getBoundingClientRect().left + track.clientWidth / 2;
  const bounds = item.getBoundingClientRect();
  const itemCenter = bounds.left + bounds.width / 2;
  const target = track.scrollLeft + itemCenter - trackCenter;

  if (instant) {
    const previousScrollBehavior = track.style.scrollBehavior;
    track.style.scrollBehavior = 'auto';
    track.scrollLeft = target;
    track.style.scrollBehavior = previousScrollBehavior;
  } else {
    track.scrollTo({ left: target });
  }
}
