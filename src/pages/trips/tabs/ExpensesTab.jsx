import React from 'react';
import { DollarSign, Plus, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ExpensesTab({
  expenses,
  expenseForm,
  showExpenseForm,
  onChangeExpenseForm,
  onSubmitExpense,
  onDeleteExpense,
  onShowForm,
  onHideForm,
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontWeight: 700, color: '#141413', fontSize: '1.2rem' }}>Expense Tracker</h2>
        <button
          onClick={onShowForm}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', background: '#141413', color: 'white', border: 'none', borderRadius: '50px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
        >
          <Plus size={16} /> Log Expense
        </button>
      </div>

      {showExpenseForm && (
        <form onSubmit={onSubmitExpense} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#141413' }}>Add Expense</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#5e5d59' }}>Category</label>
              <select
                value={expenseForm.category}
                onChange={e => onChangeExpenseForm('category', e.target.value)}
                style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #f0eee6', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }}
              >
                {['food', 'transport', 'accommodation', 'activities', 'shopping', 'misc'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#5e5d59' }}>Amount (₹)</label>
              <input
                type="number"
                min={1}
                required
                value={expenseForm.amount_inr}
                onChange={e => onChangeExpenseForm('amount_inr', e.target.value)}
                style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #f0eee6', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }}
                placeholder="0"
              />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#5e5d59' }}>Description</label>
            <input
              type="text"
              required
              value={expenseForm.description}
              onChange={e => onChangeExpenseForm('description', e.target.value)}
              style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #f0eee6', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }}
              placeholder="e.g. Lunch at cafe"
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" style={{ flex: 1, padding: '0.75rem', background: '#141413', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>Save</button>
            <button type="button" onClick={onHideForm} style={{ padding: '0.75rem 1.5rem', background: '#faf9f5', color: '#5e5d59', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Chart */}
      {expenses.length > 0 && (() => {
        const byCategory = {};
        expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount_inr || 0); });
        const chartData = Object.entries(byCategory).map(([k, v]) => ({ category: k, actual: v }));
        return (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontWeight: 700, color: '#141413', marginBottom: '1rem', fontSize: '1rem' }}>Spending by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#5e5d59' }} />
                <YAxis tick={{ fontSize: 12, fill: '#5e5d59' }} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Actual']} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="actual" fill="#141413" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid #faf9f5', paddingTop: '1rem' }}>
              <span style={{ fontWeight: 600, color: '#5e5d59' }}>Total Spent</span>
              <span style={{ fontWeight: 800, color: '#141413', fontSize: '1.1rem' }}>
                ₹{expenses.reduce((s, e) => s + (e.amount_inr || 0), 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        );
      })()}

      {expenses.length > 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {expenses.map((exp, i) => (
            <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: i < expenses.length - 1 ? '1px solid #f5f4ed' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#141413', fontSize: '0.9rem' }}>{exp.description}</div>
                <div style={{ fontSize: '0.78rem', color: '#87867f', marginTop: '2px', textTransform: 'capitalize' }}>{exp.category} • Day {exp.trip_day}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: '#141413' }}>₹{Number(exp.amount_inr).toLocaleString('en-IN')}</span>
                <button onClick={() => onDeleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: '#87867f', cursor: 'pointer', padding: '4px' }}>
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#5e5d59' }}>
          <DollarSign size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>No expenses logged yet. Track your spending as you travel!</p>
        </div>
      )}
    </div>
  );
}
