'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link2, ArrowLeft, ExternalLink, Copy, Check, Loader2, Clock, MousePointerClick, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const APP_BASE =  process.env.NEXT_PUBLIC_API_BASE_URL;

export default function StatsPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code;

  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchLinkStats();
  }, [code]);

  const fetchLinkStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/links/${code}`);

      if (response.status === 404) {
        router.push('/404');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch link stats');
      }

      const data = await response.json();
      setLinkData(data);
      setError('');
    } catch (err) {
      setError('Failed to load link statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const shortUrl = `${APP_BASE}/${code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf8] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !linkData) {
    return (
      <div className="min-h-screen bg-[#fffdf8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Link Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'This link does not exist or has been deleted.'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#f7f4ee] text-gray-900 px-6 py-3 rounded-xl hover:bg-[#eee8dd] transition-all font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const shortUrl = `${APP_BASE}/${code}`;

  return (

    <div className="min-h-screen bg-[#fffdf8]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f7f4ee] rounded-xl flex items-center justify-center shadow-lg">
                <Link2 className="w-5 h-5 text-gray-900" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                TinyLink
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Link Statistics</h1>
          <p className="text-gray-600">Detailed analytics for your short link</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Short Code</p>
              <div className="flex items-center gap-3">
                <code className="text-3xl font-bold text-gray-900">
                  {linkData.code}
                </code>
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-6 py-3 bg-[#f7f4ee] text-gray-900 rounded-xl hover:bg-[#eee8dd] transition-all font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Short URL</p>
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 font-mono text-lg flex items-center gap-2 group"
              >
                {shortUrl}
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Target URL</p>
              <a
                href={linkData.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 break-all flex items-center gap-2 group"
              >
                {linkData.targetUrl}
                <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <div className="w-10 h-10 bg-[#f7f4ee] rounded-xl flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 text-gray-900" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{linkData.totalClicks || 0}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Created</p>
              <div className="w-10 h-10 bg-[#f7f4ee] rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-900" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900">{getRelativeTime(linkData.createdAt)}</p>
            <p className="text-xs text-gray-500 mt-1">{formatDate(linkData.createdAt)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Last Clicked</p>
              <div className="w-10 h-10 bg-[#f7f4ee] rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-900" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900">{getRelativeTime(linkData.lastClickedAt)}</p>
            {linkData.lastClickedAt && (
              <p className="text-xs text-gray-500 mt-1">{formatDate(linkData.lastClickedAt)}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Status</p>
              <div className="w-10 h-10 bg-[#f7f4ee] rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gray-900" />
              </div>
            </div>
            <p className="text-lg font-bold text-green-600">Active</p>
            <p className="text-xs text-gray-500 mt-1">Link is working</p>
          </div>
        </div>


        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-900 rounded-xl hover:bg-[#f7f4ee] transition-all font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to All Links
          </button>
        </div>
      </main>

      <footer className="mt-16 pb-8 text-center text-gray-500">
        <p className="text-sm">© 2024 TinyLink. Built with ❤️ using Next.js & Tailwind CSS</p>
      </footer>
    </div>
  );
}