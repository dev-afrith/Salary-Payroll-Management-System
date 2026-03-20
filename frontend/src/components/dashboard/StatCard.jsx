const StatCard = ({ label, value, color = 'blue', isIncrease, change }) => {
  const statusColors = {
    blue: 'bg-[#1677FF]',
    emerald: 'bg-[#52C41A]',
    amber: 'bg-[#FAAD14]',
    rose: 'bg-[#FF4D4F]',
  };

  return (
    <div className="ant-card metric-card animate-fade-in">
      <div className={`metric-indicator ${statusColors[color]}`}></div>
      <div className="p-24 pb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[14px] font-medium text-gray-500">{label}</span>
          <div className={`text-[12px] font-medium ${isIncrease ? 'text-[#52C41A]' : 'text-[#FF4D4F]'}`}>
            {isIncrease ? '↑' : '↓'} {change}%
          </div>
        </div>
        <div className="text-[22px] font-semibold text-[#111827]">
          {value}
        </div>
      </div>
      <div className="px-24 py-12 border-t border-gray-100 bg-gray-50/30">
        <span className="text-[12px] text-gray-400">Previous: 92%</span>
      </div>
    </div>
  );
};

export default StatCard;
