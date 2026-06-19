export function StatCard({ title, value, subtitle, icon, color = 'blue', trend }) {
  const colors = {
    blue: { text: 'text-blue-600', iconBg: 'bg-blue-50', iconText: 'text-blue-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]' },
    green: { text: 'text-green-600', iconBg: 'bg-green-50', iconText: 'text-green-500', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]' },
    red: { text: 'text-red-600', iconBg: 'bg-red-50', iconText: 'text-red-500', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
    yellow: { text: 'text-yellow-600', iconBg: 'bg-yellow-50', iconText: 'text-yellow-500', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]' },
    purple: { text: 'text-purple-600', iconBg: 'bg-purple-50', iconText: 'text-purple-500', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]' },
  };

  const c = colors[color] || colors.blue;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 flex items-center gap-1 font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {trend > 0 ? (
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-green-100"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg></span>
              ) : trend < 0 ? (
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-100"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></span>
              ) : null}
              {Math.abs(trend)}% vs last period
            </p>
          )}
          {subtitle && <p className="text-xs mt-2 text-gray-400">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg} ${c.iconText} ${c.glow}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
