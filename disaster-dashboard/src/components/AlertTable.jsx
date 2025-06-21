import React from 'react';

export default function AlertsTable({ data }) {
  return (
    <div className="card">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Heading</th>
            <th style={thStyle}>Description</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((alert, index) => (
            <tr key={index}>
              <td style={tdStyle}>{alert.heading}</td>
              <td style={tdStyle}>{alert.description}</td>
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
