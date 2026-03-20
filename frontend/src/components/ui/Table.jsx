import React from 'react';

const Table = ({ headers = [], children, className = '', loading = false, emptyMessage = 'No data found' }) => {
  return (
    <div className={`bg-surface-card border border-border rounded-card shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-surface border-b border-border">
              {headers.map((header, idx) => (
                <th key={idx}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse h-[52px]">
                  {headers.map((_, j) => (
                    <td key={j}>
                      <div className="h-4 bg-surface rounded w-full"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : React.Children.count(children) === 0 ? (
              <tr>
                <td colSpan={headers.length} className="text-center text-text-muted italic py-12">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
