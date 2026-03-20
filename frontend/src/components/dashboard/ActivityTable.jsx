const ActivityTable = ({ activities }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Pending':   return 'bg-blue-100 text-blue-700';
      case 'Failed':    return 'bg-red-100 text-red-700';
      default:          return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="ant-card overflow-hidden">
      <div className="ant-card-head">
        <h3 className="text-[16px] font-medium text-gray-900">Recent Payroll Activity</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="ant-table">
          <thead className="ant-table-thead">
            <tr>
              <th>Batch ID</th>
              <th>Count</th>
              <th>Net Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody className="ant-table-tbody">
            {activities.map((item, i) => (
              <tr key={i}>
                <td><span className="font-medium text-gray-900">{item.id}</span></td>
                <td>{item.count} users</td>
                <td><span className="font-semibold text-gray-800">{item.amount}</span></td>
                <td>
                  <span className={`ant-badge ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.date}</td>
                <td className="text-right">
                  <button className="text-[#1677FF] hover:underline font-medium">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;
