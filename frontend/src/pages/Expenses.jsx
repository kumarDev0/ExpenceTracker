import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const CATEGORIES = ['food', 'transport', 'entertainment', 'shopping', 'health', 'other'];

const categoryEmoji = {
  food: '🍕', transport: '🚗', entertainment: '🎬',
  shopping: '🛒', health: '💊', other: '📦'
};

const COLORS = {
  food: '#6366f1', transport: '#f59e0b', entertainment: '#8b5cf6',
  shopping: '#ec4899', health: '#10b981', other: '#ef4444'
};

const today = new Date().toISOString().split('T')[0];
const emptyForm = { title: '', amount: '', category: 'food', date: today };

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, [filterCategory]);

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

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, form);
      } else {
        await api.post('/expenses', form);
      }
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

  const handleEdit = (exp) => {
    setForm({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      date: exp.date.split('T')[0]
    });
    setEditingId(exp.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(exp => exp.id !== id));
      setDeleteId(null);
    } catch (err) {
      alert('Delete nahi hua — try again');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
  };

  const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <>
      <Navbar />
      <div style={s.page}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>💸 Meri Expenses</h2>
            <p style={s.subtitle}>
              {expenses.length} expenses · Total: ₹{total.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setForm(emptyForm);
            }}
            style={showForm ? s.cancelTopBtn : s.addBtn}
          >
            {showForm ? '✕ Cancel' : '+ Add Expense'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={s.formBox}>
            <h3 style={s.formTitle}>
              {editingId ? '✏️ Expense Edit Karo' : '➕ Naya Expense Add Karo'}
            </h3>

            {formError && <div style={s.formError}>⚠️ {formError}</div>}

            <form onSubmit={handleSubmit}>
              <div style={s.formGrid}>
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
                <button
                  type="submit"
                  style={s.saveBtn}
                  disabled={formLoading}
                >
                  {formLoading ? '⏳ Saving...' : editingId ? '✓ Update Karo' : '✓ Add Karo'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={s.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div style={s.filterRow}>
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

        {/* List */}
        {loading ? (
          <div style={s.center}>⏳ Load ho raha hai...</div>
        ) : error ? (
          <div style={s.center}>
            <p style={{ color: '#dc2626' }}>{error}</p>
            <button onClick={fetchExpenses} style={s.retryBtn}>Retry</button>
          </div>
        ) : expenses.length === 0 ? (
          <div style={s.emptyBox}>
            <p style={s.emptyEmoji}>🤷</p>
            <p style={s.emptyText}>
              {filterCategory
                ? `${categoryEmoji[filterCategory]} ${filterCategory} mein koi expense nahi`
                : 'Koi expense nahi abhi tak'}
            </p>
            {!filterCategory && (
              <button
                onClick={() => setShowForm(true)}
                style={s.addBtn}
              >
                + Pehla Expense Add Karo
              </button>
            )}
          </div>
        ) : (
          <div style={s.list}>
            {expenses.map(exp => (
              <div key={exp.id} style={s.expCard}>
                {/* Icon */}
                <div style={{
                  ...s.expIcon,
                  background: COLORS[exp.category] + '15'
                }}>
                  <span style={{ fontSize: '24px' }}>
                    {categoryEmoji[exp.category]}
                  </span>
                </div>

                {/* Info */}
                <div style={s.expInfo}>
                  <p style={s.expTitle}>{exp.title}</p>
                  <div style={s.expMeta}>
                    <span style={{
                      ...s.catBadge,
                      background: COLORS[exp.category] + '15',
                      color: COLORS[exp.category]
                    }}>
                      {exp.category}
                    </span>
                    <span style={s.expDate}>
                      {exp.date?.split('T')[0]}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <p style={{
                  ...s.expAmount,
                  color: COLORS[exp.category]
                }}>
                  ₹{parseFloat(exp.amount).toLocaleString()}
                </p>

                {/* Actions */}
                <div style={s.actions}>
                  <button
                    onClick={() => handleEdit(exp)}
                    style={s.editBtn}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteId(exp.id)}
                    style={s.deleteBtn}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteId && (
          <div style={s.modalOverlay}>
            <div style={s.modal}>
              <p style={s.modalEmoji}>🗑️</p>
              <h3 style={s.modalTitle}>Delete karna chahte ho?</h3>
              <p style={s.modalSub}>Ye action undo nahi ho sakta</p>
              <div style={s.modalBtns}>
                <button
                  onClick={() => handleDelete(deleteId)}
                  style={s.modalDelete}
                >
                  Haan, Delete Karo
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  style={s.modalCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const s = {
  page: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
  },
  addBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  cancelTopBtn: {
    padding: '10px 20px',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  formBox: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '1.5rem',
    border: '1px solid #e2e8f0',
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '1.25rem',
    color: '#1a1a2e',
  },
  formError: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '10px 16px',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '14px',
    border: '1px solid #fecaca',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '10px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#f8fafc',
    width: '100%',
    boxSizing: 'border-box',
  },
  formBtns: {
    display: 'flex',
    gap: '10px',
    marginTop: '1.25rem',
  },
  saveBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  cancelBtn: {
    padding: '10px 24px',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '1.25rem',
  },
  filterBtn: {
    padding: '7px 14px',
    background: 'white',
    border: '1.5px solid #e2e8f0',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
  },
  filterActive: {
    padding: '7px 14px',
    background: '#6366f1',
    border: '1.5px solid #6366f1',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'white',
    fontWeight: '600',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  expCard: {
    background: 'white',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9',
  },
  expIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  expInfo: { flex: 1 },
  expTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '4px',
  },
  expMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  catBadge: {
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  expDate: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  expAmount: {
    fontSize: '16px',
    fontWeight: '700',
    minWidth: '80px',
    textAlign: 'right',
  },
  actions: {
    display: 'flex',
    gap: '6px',
  },
  editBtn: {
    padding: '8px',
    background: '#eff6ff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  deleteBtn: {
    padding: '8px',
    background: '#fef2f2',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  center: {
    textAlign: 'center',
    padding: '3rem',
    color: '#94a3b8',
    fontSize: '16px',
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem',
    gap: '1rem',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  emptyEmoji: {
    fontSize: '48px',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: '16px',
  },
  retryBtn: {
    padding: '10px 24px',
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: 'white',
    padding: '2rem',
    borderRadius: '20px',
    maxWidth: '380px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalEmoji: {
    fontSize: '48px',
    marginBottom: '1rem',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '8px',
  },
  modalSub: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '1.5rem',
  },
  modalBtns: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  modalDelete: {
    padding: '12px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
  },
  modalCancel: {
    padding: '12px',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
  },
};

export default Expenses;