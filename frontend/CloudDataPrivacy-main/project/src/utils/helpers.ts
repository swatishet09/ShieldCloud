export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function downloadCSV(data: any[], filename: string): void {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap values with commas in quotes
      const escaped = `${value}`.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  // Create and download the CSV file
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function categorizePatientsByHealthIssue(patients: any[]): Record<string, any[]> {
  return patients.reduce((categories, patient) => {
    const healthIssue = patient.healthIssue || 'Uncategorized';
    
    if (!categories[healthIssue]) {
      categories[healthIssue] = [];
    }
    
    categories[healthIssue].push(patient);
    return categories;
  }, {});
}

export function filterPatients(patients: any[], searchTerm: string): any[] {
  if (!searchTerm.trim()) return patients;
  
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  return patients.filter(patient => {
    return (
      patient.firstName.toLowerCase().includes(normalizedSearchTerm) ||
      patient.lastName.toLowerCase().includes(normalizedSearchTerm) ||
      patient.healthIssue.toLowerCase().includes(normalizedSearchTerm) ||
      patient.diagnosis.toLowerCase().includes(normalizedSearchTerm)
    );
  });
}