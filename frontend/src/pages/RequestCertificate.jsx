import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitCSR } from '../redux/certificateSlice';
import { toast } from 'react-toastify';

const RequestCertificate = () => {
  const dispatch = useDispatch();
  const [commonName, setCommonName] = useState('');
  const [csrContent, setCSRcontent] = useState('');
  const { loading, error, message } = useSelector(state => state.certificate);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!commonName.trim() || !csrContent.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    dispatch(submitCSR({ commonName, csrContent }));
    setCommonName('');
    setCSRcontent('');
  };
  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.info(message);
  }, [error, message]);

  return (
    <div className="max-w-2xl mx-auto my-10 px-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Request New Certificate</h2>
          </div>
          <p className="mt-1 text-indigo-100">Submit your certificate signing request for processing</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="commonName" className="block text-sm font-medium text-gray-700 mb-1">
              Common Name
            </label>
            <input
              type="text"
              id="commonName"
              placeholder="e.g. yourdomain.com or application name"
              value={commonName}
              onChange={(e) => setCommonName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <p className="mt-1 text-sm text-gray-500">The fully qualified domain name (FQDN) for your certificate</p>
          </div>

          <div>
            <label htmlFor="csrContent" className="block text-sm font-medium text-gray-700 mb-1">
              CSR Content
            </label>
            <textarea
              id="csrContent"
              placeholder="-----BEGIN CERTIFICATE REQUEST-----\n...\n-----END CERTIFICATE REQUEST-----"
              value={csrContent}
              onChange={(e) => setCSRcontent(e.target.value)}
              required
              className="w-full min-h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-mono text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">Paste your complete Certificate Signing Request (CSR)</p>
          </div>

          <div className="flex items-center">
            <button
              disabled={loading}
              type="submit"
              className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Request
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setCommonName('');
                setCSRcontent('');
              }}
              className="ml-4 px-4 py-3 text-gray-600 hover:text-gray-900 font-medium"
            >
              Clear Form
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default RequestCertificate;