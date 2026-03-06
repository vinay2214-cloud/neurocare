import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function PatientSidebar({ selectedId, onSelect }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/patients').then(res => setPatients(res.data.patients || []));
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-[280px] bg-white border-r border-nc-grey-pale h-full flex flex-col">
      <div className="p-4 border-b border-nc-grey-pale">
        <h2 className="text-sm font-bold text-nc-blue-deep mb-2">Patients</h2>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="nc-input text-sm"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map(p => (
          <button key={p.id}
            onClick={() => onSelect(p)}
            className={`w-full text-left px-4 py-3 border-b border-nc-grey-pale transition-all duration-safe
              ${selectedId === p.id
                ? 'bg-nc-blue-tint border-l-4 border-l-nc-blue-mid'
                : 'hover:bg-nc-beige'}`}
          >
            <p className="font-bold text-sm text-nc-grey-dark">{p.name}</p>
            <p className="text-xs text-nc-grey-mid">{p.code}</p>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-nc-grey-mid p-4">No patients found</p>
        )}
      </div>
    </aside>
  );
}
