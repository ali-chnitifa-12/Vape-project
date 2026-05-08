import { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { saveProductOrder, loadProductOrder } from '../utils/productOrder';
import './Admin.css';

/* ─── tiny sparkline component ─────────────────────────── */
function Sparkline({ data = [], color = '#00d4ff' }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="sparkline">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword]   = useState('');
  const [activeTab, setActiveTab] = useState('analytics');

  const [products, setProducts] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  // drag-and-drop layout state
  const [layoutItems, setLayoutItems] = useState([]);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [layoutSaved, setLayoutSaved] = useState(false);
  const [editingId,   setEditingId]  = useState(null);
  const [imageFile,   setImageFile]  = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: 'Device', price: '', originalPrice: '', stock: '', outOfStock: false
  });

  /* ── auth ──────────────────────────────────────────────── */
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      fetchProducts();
      fetchOrders();
      toast.success('Welcome back, Admin 👋');
    } else {
      toast.error('Incorrect password');
    }
  };

  /* ── data fetching ─────────────────────────────────────── */
  const fetchProducts = async () => {
    try {
      const res  = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
      setLoading(false);
      // initialise layout: respect existing saved order
      const savedOrder = loadProductOrder();
      if (savedOrder) {
        const map = Object.fromEntries(data.map(p => [p.id, p]));
        const ordered = savedOrder.map(id => map[id]).filter(Boolean);
        const rest    = data.filter(p => !savedOrder.includes(p.id));
        setLayoutItems([...ordered, ...rest]);
      } else {
        setLayoutItems(data);
      }
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const res  = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.sort((a, b) => b.id - a.id));
    } catch (err) { console.error(err); }
  };

  // auto-refresh every 60 s
  useEffect(() => {
    if (!isAuthenticated) return;
    const id = setInterval(() => { fetchOrders(); fetchProducts(); }, 60_000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  /* ── analytics computations ────────────────────────────── */
  const analytics = useMemo(() => {
    if (!orders.length) return null;

    const paid = orders.filter(o => o.status !== 'cancelled');

    // total revenue
    const totalRevenue = paid.reduce((s, o) => s + parseFloat(o.total || 0), 0);

    // average order value
    const avgOrder = paid.length ? totalRevenue / paid.length : 0;

    // orders by day (last 14 days)
    const now = Date.now();
    const DAY = 86_400_000;
    const last14 = Array.from({ length: 14 }, (_, i) => {
      const day = new Date(now - (13 - i) * DAY);
      return day.toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit' });
    });
    const revenuePerDay = last14.map(label => {
      const total = paid
        .filter(o => {
          const d = new Date(o.date);
          return d.toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit' }) === label;
        })
        .reduce((s, o) => s + parseFloat(o.total || 0), 0);
      return { label, total };
    });

    // orders per week (current vs last)
    const thisWeek = paid.filter(o => now - new Date(o.date) < 7 * DAY).length;
    const lastWeek = paid.filter(o => {
      const diff = now - new Date(o.date);
      return diff >= 7 * DAY && diff < 14 * DAY;
    }).length;
    const weekGrowth = lastWeek === 0 ? 100 : ((thisWeek - lastWeek) / lastWeek) * 100;

    // revenue this month vs last
    const thisMonth = new Date().getMonth();
    const thisYear  = new Date().getFullYear();
    const revThisMonth = paid
      .filter(o => { const d = new Date(o.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; })
      .reduce((s, o) => s + parseFloat(o.total || 0), 0);
    const revLastMonth = paid
      .filter(o => { const d = new Date(o.date); const m = (thisMonth - 1 + 12) % 12; return d.getMonth() === m; })
      .reduce((s, o) => s + parseFloat(o.total || 0), 0);
    const monthGrowth = revLastMonth === 0 ? 100 : ((revThisMonth - revLastMonth) / revLastMonth) * 100;

    // best selling products
    const productMap = {};
    paid.forEach(o => {
      (o.items || []).forEach(item => {
        if (!productMap[item.name]) productMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
        productMap[item.name].qty     += item.qty;
        productMap[item.name].revenue += item.qty * parseFloat(item.price || 0);
      });
    });
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
    const maxQty = topProducts[0]?.qty || 1;

    // orders by status
    const byStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // category breakdown
    const catMap = {};
    paid.forEach(o => {
      (o.items || []).forEach(item => {
        const cat = item.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
    });

    return {
      totalRevenue, avgOrder, totalOrders: orders.length, paidOrders: paid.length,
      revenuePerDay, thisWeek, weekGrowth, revThisMonth, monthGrowth,
      topProducts, maxQty, byStatus, catMap,
    };
  }, [orders]);

  /* ── product CRUD ──────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    toast.success('Product deleted');
    fetchProducts();
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setImageFile(null);
    setFormData({ name: p.name, category: p.category, price: p.price, originalPrice: p.originalPrice || '', stock: p.stock, outOfStock: p.outOfStock });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setImageFile(null);
    setFormData({ name: '', category: 'Device', price: '', originalPrice: '', stock: '', outOfStock: false });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const tId  = toast.loading('Saving...');
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (imageFile) data.append('imageFile', imageFile);

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url    = editingId ? `/api/products/${editingId}` : `/api/products`;
      const res    = await fetch(url, { method, body: data });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success(editingId ? 'Updated' : 'Added', { id: tId });
      handleCancelEdit();
      fetchProducts();
    } catch (err) {
      toast.error(`Error: ${err.message}`, { id: tId });
    }
  };

  /* ── drag-and-drop layout handlers ────────────────────────── */
  const handleDragStart = (idx) => {
    setDraggingIdx(idx);
    setLayoutSaved(false);
  };

  const handleDragEnter = (idx) => setDragOverIdx(idx);

  const handleDrop = (dropIdx) => {
    if (draggingIdx === null || draggingIdx === dropIdx) return;
    const next = [...layoutItems];
    const [moved] = next.splice(draggingIdx, 1);
    next.splice(dropIdx, 0, moved);
    setLayoutItems(next);
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleSaveLayout = () => {
    saveProductOrder(layoutItems.map(p => p.id));
    setLayoutSaved(true);
    toast.success('✅ Product order saved! Home & Shop updated.');
  };

  const handleResetLayout = () => {
    setLayoutItems(products);
    saveProductOrder(products.map(p => p.id));
    setLayoutSaved(false);
    toast('🔄 Order reset to default');
  };

  /* ── login gate ─────────────────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="noise-overlay" />
        <div className="grid-bg" />
        <form onSubmit={handleLogin} className="glass-card" style={{ padding: '3rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--cyan)' }}>Admin Access</h2>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="input-field" placeholder="Enter password..." style={{ marginBottom: '1rem', width: '100%' }} required />
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Login</button>
        </form>
      </div>
    );
  }

  /* ── main render ─────────────────────────────────────────── */
  return (
    <div className="admin-page">
      <div className="container">

        <div className="admin-header">
          <h1 className="admin-page__title">Admin <span className="gradient-text">Dashboard</span></h1>
          <div className="admin-tabs">
            {[
              { key: 'analytics', label: '📊 Analytics' },
              { key: 'layout',    label: '🎨 Layout'    },
              { key: 'products',  label: '📦 Products'  },
              { key: 'orders',    label: `🧾 Orders (${orders.length})` },
            ].map(t => (
              <button key={t.key} className={`admin-tab ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* ══════════════════ LAYOUT TAB ══════════════════ */}
        {activeTab === 'layout' && (
          <div className="layout-wrapper">
            <div className="layout-header">
              <div>
                <h2 className="layout-title">🎨 Product Display Order</h2>
                <p className="layout-subtitle">
                  Drag &amp; drop the cards to reorder. The first 4 appear on the Home page as <strong>Featured Drops</strong>. All positions apply to the Shop page too.
                </p>
              </div>
              <div className="layout-actions">
                <button className="btn-outline" onClick={handleResetLayout}><span>↺ Reset</span></button>
                <button className="btn-primary" onClick={handleSaveLayout}>
                  <span>{layoutSaved ? '✅ Saved!' : 'Save Order'}</span>
                  {!layoutSaved && <span>→</span>}
                </button>
              </div>
            </div>

            {/* Featured preview strip */}
            <div className="layout-featured-hint glass-card">
              <span className="layout-featured-label">⭐ HOME FEATURED (first 4)</span>
              <div className="layout-featured-strip">
                {layoutItems.slice(0, 4).map((p, i) => (
                  <div key={p.id} className="layout-featured-thumb">
                    <img src={p.image} alt={p.name} />
                    <span>{i + 1}. {p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drag-and-drop grid */}
            <div className="layout-grid">
              {layoutItems.map((p, idx) => (
                <div
                  key={p.id}
                  className={`layout-card glass-card
                    ${draggingIdx === idx  ? 'layout-card--dragging'  : ''}
                    ${dragOverIdx  === idx ? 'layout-card--dragover'  : ''}
                    ${idx < 4             ? 'layout-card--featured'  : ''}
                  `}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="layout-card__drag-handle" title="Drag to reorder">
                    <span /><span /><span />
                  </div>

                  {idx < 4 && (
                    <div className="layout-card__featured-badge">⭐ #{idx + 1}</div>
                  )}

                  <div className="layout-card__pos">{idx + 1}</div>

                  <img src={p.image} alt={p.name} className="layout-card__img" />

                  <div className="layout-card__info">
                    <div className="layout-card__cat">{p.category}</div>
                    <div className="layout-card__name">{p.name}</div>
                    <div className="layout-card__price">{parseFloat(p.price).toFixed(2)} MAD</div>
                  </div>

                  <div className="layout-card__stock">
                    {p.outOfStock
                      ? <span className="status-badge status-out">Out of Stock</span>
                      : <span className="status-badge status-in">In Stock</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="layout-footer">
              <button className="btn-primary" onClick={handleSaveLayout} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                <span>{layoutSaved ? '✅ Order Saved!' : '💾 Save Display Order'}</span>
                {!layoutSaved && <span>→</span>}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════ ANALYTICS TAB ══════════════════ */}
        {activeTab === 'analytics' && (
          <div className="analytics-wrapper">

            {/* KPI cards */}
            <div className="kpi-grid">
              <div className="kpi-card glass-card">
                <div className="kpi-icon" style={{ background: 'rgba(0,212,255,.12)', color: 'var(--cyan)' }}>💰</div>
                <div>
                  <div className="kpi-label">Total Revenue</div>
                  <div className="kpi-value">{analytics ? analytics.totalRevenue.toFixed(2) : '—'} <span className="kpi-cur">MAD</span></div>
                  {analytics && <div className={`kpi-delta ${analytics.monthGrowth >= 0 ? 'pos' : 'neg'}`}>
                    {analytics.monthGrowth >= 0 ? '▲' : '▼'} {Math.abs(analytics.monthGrowth).toFixed(1)}% vs last month
                  </div>}
                </div>
                <Sparkline data={analytics?.revenuePerDay.map(d => d.total) || []} color="#00d4ff" />
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-icon" style={{ background: 'rgba(123,47,255,.12)', color: 'var(--purple-light)' }}>🛒</div>
                <div>
                  <div className="kpi-label">Total Orders</div>
                  <div className="kpi-value">{analytics?.totalOrders ?? '—'}</div>
                  {analytics && <div className={`kpi-delta ${analytics.weekGrowth >= 0 ? 'pos' : 'neg'}`}>
                    {analytics.weekGrowth >= 0 ? '▲' : '▼'} {Math.abs(analytics.weekGrowth).toFixed(1)}% vs last week
                  </div>}
                </div>
                <Sparkline data={analytics?.revenuePerDay.map(d => d.total > 0 ? 1 : 0) || []} color="#a855f7" />
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-icon" style={{ background: 'rgba(0,230,118,.12)', color: '#00e676' }}>📈</div>
                <div>
                  <div className="kpi-label">Avg Order Value</div>
                  <div className="kpi-value">{analytics ? analytics.avgOrder.toFixed(2) : '—'} <span className="kpi-cur">MAD</span></div>
                  <div className="kpi-delta pos">Per paid order</div>
                </div>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-icon" style={{ background: 'rgba(255,186,0,.1)', color: '#ffba00' }}>📦</div>
                <div>
                  <div className="kpi-label">Products in Stock</div>
                  <div className="kpi-value">{products.filter(p => !p.outOfStock).length} <span className="kpi-cur">/ {products.length}</span></div>
                  <div className="kpi-delta" style={{ color: 'var(--grey)' }}>{products.filter(p => p.outOfStock).length} out of stock</div>
                </div>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-icon" style={{ background: 'rgba(255,45,120,.1)', color: 'var(--pink)' }}>🗓️</div>
                <div>
                  <div className="kpi-label">This Month Revenue</div>
                  <div className="kpi-value">{analytics ? analytics.revThisMonth.toFixed(2) : '—'} <span className="kpi-cur">MAD</span></div>
                  <div className="kpi-delta pos">Current month</div>
                </div>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-icon" style={{ background: 'rgba(0,212,255,.08)', color: 'var(--cyan)' }}>🌟</div>
                <div>
                  <div className="kpi-label">This Week Orders</div>
                  <div className="kpi-value">{analytics?.thisWeek ?? '—'}</div>
                  <div className="kpi-delta pos">Last 7 days</div>
                </div>
              </div>
            </div>

            {/* Revenue chart (bar-like using CSS) */}
            <div className="analytics-row">
              <div className="analytics-card glass-card" style={{ flex: 2 }}>
                <h3 className="analytics-title">📅 Revenue — Last 14 Days</h3>
                <div className="bar-chart">
                  {(analytics?.revenuePerDay || []).map((d, i) => {
                    const maxVal = Math.max(...(analytics?.revenuePerDay.map(x => x.total) || [1]), 1);
                    const pct    = (d.total / maxVal) * 100;
                    return (
                      <div key={i} className="bar-col">
                        <div className="bar-tooltip">{d.total.toFixed(0)} MAD</div>
                        <div className="bar" style={{ height: `${Math.max(pct, 2)}%` }} />
                        <div className="bar-label">{d.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order status breakdown */}
              <div className="analytics-card glass-card" style={{ flex: 1 }}>
                <h3 className="analytics-title">🔖 Order Status</h3>
                <div className="status-breakdown">
                  {analytics ? Object.entries(analytics.byStatus).map(([status, count]) => (
                    <div key={status} className="status-row">
                      <span className={`status-badge status-${status === 'paid' ? 'in' : 'out'}`}>{status}</span>
                      <div className="status-bar-wrap">
                        <div className="status-bar" style={{
                          width: `${(count / orders.length) * 100}%`,
                          background: status === 'paid' ? '#00e676' : status === 'pending' ? '#ffba00' : '#ff2a5f'
                        }} />
                      </div>
                      <span className="status-count">{count}</span>
                    </div>
                  )) : <div style={{ color: 'var(--grey)', paddingTop: '2rem', textAlign: 'center' }}>No data yet</div>}
                </div>
              </div>
            </div>

            {/* Top products */}
            <div className="analytics-card glass-card">
              <h3 className="analytics-title">🏆 Top Selling Products</h3>
              {analytics?.topProducts.length ? (
                <div className="top-products">
                  {analytics.topProducts.map((p, i) => (
                    <div key={p.name} className="top-product-row">
                      <div className="top-product-rank">#{i + 1}</div>
                      <div className="top-product-name">{p.name}</div>
                      <div className="top-product-bar-wrap">
                        <div className="top-product-bar" style={{ width: `${(p.qty / analytics.maxQty) * 100}%` }} />
                      </div>
                      <div className="top-product-stats">
                        <span className="top-product-qty">{p.qty} sold</span>
                        <span className="top-product-rev">{p.revenue.toFixed(2)} MAD</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--grey)', padding: '2rem', textAlign: 'center' }}>
                  No order data yet — stats will appear automatically as orders come in.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ══════════════════ PRODUCTS TAB ══════════════════ */}
        {activeTab === 'products' && (
          <div className="admin-panel">
            <form className="admin-form" onSubmit={handleSave}>
              <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <div className="form-group">
                <label>Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" />
              </div>
              <div className="form-group">
                <label>Product Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="input-field" style={{ padding: '0.5rem' }} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input-field">
                  <option value="Device">Device</option>
                  <option value="E-Liquid">E-Liquid</option>
                  <option value="Pod System">Pod System</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (MAD)</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="input-field" />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="input-field" />
                </div>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={formData.outOfStock} onChange={e => setFormData({...formData, outOfStock: e.target.checked})} />
                  Mark as Out of Stock
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add Product'}</button>
                {editingId && <button type="button" className="btn-outline" onClick={handleCancelEdit}><span>Cancel</span></button>}
              </div>
            </form>

            <div className="admin-list">
              <h2>Product Inventory</h2>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Img</th><th>Name</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td><img src={p.image} alt={p.name} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 5, background: 'rgba(255,255,255,.05)' }} /></td>
                        <td>{p.name}</td>
                        <td>{parseFloat(p.price).toFixed(2)} MAD</td>
                        <td>{p.stock}</td>
                        <td>
                          {p.outOfStock
                            ? <span className="status-badge status-out">Out of Stock</span>
                            : <span className="status-badge status-in">In Stock</span>}
                        </td>
                        <td className="actions-cell">
                          <button onClick={() => handleEdit(p)} className="btn-edit">Edit</button>
                          <button onClick={() => handleDelete(p.id)} className="btn-delete">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ ORDERS TAB ══════════════════ */}
        {activeTab === 'orders' && (
          <div className="admin-list glass-card" style={{ padding: '2rem' }}>
            <h2>Recent Orders</h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--grey)' }}>#{order.id}</td>
                      <td>{new Date(order.date).toLocaleDateString()}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.customer?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--grey)' }}>{order.customer?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {(order.items || []).map(item => (
                            <div key={item.id}>{item.qty}x {item.name}</div>
                          ))}
                        </div>
                      </td>
                      <td style={{ color: 'var(--cyan)', fontWeight: 700 }}>{order.total} MAD</td>
                      <td>
                        <span className={`status-badge ${order.status === 'paid' ? 'status-in' : 'status-out'}`}>{order.status}</span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>No orders found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
