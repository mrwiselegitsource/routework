import React, { useState, useEffect } from 'react';
import { Loader2, Upload, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { db } from '../../lib/db';

const EVERSEND_LINKS = [
  'https://eversend.me/routeworks',
  'https://eversend.me/routeworks1',
  'https://eversend.me/routeworks2'
];

export default function EverSendGateway({ orderId, amountDue, onSuccess, onCancel }) {
  const [paymentLink, setPaymentLink] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Select a random link to distribute traffic
    const randomLink = EVERSEND_LINKS[Math.floor(Math.random() * EVERSEND_LINKS.length)];
    setPaymentLink(randomLink);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setProofFile(file);
      setError(null);
    }
  };

  const handleSubmitProof = async () => {
    if (!proofFile) {
      setError('Please upload a screenshot of your payment receipt.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // In a real implementation, you would upload to Supabase Storage here.
      // For this mock, we just simulate the upload and update the DB.
      let uploadedUrl = 'mock-proof-url.webp'; 
      if (db.uploadPaymentProof) {
         const { url } = await db.uploadPaymentProof(orderId, proofFile);
         uploadedUrl = url;
      }
      
      // We mark payment as 'pending_verification' rather than fully 'paid' 
      // because an admin needs to confirm the partial/full amount.
      await db.updatePaymentStatus(orderId, 'pending_verification', `EVERSEND_PROOF_${Date.now()}`);
      
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(uploadedUrl);
      }, 2500);
    } catch (err) {
      setError('Failed to submit proof. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white p-8 rounded-2xl flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Proof Submitted</h3>
        <p className="text-gray-600">Your payment is being verified by our team. This usually takes a few minutes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      
      {/* HEADER */}
      <div className="bg-white px-4 py-4 border-b flex justify-between items-center z-30 relative shadow-sm">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" /> Secure Payment
          </h3>
          <p className="text-xs text-gray-500">Pay GH₵ {amountDue} via EverSend</p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-900 font-semibold">
            Cancel
          </button>
        )}
      </div>

      {/* WARNING BANNER */}
      <div className="bg-orange-50 border-b border-orange-100 p-3 text-xs text-orange-800 flex gap-2 z-30 relative">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p><strong>Warning:</strong> Ensure you send the exact amount (GH₵ {amountDue}). Sending less may result in the loss of your item.</p>
      </div>

      {/* IFRAME MASKING TRICK */}
      <div className="flex-1 bg-white relative overflow-hidden" id="iframe-viewport-container" style={{ minHeight: '400px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '480px', margin: '0 auto' }}>
          
          {/* THE MASK (Sticky Overlay) */}
          <div style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 20, 
            height: '250px', 
            background: 'white', 
            borderBottom: '1px solid #e8e8e8', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            pointerEvents: 'none' 
          }}>
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-1 shadow-md p-1 border border-gray-100 overflow-hidden">
               <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '18px' }}>
              RouteWorks Logistics
            </span>
            <div className="mt-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-800 text-center mx-4">
              <span className="font-semibold text-blue-900 block">Note example:</span>
              Please enter your <strong>Order ID</strong> (e.g. #1234) or your <strong>Name</strong> in the note field below.
            </div>
          </div>

          {/* SCROLLABLE IFRAME CONTAINER */}
          <div style={{ 
            height: '600px', 
            overflowY: 'auto', 
            marginTop: '-250px', 
            paddingTop: '250px', 
            background: 'white', 
            borderRadius: '0 0 12px 12px' 
          }}>
            {paymentLink ? (
              <iframe
                title="EverSend Payment"
                src={paymentLink}
                style={{ width: '100%', height: '1100px', border: 'none', display: 'block', marginTop: '-250px' }}
                scrolling="no"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* UPLOAD PROOF SECTION */}
      <div className="bg-white p-5 border-t z-30 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <h4 className="font-bold text-gray-900 text-sm mb-3">Upload Proof of Payment</h4>
        
        {error && (
          <p className="text-red-500 text-xs mb-3">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:border-[#0033a0] hover:bg-blue-50 transition-colors">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <Upload className="w-5 h-5 text-gray-400 mb-1" />
            <span className="text-xs text-gray-600 font-semibold text-center">
              {proofFile ? proofFile.name : 'Select receipt image'}
            </span>
          </label>

          <button
            onClick={handleSubmitProof}
            disabled={isSubmitting || !proofFile}
            className="bg-[#0033a0] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Proof'}
          </button>
        </div>
      </div>

    </div>
  );
}
