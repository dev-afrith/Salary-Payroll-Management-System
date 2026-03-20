import { useState } from 'react';

const ChartCard = ({ title, subtitle }) => {
  const [timeframe, setTimeframe] = useState('Monthly');

  return (
    <div className="ant-card h-full flex flex-col">
      <div className="ant-card-head flex items-center justify-between py-16">
        <h3 className="text-[16px] font-medium text-gray-900">{title}</h3>
        <div className="flex border border-gray-200 rounded overflow-hidden">
          {['Monthly', 'Quarterly', 'Yearly'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 text-[12px] font-medium transition-colors ${
                timeframe === t 
                ? 'bg-[#1677FF] text-white' 
                : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="ant-card-body flex-1 p-24">
        <div className="relative h-64 w-full">
          {/* Business Chart Grid */}
          <div className="absolute inset-0 flex flex-col justify-between py-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-10 text-[12px] font-medium text-gray-300">
                  {100 - i * 25}%
                </span>
                <div className="h-px flex-1 bg-gray-100"></div>
              </div>
            ))}
          </div>

          {/* Clean Line Chart (Straight Segments) */}
          <svg className="absolute inset-0 h-full w-full ml-14" preserveAspectRatio="none">
             {/* Main Line - Straight segments, no curves */}
             <path
              d="M 0 180 L 100 200 L 200 120 L 300 150 L 400 80 L 500 100"
              fill="none"
              stroke="#1677FF"
              strokeWidth="2"
            />
            {/* Minimal Points */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
               const points = [180, 200, 120, 150, 80, 100];
               return (
                <circle
                  key={i}
                  cx={`${i * 20}%`}
                  cy={points[i]}
                  r="3"
                  fill="#ffffff"
                  stroke="#1677FF"
                  strokeWidth="2"
                />
               )
            })}
          </svg>

          {/* X-Axis */}
          <div className="absolute -bottom-6 left-14 right-0 flex justify-between">
            {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'].map((m) => (
              <span key={m} className="text-[12px] font-medium text-gray-400">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
