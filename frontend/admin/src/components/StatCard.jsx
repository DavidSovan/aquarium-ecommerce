export function StatCard({ title, value, subtitle, icon, color = 'blue', trend }) {
  const colors = {
    blue: { card: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: 'bg-blue-100 text-blue-600' },
    green: { card: 'bg-green-50 border-green-200', text: 'text-green-700', icon: 'bg-green-100 text-green-600' },
    red: { card: 'bg-red-50 border-red-200', text: 'text-red-700', icon: 'bg-red-100 text-red-600' },
    yellow: { card: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: 'bg-yellow-100 text-yellow-600' },
    purple: { card: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: 'bg-purple-100 text-purple-600' },
  };

  const c = colors[color] || colors.blue;

  return (
    <div className={`rounded-xl border p-5 ${c.card}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium opacity-80 mb-0.5">{title}</p>
          <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
          {trend && (
            <p className={`text-xs mt-1 flex items-center gap-0.5 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {trend > 0 ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
              ) : trend < 0 ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              ) : null}
              {Math.abs(trend)}% vs last period
            </p>
          )}
          {subtitle && <p className="text-xs mt-1 opacity-70">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${c.icon}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
