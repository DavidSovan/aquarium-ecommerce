import { useEffect, useState } from 'react';
import authService from '../../services/authService';

const ROLES = ['customer', 'staff', 'driver'];

export function CustomerList() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 20;
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', role: 'driver' });
  const [createError, setCreateError] = useState('');

  useEffect(() => { loadUsers(); }, [skip, search, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = { skip, limit };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await authService.listUsers(params);
      setUsers(res.data.items);
      setTotal(res.data.total);
    } catch {} finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await authService.createUser(form);
      setShowCreate(false);
      setForm({ email: '', password: '', first_name: '', last_name: '', role: 'driver' });
      loadUsers();
    } catch (err) {
      setCreateError(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;
  const formatDate = (d) => new Date(d).toLocaleDateString();
  const userRole = (r) => r.charAt(0).toUpperCase() + r.slice(1);

  const roleColors = {
    customer: 'bg-blue-100 text-blue-800',
    staff: 'bg-purple-100 text-purple-800',
    driver: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Users</h1>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          + Create User
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search by name or email..." value={search}
            onChange={e => { setSearch(e.target.value); setSkip(0); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setSkip(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{userRole(r)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : '-'}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${roleColors[u.role] || 'bg-gray-100 text-gray-800'}`}>
                      {userRole(u.role)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(u.created_at)}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${u.is_active ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-100 text-gray-500 ring-gray-500/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => setDetail(u)} className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <button onClick={() => setSkip(Math.max(0, skip - limit))} disabled={currentPage <= 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let p;
            if (totalPages <= 5) {
              p = i + 1;
            } else if (currentPage <= 3) {
              p = i + 1;
            } else if (currentPage >= totalPages - 2) {
              p = totalPages - 4 + i;
            } else {
              p = currentPage - 2 + i;
            }
            return (
              <button key={p} onClick={() => setSkip((p - 1) * limit)}
                className={`px-3 py-1.5 text-sm border rounded-lg ${currentPage === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}>{p}</button>
            );
          })}
          <button onClick={() => setSkip(skip + limit)} disabled={currentPage >= totalPages} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            <div className="space-y-3">
              <p><span className="text-gray-500">Name:</span> {detail.first_name || detail.last_name ? `${detail.first_name || ''} ${detail.last_name || ''}`.trim() : '-'}</p>
              <p><span className="text-gray-500">Email:</span> {detail.email}</p>
              <p><span className="text-gray-500">Role:</span> {userRole(detail.role)}</p>
              <p><span className="text-gray-500">Joined:</span> {formatDate(detail.created_at)}</p>
              <p><span className="text-gray-500">Active:</span> {detail.is_active ? 'Yes' : 'No'}</p>
              <button onClick={() => setDetail(null)} className="mt-4 px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Close</button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Create User</h2>
            {createError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{createError}</div>
            )}
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" value={form.first_name}
                    onChange={e => setForm({ ...form, first_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" value={form.last_name}
                    onChange={e => setForm({ ...form, last_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
