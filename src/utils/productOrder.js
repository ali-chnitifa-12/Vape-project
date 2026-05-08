/**
 * utils/productOrder.js
 * Persists the admin-defined product display order in localStorage.
 */

const KEY = 'klawdz_product_order'

/** Save an array of product IDs as the display order */
export function saveProductOrder(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids))
}

/** Load the saved order (array of IDs), or null if never set */
export function loadProductOrder() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

/**
 * Apply the saved order to a products array.
 * Products not in the saved order are appended at the end.
 */
export function applySavedOrder(products) {
  const order = loadProductOrder()
  if (!order) return products

  const map = Object.fromEntries(products.map(p => [p.id, p]))
  const ordered = order.map(id => map[id]).filter(Boolean)
  const rest    = products.filter(p => !order.includes(p.id))
  return [...ordered, ...rest]
}
