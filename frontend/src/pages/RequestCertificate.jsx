import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitCSR } from '../redux/certificateSlice';
import { toast } from 'react-toastify';
import { generateCSR } from '../utils/generateCSR';

const RequestCertificate = () => {
  const dispatch = useDispatch();
  const [commonName, setCommonName] = useState('');
  const [csrContent, setCSRContent] = useState('');
  const [step, setStep] = useState('input'); // input → generating → readyToSubmit
  const { loading, error, message } = useSelector((state) => state.certificate);

  // Handle CSR generation
  const handleGenerateCSR = useCallback(async (e) => {
    e.preventDefault();
    
    if (!commonName.trim()) {
      toast.error('Please enter Common Name');
      return;
    }
    
    toast.info('Generating CSR... Please wait');
    setStep('generating');

    try {
      const { pemCsr } = await generateCSR(commonName);
      setCSRContent(pemCsr);
      setStep('readyToSubmit');
      toast.success('CSR generated successfully. Review and submit.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate CSR');
      setStep('input');
    }
  }, [commonName]);

  // Handle CSR submission
  const handleSubmitCSR = useCallback(() => {
    if (!csrContent.trim()) {
      toast.error('CSR content is missing');
      return;
    }
    
    dispatch(submitCSR({ commonName, csrContent }));
    setStep('input');
  }, [csrContent, commonName, dispatch]);

  // Reset form
  const resetForm = useCallback(() => {
    setCommonName('');
    setCSRContent('');
    setStep('input');
  }, []);

  // Handle notifications
  useEffect(() => {
    if (error) toast.error(error);
    if (message) {
      toast.success(message);
      resetForm();
    }
  }, [error, message, resetForm]);

  // Form sections
  const renderInputStep = () => (
    <div className="flex items-center">
      <button
        type="submit"
        className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition"
      >
        Generate CSR
      </button>
      <button
        type="button"
        onClick={resetForm}
        className="ml-4 px-4 py-3 text-gray-600 hover:text-gray-900 font-medium"
      >
        Clear Form
      </button>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="flex items-center space-x-2">
      <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-indigo-600 font-medium">Generating CSR... Please wait</span>
    </div>
  );

  const renderReadyToSubmitStep = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Generated CSR
        </label>
        <textarea
          rows={10}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono bg-gray-50 text-sm"
          value={csrContent}
          readOnly
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSubmitCSR}
          disabled={loading}
          className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Submit CSR'}
        </button>
        
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(csrContent)}
          className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy CSR
        </button>
        
        <button
          type="button"
          onClick={resetForm}
          className="flex items-center text-gray-600 hover:text-gray-900 px-4 py-3 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          New Request
        </button>
      </div>
    </>
  );

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
          <p className="mt-1 text-indigo-100">Generate and submit your certificate signing request</p>
        </div>

        <form onSubmit={handleGenerateCSR} className="p-6 space-y-6">
          <div>
            <label htmlFor="commonName" className="block text-sm font-medium text-gray-700 mb-1">
              Common Name
            </label>
            <input
              type="text"
              id="commonName"
              placeholder="e.g. yourdomain.com"
              value={commonName}
              onChange={(e) => setCommonName(e.target.value)}
              required
              disabled={step === 'generating' || step === 'readyToSubmit'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-100"
            />
            <p className="mt-1 text-sm text-gray-500">The fully qualified domain name (FQDN) for your certificate</p>
          </div>

          {/* Conditional rendering based on step */}
          {step === 'input' && renderInputStep()}
          {step === 'generating' && renderGeneratingStep()}
          {step === 'readyToSubmit' && renderReadyToSubmitStep()}
        </form>
      </div>
    </div>
  );
};

export default RequestCertificate;