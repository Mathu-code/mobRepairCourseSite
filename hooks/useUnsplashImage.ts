import { useState, useEffect } from 'react';

const imageCache = new Map<string, string>();
const LOCAL_FALLBACK = '/image.webp';

export function useUnsplashImage(query: string): string {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const normalizedQuery = (query || 'mobile repair').trim().toLowerCase();

    if (imageCache.has(normalizedQuery)) {
      setImageUrl(imageCache.get(normalizedQuery)!);
      return;
    }

    // Use deterministic seeded placeholders to avoid runtime fetch failures from source.unsplash.com.
    const seededUrl = normalizedQuery
      ? `https://picsum.photos/seed/${encodeURIComponent(normalizedQuery)}/800/600`
      : LOCAL_FALLBACK;

    imageCache.set(normalizedQuery, seededUrl);
    setImageUrl(seededUrl);
  }, [query]);

  return imageUrl;
}
