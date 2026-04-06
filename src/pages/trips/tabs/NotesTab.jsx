import React from 'react';

export default function NotesTab({ notes, savingNotes, onChangeNotes, onSaveNotes }) {
  return (
    <div>
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Trip Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          onBlur={onSaveNotes}
          placeholder="Add notes, reminders, and important details about your trip..."
          style={{ width: '100%', minHeight: '200px', padding: '1rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none', resize: 'vertical', lineHeight: 1.6, color: '#1e293b' }}
        />
        <button
          onClick={onSaveNotes}
          disabled={savingNotes}
          style={{ marginTop: '0.75rem', padding: '0.7rem 1.5rem', background: savingNotes ? '#94a3b8' : '#1e293b', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: savingNotes ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
        >
          {savingNotes ? 'Saving...' : 'Save Notes'}
        </button>
      </div>
    </div>
  );
}
