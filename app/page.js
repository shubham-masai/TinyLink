"use client"
import { useState, useEffect } from 'react';
import { Link2, Copy, Trash2, BarChart3, ExternalLink, Search, Plus, X, Check, Loader2, TrendingUp, Clock, MousePointerClick, AlertTriangle } from 'lucide-react';

const API_BASE =  process.env.NEXT_PUBLIC_API_URL;
const APP_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-gray-900';

  return (
    <div className={`fixed bottom-6 right-6 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-slide-up flex items-center gap-3 max-w-md`}>
      {type === 'success' && <Check className="w-5 h-5" />}
      {type === 'error' && <AlertTriangle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, code: '', isLoading: false });

  const [formData, setFormData] = useState({ targetUrl: '', code: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/links`);
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      setLinks(data);
      setError('');
    } catch (err) {
      setError('Failed to load links. Please try again.');
      showToast('Failed to load links', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!formData.targetUrl.trim()) {
      setFormError('Please enter a URL');
      return;
    }

    if (!validateUrl(formData.targetUrl)) {
      setFormError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    if (formData.code && !/^[A-Za-z0-9]{6,8}$/.test(formData.code)) {
      setFormError('Custom code must be 6-8 alphanumeric characters');
      return;
    }

    setFormLoading(true);

    try {
      const payload = { targetUrl: formData.targetUrl };
      if (formData.code.trim()) payload.code = formData.code;

      const response = await fetch(`${API_BASE}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.status === 409) {
        setFormError('This code is already taken. Please choose another.');
        return;
      }

      if (!response.ok) {
        setFormError(data.error || 'Failed to create link. Please try again.');
        return;
      }

      setLinks([data, ...links]);
      setFormSuccess(true);
      showToast('Short link created successfully!', 'success');
      setFormData({ targetUrl: '', code: '' });
      
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess(false);
      }, 1000);
    } catch (err) {
      setFormError('Network error. Please check your connection and try again.');
      showToast('Failed to create link', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteModal = (code) => {
    setDeleteModal({ isOpen: true, code, isLoading: false });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, code: '', isLoading: false });
  };

  const handleDeleteLink = async () => {
    const { code } = deleteModal;
    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`${API_BASE}/api/links/${code}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        if (response.status === 404) {
          showToast('Link not found or already deleted', 'error');
        } else {
          throw new Error('Failed to delete link');
        }
      } else {
        setLinks(links.filter(link => link.code !== code));
        showToast('Link deleted successfully', 'success');
      }
      
      closeDeleteModal();
    } catch (err) {
      showToast('Failed to delete link. Please try again.', 'error');
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCopyLink = (code) => {
    const shortUrl = `${APP_BASE}/${code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedCode(code);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleViewStats = (code) => {
    window.location.href = `/code/${code}`;
  };

  const filteredLinks = links.filter(link =>
    link.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.targetUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalClicks = links.reduce((sum, link) => sum + (link.totalClicks || 0), 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const truncateUrl = (url, maxLength = 60) => {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  return (
    <div className="min-h-screen bg-[#fffdf8]">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteLink}
        title="Delete Link"
        message={`Are you sure you want to delete the link "${deleteModal.code}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteModal.isLoading}
      />


      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#f7f4ee] rounded-2xl flex items-center justify-center shadow-lg">
                <Link2 className="w-7 h-7 text-gray-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  TinyLink
                </h1>
                <p className="text-sm text-gray-500">Smart URL Shortener</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#f7f4ee] text-gray-900 px-6 py-3 rounded-xl hover:bg-[#eee8dd] transition-all duration-300 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Create Link</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
       
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Links</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{links.length}</p>
              </div>
              <div className="w-14 h-14 bg-[#f7f4ee] rounded-2xl flex items-center justify-center">
                <Link2 className="w-7 h-7 text-gray-900" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalClicks}</p>
              </div>
              <div className="w-14 h-14 bg-[#f7f4ee] rounded-2xl flex items-center justify-center">
                <MousePointerClick className="w-7 h-7 text-gray-900" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Clicks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {links.length ? Math.round(totalClicks / links.length) : 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-[#f7f4ee] rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-gray-900" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by short code or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all shadow-lg"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 shadow-lg">
            {error}
          </div>
        )}


        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Loader2 className="animate-spin h-14 w-14 text-gray-900 mx-auto" />
            <p className="mt-4 text-gray-600 font-medium">Loading your links...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <div className="w-20 h-20 bg-[#f7f4ee] rounded-full flex items-center justify-center mx-auto mb-6">
              <Link2 className="w-10 h-10 text-gray-900" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'No links found' : 'No links yet'}
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              {searchQuery ? 'Try adjusting your search' : 'Create your first short link to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#f7f4ee] text-gray-900 px-8 py-4 rounded-xl hover:bg-[#eee8dd] transition-all font-medium"
              >
                Create Your First Link
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLinks.map((link) => (
              <div
                key={link.code}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="px-4 py-2 bg-[#f7f4ee] rounded-xl">
                        <code className="text-sm font-bold text-gray-900">
                          {link.code}
                        </code>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
                        {link.totalClicks || 0} clicks
                      </span>
                    </div>
                    <a
                      href={link.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900 flex items-center gap-2 group"
                      title={link.targetUrl}
                    >
                      <span className="truncate">{truncateUrl(link.targetUrl)}</span>
                      <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Last clicked: {formatDate(link.lastClickedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(link.code)}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-[#f7f4ee] rounded-xl transition-all flex items-center gap-2 border border-gray-200"
                      title="Copy short link"
                    >
                      {copiedCode === link.code ? (
                        <>
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium hidden sm:inline">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          <span className="text-sm font-medium hidden sm:inline">Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleViewStats(link.code)}
                      className="p-3 text-gray-700 hover:bg-[#f7f4ee] rounded-xl transition-all border border-gray-200"
                      title="View statistics"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(link.code)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-200"
                      title="Delete link"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Create Short Link
                </h2>
                <p className="text-gray-500 mt-1">Transform your long URL into a short one</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormError('');
                  setFormSuccess(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {formSuccess && (
              <div className="mb-6 bg-green-50 border-2 border-green-200 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-3">
                <Check className="w-6 h-6" />
                <span className="font-medium">Link created successfully!</span>
              </div>
            )}

            {formError && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl">
                {formError}
              </div>
            )}

            <div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Target URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  placeholder="https://example.com/your-long-url"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  disabled={formLoading}
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Custom Short Code (optional)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="mycode (6-8 characters)"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  disabled={formLoading}
                  maxLength={8}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Leave empty for auto-generated code
                </p>
              </div>

              <button
                onClick={handleCreateLink}
                disabled={formLoading}
                className="w-full bg-[#f7f4ee] text-gray-900 px-6 py-4 rounded-xl hover:bg-[#eee8dd] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-3"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6" />
                    Create Short Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-16 pb-8 text-center text-gray-500">
        <p className="text-sm">© 2025 TinyLink. Built with ❤️ using Next.js & Tailwind CSS</p>
      </footer>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}