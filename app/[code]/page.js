'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Link2, Home, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function RedirectPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code;
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const redirect = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/links/${code}`);
        
        if (response.status === 404) {
          setShowError(true);
          return;
        }

        if (response.ok) {
          setTimeout(() => {
            window.location.href = `${API_BASE}/${code}`;
          }, 800);
        } else {
          setShowError(true);
        }
      } catch (err) {
        console.error('Redirect error:', err);
        setShowError(true);
      }
    };

    redirect();
  }, [code]);

  if (showError) {
    return (
      <div className="min-h-screen bg-[#fffdf8] flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-[#f7f4ee] rounded-2xl flex items-center justify-center shadow-lg">
                <Link2 className="w-8 h-8 text-gray-900" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                TinyLink
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-200">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>

            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              404
            </h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Link Not Found
            </h2>
            <div className="mb-6">
              <code className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-mono text-sm">
                {code}
              </code>
            </div>
            <p className="text-gray-600 mb-8">
              This short link doesn't exist or has been deleted by its creator.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#f7f4ee] text-gray-900 rounded-xl hover:bg-[#eee8dd] transition-all font-medium"
              >
                <Home className="w-5 h-5" />
                Go to Dashboard
              </button>
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#fffdf8] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-[#f7f4ee] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
          <Link2 className="w-12 h-12 text-gray-900" />
        </div>
        <Loader2 className="animate-spin h-12 w-12 text-gray-900 mx-auto mb-4" />
        <p className="text-gray-600 font-medium text-lg">Redirecting you...</p>
        <p className="text-gray-500 text-sm mt-2">Taking you to your destination</p>
      </div>
    </div>
  );
}