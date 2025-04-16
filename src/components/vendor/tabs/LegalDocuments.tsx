import React, { useState, useEffect, useRef } from 'react';
import { authService } from '../../../services/authService';

interface Document {
  id: string;
  name: string;
  type: string;
  description: string;
  uploadDate: string;
  expiryDate: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes: string;
  fileData: string | null; // Base64 encoded file
}

interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

const LegalDocuments: React.FC = () => {
  const documentTypes: DocumentType[] = [
    { id: 'business-license', name: 'Business License', description: 'Government-issued business or operating license', required: true },
    { id: 'tax-id', name: 'Tax ID / EIN', description: 'Tax identification document or EIN certificate', required: true },
    { id: 'insurance', name: 'Insurance Certificate', description: 'Proof of business insurance', required: false },
    { id: 'reseller-permit', name: 'Reseller Permit', description: 'Document authorizing tax-free reselling', required: false },
    { id: 'warranty-agreement', name: 'Warranty Agreement', description: 'Signed warranty agreement document', required: false },
    { id: 'other', name: 'Other Document', description: 'Any other relevant legal or KYC document', required: false }
  ];

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active document for upload/edit
  const [activeDocumentType, setActiveDocumentType] = useState<string>('');
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    description: '',
    expiryDate: '',
    fileData: null as string | null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing documents
  useEffect(() => {
    const loadDocuments = () => {
      const user = authService.getCurrentUser();

      if (user?.vendorInfo?.legalDocuments) {
        setDocuments(user.vendorInfo.legalDocuments);
      } else {
        setDocuments([]);
      }

      setIsLoading(false);
    };

    loadDocuments();
  }, []);

  const getDocumentTypeInfo = (typeId: string): DocumentType => {
    return documentTypes.find(dt => dt.id === typeId) ||
      { id: 'unknown', name: 'Unknown Document Type', description: 'Unknown document type', required: false };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUploadFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF, images, and common document formats)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif',
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Invalid file type. Please upload a PDF, image, or document.');
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size should be less than 10MB');
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadFormData(prev => ({
          ...prev,
          fileData: event.target?.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddDocument = () => {
    // Validation
    if (!activeDocumentType || !uploadFormData.name.trim() || !uploadFormData.fileData) {
      setErrorMessage('Please fill in all required fields and upload a file');
      return;
    }

    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      name: uploadFormData.name,
      type: activeDocumentType,
      description: uploadFormData.description,
      uploadDate: new Date().toISOString(),
      expiryDate: uploadFormData.expiryDate || null,
      status: 'pending',
      reviewNotes: '',
      fileData: uploadFormData.fileData
    };

    // Check if we're replacing an existing document of the same type
    const existingDocIndex = documents.findIndex(doc => doc.type === activeDocumentType);

    if (existingDocIndex >= 0) {
      // Replace existing document
      const updatedDocs = [...documents];
      updatedDocs[existingDocIndex] = newDocument;
      setDocuments(updatedDocs);
    } else {
      // Add new document
      setDocuments(prev => [...prev, newDocument]);
    }

    // Reset form
    setActiveDocumentType('');
    setUploadFormData({
      name: '',
      description: '',
      expiryDate: '',
      fileData: null
    });
    setShowUploadForm(false);
    setErrorMessage(null);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    setActiveDocumentType(doc.type);
    setUploadFormData({
      name: doc.name,
      description: doc.description,
      expiryDate: doc.expiryDate || '',
      fileData: doc.fileData
    });

    setShowUploadForm(true);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const startDocumentUpload = (typeId: string) => {
    const docType = getDocumentTypeInfo(typeId);

    setActiveDocumentType(typeId);
    setUploadFormData({
      name: docType.name,
      description: '',
      expiryDate: '',
      fileData: null
    });

    setShowUploadForm(true);
  };

  const cancelUpload = () => {
    setActiveDocumentType('');
    setUploadFormData({
      name: '',
      description: '',
      expiryDate: '',
      fileData: null
    });
    setShowUploadForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      // Check for required documents
      const requiredTypes = documentTypes.filter(dt => dt.required).map(dt => dt.id);
      const uploadedTypes = documents.map(doc => doc.type);

      const missingRequired = requiredTypes.filter(type => !uploadedTypes.includes(type));

      if (missingRequired.length > 0) {
        const missingNames = missingRequired.map(id => {
          const docType = documentTypes.find(dt => dt.id === id);
          return docType ? docType.name : id;
        });

        throw new Error(`Missing required documents: ${missingNames.join(', ')}`);
      }

      // In a real app, this would be an API call to update documents
      const user = authService.getCurrentUser();

      if (user) {
        const updatedUser = {
          ...user,
          vendorInfo: {
            ...user.vendorInfo,
            legalDocuments: documents
          }
        };

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Update user in localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setSuccessMessage('Legal documents updated successfully');
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      setErrorMessage((error as Error).message || 'Failed to update legal documents');
      console.error('Error updating legal documents:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Legal & KYC Documents</h2>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <div className="mb-6">
        <p className="text-gray-600">
          Upload required legal and KYC documents to verify your business. Documents marked with an asterisk (*) are required.
          Uploaded documents will be reviewed by our team for verification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Upload Form */}
        {showUploadForm && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Upload {getDocumentTypeInfo(activeDocumentType).name}
              </h3>
              <button
                type="button"
                onClick={cancelUpload}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label htmlFor="document-name" className="block text-sm font-medium text-gray-700">
                  Document Name*
                </label>
                <input
                  type="text"
                  id="document-name"
                  name="name"
                  value={uploadFormData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="document-expiry" className="block text-sm font-medium text-gray-700">
                  Expiry Date (if applicable)
                </label>
                <input
                  type="date"
                  id="document-expiry"
                  name="expiryDate"
                  value={uploadFormData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <label htmlFor="document-description" className="block text-sm font-medium text-gray-700">
                Document Description
              </label>
              <textarea
                id="document-description"
                name="description"
                value={uploadFormData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes about this document"
              />
            </div>

            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Upload File*
              </label>
              <div className="mt-1 flex items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="document-file"
                  name="file"
                  onChange={handleFileChange}
                  className="sr-only"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />

                {uploadFormData.fileData ? (
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm">
                      File selected
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadFormData(prev => ({ ...prev, fileData: null }))}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="document-file"
                    className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Select File
                  </label>
                )}

                <p className="ml-3 text-xs text-gray-500">
                  PDF, DOC, DOCX, JPG, PNG (max 10MB)
                </p>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleAddDocument}
                disabled={!uploadFormData.fileData}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Upload Document
              </button>
            </div>
          </div>
        )}

        {/* Document Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentTypes.map((docType) => {
            const existingDoc = documents.find(doc => doc.type === docType.id);

            return (
              <div key={docType.id} className={`border ${docType.required ? 'border-blue-200' : 'border-gray-200'} rounded-lg p-4 ${existingDoc ? 'bg-gray-50' : ''}`}>
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium mb-2">
                    {docType.name}
                    {docType.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>

                  {existingDoc && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${existingDoc.status === 'approved' ? 'bg-green-100 text-green-800' :
                        existingDoc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}
                    >
                      {existingDoc.status.charAt(0).toUpperCase() + existingDoc.status.slice(1)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3">{docType.description}</p>

                {existingDoc ? (
                  <div>
                    <div className="mb-3">
                      <p className="text-sm"><span className="font-medium">Uploaded:</span> {new Date(existingDoc.uploadDate).toLocaleDateString()}</p>
                      {existingDoc.expiryDate && (
                        <p className="text-sm">
                          <span className="font-medium">Expires:</span> {new Date(existingDoc.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                      {existingDoc.description && (
                        <p className="text-sm text-gray-600 mt-1">{existingDoc.description}</p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditDocument(existingDoc.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(existingDoc.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startDocumentUpload(docType.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Upload
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-200 mt-8">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : 'Save All Documents'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LegalDocuments;
