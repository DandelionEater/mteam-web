import { useEffect, useState, useRef } from 'react';

export const useItemsPerRow = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [itemsPerRow, setItemsPerRow] = useState(3); // fallback

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && itemRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const itemWidth = itemRef.current.clientWidth;
        const perRow = Math.max(1, Math.floor(containerWidth / itemWidth));
        setItemsPerRow(perRow);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return { containerRef, itemRef, itemsPerRow };
};
