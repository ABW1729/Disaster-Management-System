import React from 'react';

export default function AlertsTable({ data }) {
  return (
    <div className="card">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Location</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((alert, index) => (
            <tr key={index}>
              <td style={tdStyle}>{alert.type}</td>
              <td style={tdStyle}>{alert.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  borderBottom: '2px solid #ccc',
  textAlign: 'left',
  padding: '8px',
  backgroundColor: '#f0f0f0',
};

const tdStyle = {
  borderBottom: '1px solid #eee',
  padding: '8px',
};
