import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { verfiyReport,getReports } from '../api';

export default function ReportList() {
  const [reports, setReports] = useState([]);
  const [verifying, setVerifying] = useState({});
  const { user } = useOutletContext();

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await getReports();
        setReports(res.data || []);
      } catch (err) {
        console.error('Failed to load reports', err);
      }
    };
    loadReports();
  }, []);

  const handleVerify = async (report_id) => {
    try {
      setVerifying(prev => ({ ...prev, [report_id]: true }));
      const res = await verfiyReport(report_id);
      setReports(prev =>
        prev.map(r => r.id === report_id ? { ...r, verification_status: 'verified', verified_analysis: res.data.analysis } : r)
      );
    } catch (err) {
      console.error('Verification failed', err);
    } finally {
      setVerifying(prev => ({ ...prev, [report_id]: false }));
    }
  };

  return (
    <div className="card">
      <h2>📜 Submitted Reports</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>User</th>
            <th>Disaster</th>
            <th>Image</th>
            <th>Content</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id}>
              <td>{r.user_id}</td>
              <td>{r.disaster_id}</td>
              <td><a href={r.image_url} target="_blank">View</a></td>
              <td>{r.content}</td>
              <td>{r.verification_status}</td>
              <td>
                {r.verification_status === 'pending' ? (
                  <button onClick={() => handleVerify(r.id)} disabled={verifying[r.id]}>
                    {verifying[r.id] ? 'Checking...' : 'Verify'}
                  </button>
                ) : (
                  <span>✅ Done</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
