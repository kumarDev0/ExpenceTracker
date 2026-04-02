// Expenses Page — CRUD ka poora UI
// Add, Edit, Delete, Filter — sab yahan
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const CATEGORIES = ['food', 'transport', 'entertainment', 'shopping', 'health', 'other'];

const categoryEmoji = {
  food: '🍕', transport: '🚗', entertainment: '🎬',
  shopping: '🛒', health: '💊', other: '📦'
};

// Aaj ki date default value ke liye
const today = new Date().toISOString().split('T')[0];

// Empty form state — baar baar use hoga
const emptyForm = { title: '', amount: '', category: 'food', date: today };

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = add mode, id = edit mode
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter state
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [filterCategory]); // filter change hone pe dobara fetch karo

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = filterCategory ? `?category=${filterCategory}` : '';
      const res = await api.get(`/expenses${params}`);
      setExpenses(res.data.expenses);
    } catch (err) {
      setError('Expenses load nahi hue');
    } finally {
      setLoading(false);
    }
  };

  // Form field change handler
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Spread operator: purane form ki saari values rakho, sirf jo change hua wo update karo
  };

  // Add ya Edit submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (editingId) {
        // Edit mode — PUT request
        await api.put(`/expenses/${editingId}`, form);
      } else {
        // Add mode — POST request
        await api.post('/expenses', form);
      }

      // Success — form band karo, list refresh karo
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchExpenses();

    } catch (err) {
      setFormError(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Kuch galat hua'
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Edit button click — form mein data bharo
  const handleEdit = (exp) => {
    setForm({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      date: exp.date.split('T')[0] // Date format fix
    });
    setEditingId(exp.id);
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete button click
  const handleDelete = async (id) => {
    // Confirm karo — galti se delete na ho
    if (!window.confirm('Ye expense delete karna chahte ho?')) return;

    try {
      await api.delete(`/expenses/${id}`);
      // List se hatao — API call ki zaroorat nahi
      // State directly update karo — faster feel hota hai
      setExpenses(expenses.filter(exp => exp.id !== id));
    } catch (err) {
      alert('Delete nahi hua — try again');
    }
  };

  // Cancel button
  const handleCancel = () => {
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
  };

  // Total calculate karo
  const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <>
      <Navbar />
      <div style={s.page}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>Meri Expenses</h2>
            <p style={s.subtitle}>
              {expenses.length} expenses · Total: ₹{total.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            style={s.addBtn}
          >
            + Add Expense
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div style={s.formBox}>
            <h3 style={s.formTitle}>
              {editingId ? '✏️ Expense Edit Karo' : '➕ Naya Expense'}
            </h3>

            {formError && <div style={s.err}>{formError}</div>}

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.formRow}>
                <div style={s.field}>
                  <label style={s.label}>Title</label>
                  <input
                    style={s.input}
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="Kya pe kharch kiya?"
                    required
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Amount (₹)</label>
                  <input
                    style={s.input}
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.amount}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div style={s.formRow}>
                <div style={s.field}>
                  <label style={s.label}>Category</label>
                  <select
                    style={s.input}
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {categoryEmoji[cat]} {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Date</label>
                  <input
                    style={s.input}
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div style={s.formBtns}>
                <button type="submit" style={s.saveBtn} disabled={formLoading}>
                  {formLoading ? 'Saving...' : editingId ? 'Update Karo' : 'Add Karo'}
                </button>
                <button type="button" onClick={handleCancel} style={s.cancelBtn}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        <div style={s.filterRow}>
          <span style={s.filterLabel}>Filter:</span>
          <button
            onClick={() => setFilterCategory('')}
            style={filterCategory === '' ? s.filterActive : s.filterBtn}
          >
            Sab
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={filterCategory === cat ? s.filterActive : s.filterBtn}
            >
              {categoryEmoji[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Expense List */}
        {loading ? (
          <div style={s.center}>Load ho raha hai...</div>
        ) : error ? (
          <div style={s.center}>
            <p style={{ color: '#dc2626' }}>{error}</p>
            <button onClick={fetchExpenses} style={s.addBtn}>Retry</button>
          </div>
        ) : expenses.length === 0 ? (
          <div style={s.center}>
            <p style={{ color: '#9ca3af', fontSize: '16px' }}>
              {filterCategory ? `${filterCategory} mein koi expense nahi` : 'Koi expense nahi abhi tak'}
            </p>
          </div>
        ) : (
          <div style={s.list}>
            {expenses.map(exp => (
              <div key={exp.id} style={s.expRow}>
                <span style={s.emoji}>{categoryEmoji[exp.category]}</span>

                <div style={s.expInfo}>
                  <p style={s.expTitle}>{exp.title}</p>
                  <p style={s.expMeta}>{exp.category} · {exp.date?.split('T')[0]}</p>
                </div>

                <p style={s.expAmount}>₹{parseFloat(exp.amount).toLocaleString()}</p>

                <div style={s.actions}>
                  <button onClick={() => handleEdit(exp)} style={s.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(exp.id)} style={s.deleteBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const s = {
  page: { maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: '#888' },
  addBtn: { padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
  formBox: { background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '20px' },
  formTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '16px' },
  err: { background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input: { padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  formBtns: { display: 'flex', gap: '10px', marginTop: '4px' },
  saveBtn: { padding: '10px 24px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
  cancelBtn: { padding: '10px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  filterRow: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' },
  filterLabel: { fontSize: '13px', color: '#888' },
  filterBtn: { padding: '6px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' },
  filterActive: { padding: '6px 12px', background: '#6366f1', color: 'white', border: '1px solid #6366f1', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  expRow: { background: 'white', padding: '1rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  emoji: { fontSize: '28px' },
  expInfo: { flex: 1 },
  expTitle: { fontSize: '15px', fontWeight: '500', marginBottom: '2px' },
  expMeta: { fontSize: '12px', color: '#9ca3af' },
  expAmount: { fontSize: '16px', fontWeight: '700', color: '#1f2937', minWidth: '80px', textAlign: 'right' },
  actions: { display: 'flex', gap: '8px' },
  editBtn: { padding: '6px 12px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  deleteBtn: { padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  center: { textAlign: 'center', padding: '3rem', color: '#9ca3af' }
};

export default Expenses;