import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './Admin.css';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Device',
    price: '',
    originalPrice: '',
    stock: '',
    outOfStock: false
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      fetchProducts();
      fetchOrders();
      toast.success('Welcome back, Admin');
    } else {
      toast.error("Incorrect password");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      const data = await res.json();
      setOrders(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setImageFile(null);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || '',
      stock: product.stock,
      outOfStock: product.outOfStock
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setImageFile(null);
    setFormData({ name: '', category: 'Device', price: '', originalPrice: '', stock: '', outOfStock: false });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const tId = toast.loading('Saving product...');
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('price', formData.price);
    if (formData.originalPrice) data.append('originalPrice', formData.originalPrice);
    data.append('stock', formData.stock);
    data.append('outOfStock', formData.outOfStock);
    
    if (imageFile) {
      data.append('imageFile', imageFile);
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:5000/api/products/${editingId}` 
        : `http://localhost:5000/api/products`;

      await fetch(url, {
        method: method,
        body: data
      });

      toast.success(editingId ? 'Product updated' : 'Product added', { id: tId });
      handleCancelEdit();
      fetchProducts();
    } catch (error) {
      toast.error('Error saving product', { id: tId });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="noise-overlay" />
        <div className="grid-bg" />
        <form onSubmit={handleLogin} className="glass-card" style={{ padding: '3rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--cyan)' }}>Admin Access</h2>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="input-field" 
            placeholder="Enter password..." 
            style={{ marginBottom: '1rem', width: '100%' }} 
            required
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1 className="admin-page__title">Admin <span className="gradient-text">Dashboard</span></h1>
          <div className="admin-tabs">
            <button 
              className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
            <button 
              className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders ({orders.length})
            </button>
          </div>
        </div>

        {activeTab === 'products' ? (
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
                  <label>Price</label>
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
                <button type="submit" className="btn-primary">{editingId ? 'Update Product' : 'Add Product'}</button>
                {editingId && <button type="button" className="btn-outline" onClick={handleCancelEdit}>Cancel</button>}
              </div>
            </form>

            <div className="admin-list">
              <h2>Product Inventory</h2>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Img</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td><img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '5px', background: 'rgba(255,255,255,0.05)' }} /></td>
                        <td>{p.name}</td>
                        <td>${p.price.toFixed(2)}</td>
                        <td>{p.stock}</td>
                        <td>
                          {p.outOfStock ? <span className="status-badge status-out">Out of Stock</span> : <span className="status-badge status-in">In Stock</span>}
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
        ) : (
          <div className="admin-list glass-card" style={{ padding: '2rem' }}>
            <h2>Recent Orders</h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--grey)' }}>#{order.id}</td>
                      <td>{new Date(order.date).toLocaleDateString()}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.customer.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--grey)' }}>{order.customer.email}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {order.items.map(item => (
                            <div key={item.id}>{item.qty}x {item.name}</div>
                          ))}
                        </div>
                      </td>
                      <td style={{ color: 'var(--cyan)', fontWeight: 700 }}>${order.total}</td>
                      <td>
                        <span className="status-badge status-in">{order.status}</span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>No orders found</td>
                    </tr>
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

