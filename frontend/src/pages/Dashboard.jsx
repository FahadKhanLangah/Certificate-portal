import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCertificates, renewCertificate, revokeCertificate } from '../redux/certificateSlice';
import { toast } from 'react-toastify';
import { FaSearch, FaSortDown, FaSortUp, FaDownload, FaEye, FaTrash, FaSync } from 'react-icons/fa';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'expDate', direction: 'asc' });
  const { user } = useSelector(state => state.auth);
  const { certificates, loading, error, message } = useSelector(state => state.certificate);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  // Fetch certificates
  useEffect(() => {
    if (user) dispatch(fetchCertificates());
  }, [dispatch, user]);

  // Handle toast messages
  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.info(message);
  }, [error, message]);

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter and sort certificates
  const filteredCertificates = certificates
    .filter(cert => 
      cert.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cert.user?.email && cert.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortConfig.key) {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
      }
      return 0;
    });

  // Action handlers
  const handleRevoke = (id) => {
    if (confirm('Are you sure you want to revoke this certificate?')) {
      dispatch(revokeCertificate(id));
    }
  };

  const handleRenew = (id) => {
    dispatch(renewCertificate(id));
  };

  const handleDownload = (id) => {
    window.open(`http://localhost:5000/api/certificates/download/${id}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Certificate Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search certificates..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleSort('expDate')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {sortConfig.direction === 'asc' ? <FaSortDown /> : <FaSortUp />}
            Sort by Expiry
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No certificates found</h3>
          <p className="text-gray-500">Try adjusting your search query</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Common Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCertificates.map(cert => {
                  const isExpired = new Date(cert.expDate) < new Date();
                  const statusClass = 
                    cert.status === 'revoked' ? 'bg-red-100 text-red-800' :
                    isExpired ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800';
                  
                  return (
                    <tr key={cert._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{cert.commonName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{cert.user?.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                          {cert.status}{isExpired && cert.status !== 'revoked' ? ' (Expired)' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        isExpired ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                        {new Date(cert.expDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleDownload(cert._id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Download"
                          >
                            <FaDownload className="w-5 h-5" />
                          </button>
                          
                          {cert.status !== 'revoked' && (
                            <button 
                              onClick={() => handleRevoke(cert._id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Revoke"
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                          )}
                          
                          {(cert.status === 'revoked' || isExpired) && (
                            <button 
                              onClick={() => handleRenew(cert._id)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Renew"
                            >
                              <FaSync className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;