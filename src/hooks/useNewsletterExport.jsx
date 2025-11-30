import { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from 'db/config';

export const useNewsletterExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const exportSubscribers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newsletterRef = collection(db, 'newsletter');
      const snapshot = await getDocs(newsletterRef);
      
      const subscribers = [];
      snapshot.forEach((doc) => {
        subscribers.push({
          email: doc.data().email,
          subscribedAt: doc.data().subscribedAt || 'N/A',
          id: doc.id
        });
      });

      // Convert to CSV
      const csvContent = convertToCSV(subscribers);
      
      // Download CSV file
      downloadCSV(csvContent, 'newsletter-subscribers.csv');
      
      return subscribers;
    } catch (err) {
      console.error('Error exporting subscribers:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    // CSV headers
    const headers = ['Email Address', 'Subscribed Date', 'ID'];
    const csvRows = [headers.join(',')];
    
    // CSV rows
    data.forEach(row => {
      const values = [
        row.email,
        row.subscribedAt,
        row.id
      ];
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return { exportSubscribers, loading, error };
};
