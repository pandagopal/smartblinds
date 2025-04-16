import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';

interface TableStat {
  tableName: string;
  recordCount: number;
  lastUpdated: string;
  avgRequestTime: number;
}

interface DatabaseStatsProps {
  onRefresh?: () => void;
}

const DatabaseStats: React.FC<DatabaseStatsProps> = ({ onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    tableStats: TableStat[];
    totalRecords: number;
    dbSize: string;
    cacheStats: {
      hits: number;
      misses: number;
      hitRate: number;
      size: string;
    };
  } | null>(null);

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true);
      // This would be an actual API call in a real implementation
      // const result = await fetch('/api/admin/database/stats');
      // const data = await result.json();

      // For now, generate mock stats
      const mockStats = {
        tableStats: [
          { tableName: 'products', recordCount: 156, lastUpdated: new Date().toISOString(), avgRequestTime: 23 },
          { tableName: 'categories', recordCount: 24, lastUpdated: new Date().toISOString(), avgRequestTime: 12 },
          { tableName: 'users', recordCount: 378, lastUpdated: new Date().toISOString(), avgRequestTime: 18 },
          { tableName: 'orders', recordCount: 295, lastUpdated: new Date().toISOString(), avgRequestTime: 27 },
          { tableName: 'carts', recordCount: 43, lastUpdated: new Date().toISOString(), avgRequestTime: 15 },
          { tableName: 'vendors', recordCount: 17, lastUpdated: new Date().toISOString(), avgRequestTime: 14 },
        ],
        totalRecords: 913,
        dbSize: '42.7 MB',
        cacheStats: {
          hits: 1273,
          misses: 342,
          hitRate: 0.79,
          size: '8.2 MB'
        }
      };

      setStats(mockStats);
      setError(null);
    } catch (err) {
      console.error('Error fetching database stats:', err);
      setError('Failed to load database statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDatabaseStats();
    if (onRefresh) {
      onRefresh();
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>No database statistics available.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Database Statistics</h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Refresh Stats
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Total Records</div>
          <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Database Size</div>
          <div className="text-2xl font-bold">{stats.dbSize}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Cache Hit Rate</div>
          <div className="text-2xl font-bold">{(stats.cacheStats.hitRate * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Record Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Query Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.tableStats.map((tableStat, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{tableStat.tableName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tableStat.recordCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tableStat.lastUpdated).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tableStat.avgRequestTime} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg overflow-hidden shadow p-4">
        <h3 className="text-lg font-medium mb-4">Cache Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Cache Hits</div>
            <div className="text-xl font-semibold">{stats.cacheStats.hits.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Cache Misses</div>
            <div className="text-xl font-semibold">{stats.cacheStats.misses.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Cache Size</div>
            <div className="text-xl font-semibold">{stats.cacheStats.size}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStats;
