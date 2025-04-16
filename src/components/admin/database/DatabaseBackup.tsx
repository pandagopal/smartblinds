import React, { useState } from 'react';

const DatabaseBackup: React.FC = () => {
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [backupHistory, setBackupHistory] = useState([
    { id: 1, date: '2024-04-12 14:30:45', size: '38.4 MB', status: 'completed' },
    { id: 2, date: '2024-04-05 09:15:22', size: '37.2 MB', status: 'completed' },
    { id: 3, date: '2024-03-29 11:42:08', size: '36.7 MB', status: 'completed' }
  ]);
  const [selectedBackupFile, setSelectedBackupFile] = useState<File | null>(null);
  const [selectedBackupId, setSelectedBackupId] = useState<number | null>(null);
  const [backupType, setBackupType] = useState('full');

  const handleCreateBackup = () => {
    setBackupInProgress(true);

    // Simulate backup process
    setTimeout(() => {
      const newBackup = {
        id: backupHistory.length + 1,
        date: new Date().toLocaleString(),
        size: `${Math.floor(Math.random() * 10) + 38}.${Math.floor(Math.random() * 9)} MB`,
        status: 'completed'
      };

      setBackupHistory([newBackup, ...backupHistory]);
      setBackupInProgress(false);
    }, 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedBackupFile(e.target.files[0]);
    }
  };

  const handleRestore = () => {
    if (!selectedBackupId && !selectedBackupFile) {
      alert('Please select a backup to restore');
      return;
    }

    if (!window.confirm('Are you sure you want to restore this backup? This will overwrite the current database.')) {
      return;
    }

    setRestoreInProgress(true);

    // Simulate restore process
    setTimeout(() => {
      setRestoreInProgress(false);
      alert('Database restored successfully');
      setSelectedBackupId(null);
      setSelectedBackupFile(null);
    }, 5000);
  };

  const handleBackupTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBackupType(e.target.value);
  };

  const handleDownloadBackup = (id: number) => {
    // In a real implementation, this would initiate a download of the backup file
    alert(`Downloading backup #${id}`);
  };

  const handleDeleteBackup = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this backup?')) {
      return;
    }

    setBackupHistory(backupHistory.filter(backup => backup.id !== id));
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Backup & Restore</h2>
        <p className="text-gray-600 mb-4">
          Create backups of your database or restore from previous backups. Regular backups help prevent data loss.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Backup */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Create Backup</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Backup Type</label>
            <select
              value={backupType}
              onChange={handleBackupTypeChange}
              className="w-full p-2 border rounded"
              disabled={backupInProgress}
            >
              <option value="full">Full Backup</option>
              <option value="data">Data Only</option>
              <option value="schema">Schema Only</option>
            </select>
          </div>

          <button
            onClick={handleCreateBackup}
            disabled={backupInProgress}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {backupInProgress ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Backup...
              </span>
            ) : (
              'Create Backup'
            )}
          </button>
        </div>

        {/* Restore Backup */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Restore from Backup</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select from History</label>
            <select
              value={selectedBackupId || ''}
              onChange={(e) => setSelectedBackupId(Number(e.target.value) || null)}
              className="w-full p-2 border rounded mb-4"
              disabled={restoreInProgress || !!selectedBackupFile}
            >
              <option value="">-- Select a backup --</option>
              {backupHistory.map(backup => (
                <option key={backup.id} value={backup.id}>
                  {backup.date} ({backup.size})
                </option>
              ))}
            </select>

            <div className="mb-4">
              <p className="block text-sm font-medium mb-2">Or upload backup file</p>
              <input
                type="file"
                accept=".sql,.dump,.bak"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
                disabled={restoreInProgress || !!selectedBackupId}
              />
              {selectedBackupFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected file: {selectedBackupFile.name} ({Math.round(selectedBackupFile.size / 1024)} KB)
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleRestore}
            disabled={restoreInProgress || (!selectedBackupId && !selectedBackupFile)}
            className="w-full py-2 px-4 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
          >
            {restoreInProgress ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Restoring...
              </span>
            ) : (
              'Restore Database'
            )}
          </button>
        </div>
      </div>

      {/* Backup History */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Backup History</h3>

        <div className="bg-white rounded-lg overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backupHistory.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{backup.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{backup.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDownloadBackup(backup.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {backupHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No backup history available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Backup Schedule & Settings - simplified for this example */}
      <div className="mt-8 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Backup Schedule</h3>
        <p className="text-gray-600 mb-4">
          Configure automatic backup schedules for your database (feature under development).
        </p>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
          Configure Schedule
        </button>
      </div>
    </div>
  );
};

export default DatabaseBackup;
