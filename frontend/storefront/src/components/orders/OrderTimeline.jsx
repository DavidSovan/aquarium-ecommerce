const STEPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-400', text: 'text-yellow-700', border: 'border-yellow-400' },
  processing: { bg: 'bg-blue-400', text: 'text-blue-700', border: 'border-blue-400' },
  shipped: { bg: 'bg-purple-400', text: 'text-purple-700', border: 'border-purple-400' },
  delivered: { bg: 'bg-green-400', text: 'text-green-700', border: 'border-green-400' },
  cancelled: { bg: 'bg-red-400', text: 'text-red-700', border: 'border-red-400' },
};

export function OrderTimeline({ currentStatus }) {
  const isCancelled = currentStatus === 'cancelled';
  const activeIndex = STEPS.findIndex(s => s.key === currentStatus);
  const displaySteps = isCancelled ? STEPS : STEPS;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        {displaySteps.map((step, idx) => {
          const isActive = idx === activeIndex;
          const isCompleted = idx < activeIndex;
          const colors = STATUS_COLORS[step.key] || STATUS_COLORS.pending;
          const showLine = idx < displaySteps.length - 1;

          const dotColor = isActive || isCompleted
            ? colors.bg
            : 'bg-gray-300';
          const textColor = isActive
            ? colors.text
            : isCompleted
              ? 'text-gray-600'
              : 'text-gray-400';
          const fontWeight = isActive ? 'font-bold' : 'font-medium';

          if (isCancelled && idx > activeIndex) {
            return null;
          }

          return (
            <div key={step.key} className={`flex sm:flex-col items-center sm:items-center ${isCancelled && idx === activeIndex ? 'opacity-100' : ''}`}>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${dotColor} ring-2 ring-white z-10 flex-shrink-0 ${isActive ? 'scale-125' : ''} transition-all duration-300`} />
                {showLine && (
                  <div className={`hidden sm:block w-full h-0.5 mx-1 ${isCompleted ? colors.bg : 'bg-gray-200'} transition-colors duration-300`} style={{ width: '3rem' }} />
                )}
              </div>
              <span className={`ml-2 sm:ml-0 sm:mt-1 text-xs ${textColor} ${fontWeight} whitespace-nowrap transition-all duration-300`}>
                {step.label}
              </span>
            </div>
          );
        })}
        {isCancelled && (
          <div className="flex sm:flex-col items-center sm:items-center">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-400 ring-2 ring-white z-10 scale-125 flex-shrink-0" />
            </div>
            <span className="ml-2 sm:ml-0 sm:mt-1 text-xs text-red-700 font-bold whitespace-nowrap">
              Cancelled
            </span>
          </div>
        )}
      </div>
      {!isCancelled && activeIndex >= 0 && (
        <p className="text-xs text-gray-500 mt-2 text-center sm:text-left">
          {activeIndex === STEPS.length - 1
            ? 'Order delivered'
            : `Current: ${STEPS[activeIndex].label}`}
        </p>
      )}
    </div>
  );
}
