'use client';

import { useState, useEffect } from 'react';
import InvoiceForm from '@/components/InvoiceForm';
import { InvoiceData } from '@/types/invoice';
import { generateInvoicePDF } from '@/utils/generatePDF';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerateInvoice = async (data: InvoiceData) => {
    try {
      setIsGenerating(true);
      const pdfBytes = await generateInvoicePDF(data);
      
      // Create a blob from the PDF bytes
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${data.invoiceNumber}.pdf`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);

      // Set success state
      setLastInvoiceNumber(data.invoiceNumber);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    setIsSuccess(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Na Na Beauty 發票系統
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            簡單易用，功能強大，專業發票
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Loading State */}
          {isGenerating ? (
            <div className="p-12 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">正在生成發票</h3>
              <p className="text-gray-600">請稍候...</p>
            </div>
          ) : isSuccess ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">發票創建成功！</h3>
              <p className="text-gray-600 mb-8">發票 #{lastInvoiceNumber} 已下載。</p>
              <button
                onClick={handleBack}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                創建新發票
              </button>
            </div>
          ) : (
            <div className="p-3 sm:p-8">
              <InvoiceForm onSubmit={handleGenerateInvoice} />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Na Na Beauty. 版權所有。</p>
        </footer>
      </div>
    </div>
  );
} 