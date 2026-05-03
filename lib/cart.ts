export type CartItem = {
  id: string;
  itemType: 'course' | 'note';
  title: string;
  price: number;
  image?: string;
  addedAt?: string;
};

const CART_KEY_PREFIX = 'shoppingCart:user:';
const ANONYMOUS_CART_KEY = 'shoppingCart';

const getCartKey = (userId?: string | null) => {
  return userId ? `${CART_KEY_PREFIX}${userId}` : ANONYMOUS_CART_KEY;
};

const readCartFromKey = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
};

const writeCartToKey = (key: string, items: CartItem[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

const isSameItem = (item: CartItem, targetId: string, itemType: 'course' | 'note') => {
  return String(item?.id || '') === String(targetId || '') && item?.itemType === itemType;
};

export const readCartItems = (userId?: string | null) => {
  return readCartFromKey(getCartKey(userId));
};

export const writeCartItems = (items: CartItem[], userId?: string | null) => {
  writeCartToKey(getCartKey(userId), items);
};

export const addCartItem = (item: CartItem, userId?: string | null) => {
  const currentItems = readCartItems(userId);
  const existing = currentItems.find((currentItem) => isSameItem(currentItem, item.id, item.itemType));

  if (existing) {
    return false;
  }

  writeCartItems([...currentItems, item], userId);
  return true;
};

export const removeCartItem = (itemId: string, itemType: 'course' | 'note', userId?: string | null) => {
  const currentItems = readCartItems(userId);
  const nextItems = currentItems.filter((item) => !isSameItem(item, itemId, itemType));
  writeCartItems(nextItems, userId);
  return nextItems;
};

export const syncAnonymousCartToUser = (userId: string) => {
  const anonymousItems = readCartFromKey(ANONYMOUS_CART_KEY);
  const userItems = readCartFromKey(getCartKey(userId));

  if (anonymousItems.length === 0) {
    return userItems;
  }

  const mergedItems = [...userItems];

  anonymousItems.forEach((item) => {
    const exists = mergedItems.some((currentItem) => isSameItem(currentItem, item.id, item.itemType));
    if (!exists) {
      mergedItems.push(item);
    }
  });

  writeCartToKey(getCartKey(userId), mergedItems);
  localStorage.removeItem(ANONYMOUS_CART_KEY);
  return mergedItems;
};

export const dispatchCartUpdated = (message?: string) => {
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: { message } }));
};