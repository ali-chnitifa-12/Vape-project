/**
 * Cart utility — reads/writes from localStorage
 */

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem('klawdz_cart') || '[]');
  } catch {
    return [];
  }
}

export function saveCart(items) {
  localStorage.setItem('klawdz_cart', JSON.stringify(items));
  // Dispatch a custom event so any open component can react
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty = Math.min(existing.qty + qty, product.stock || 99);
  } else {
    cart.push({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      image:    product.image,
      category: product.category,
      stock:    product.stock,
      qty,
    });
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  return cart;
}

export function updateCartQty(productId, qty) {
  const cart = getCart().map(item =>
    item.id === productId ? { ...item, qty: Math.max(1, qty) } : item
  );
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}
