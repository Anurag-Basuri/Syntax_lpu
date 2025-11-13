import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { 
  Sparkles, X, Loader2, Plus, DownloadCloud, BarChart2, 
  Calendar, MapPin, Users, Image, Film, Link2, Unlink, 
  Copy, Trash2, Edit3, ChevronDown, ChevronUp, Star, 
  Trophy, Search, Eye, Settings, Share2, Zap,
  Building2, Camera, Video
} from 'lucide-react';
import {
  getAllFests,
  getFestDetails,
  createFest,
  updateFestDetails,
  deleteFest,
  addPartner,
  removePartner,
  linkEventToFest,
  unlinkEventFromFest,
  updateFestPoster,
  addGalleryMedia,
  removeGalleryMedia,
  exportFestsCSV,
  getFestAnalytics,
  getFestStatistics,
  generateFestReport,
} from '../../services/arvantisServices.js';
import { apiClient } from '../../services/api.js';

// Premium UI Components
const Badge = ({ children, variant = 'default', className = '', size = 'md' }) => {
  const variants = {
    default: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
    upcoming: 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/20',
    ongoing: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/20',
    completed: 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/20',
    cancelled: 'bg-red-500/20 text-red-300 border border-red-500/30 shadow-lg shadow-red-500/20',
    postponed: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/20',
    sponsor: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30',
    collaborator: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30',
    premium: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold backdrop-blur-sm transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

const GlassCard = ({ children, className = '', hover = false, gradient = false }) => (
  <div
    className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl ${
      gradient ? 'bg-gradient-to-br from-white/5 to-white/10' : ''
    } ${
      hover ? 'hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] transition-all duration-300' : ''
    } ${className}`}
  >
    {children}
  </div>
);

const EmptyState = ({ 
  title, 
  subtitle, 
  icon: Icon = Sparkles, 
  action,
  size = 'md'
}) => (
  <GlassCard className={`text-center ${size === 'lg' ? 'p-12' : 'p-8'}`}>
    <div className="flex justify-center mb-6">
      <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl shadow-lg">
        <Icon className={`${size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'} text-purple-300`} />
      </div>
    </div>
    <h3 className={`font-semibold text-white mb-3 ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
      {title}
    </h3>
    <p className={`text-gray-400 mb-6 ${size === 'lg' ? 'text-base' : 'text-sm'}`}>
      {subtitle}
    </p>
    {action}
  </GlassCard>
);

const LoadingSpinner = ({ size = 'lg', text = 'Loading...', className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <div
      className={`animate-spin rounded-full border-2 border-transparent border-t-purple-500 border-r-pink-500 ${
        size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-10 h-10' : 'w-16 h-16'
      }`}
    />
    {text && (
      <p className="mt-4 text-gray-400 text-sm font-medium animate-pulse">
        {text}
      </p>
    )}
  </div>
);

const Toast = ({ message, type = 'success', onDismiss }) => {
  const icons = {
    success: <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">✓</div>,
    error: <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">!</div>,
    warning: <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">⚠</div>,
    info: <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">i</div>,
  };

  const backgrounds = {
    success: 'bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg shadow-emerald-500/25',
    error: 'bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-500/25',
    warning: 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg shadow-amber-500/25',
    info: 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/25',
  };

  return (
    <div
      className={`${backgrounds[type]} text-white px-6 py-4 rounded-2xl backdrop-blur-xl flex items-center gap-4 animate-in slide-in-from-right-full duration-500`}
    >
      {icons[type]}
      <span className="flex-1 font-medium text-sm">{message}</span>
      <button
        onClick={onDismiss}
        className="hover:bg-white/20 rounded-full p-1.5 transition-all duration-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, className = '' }) => (
  <GlassCard hover className={`p-6 ${className}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && (
          <p className={`text-xs font-medium mt-1 ${
            trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {trend}
          </p>
        )}
      </div>
      <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
        <Icon className="w-6 h-6 text-purple-300" />
      </div>
    </div>
  </GlassCard>
);

// Enhanced Partner Quick Add
const PartnerQuickAdd = React.memo(({ onAdd = () => {}, disabled = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState('');
  const [tier, setTier] = useState('sponsor');
  const [website, setWebsite] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    setErr('');
    if (!name || !logoFile) {
      setErr('Partner name and logo are required');
      return;
    }
    setAdding(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('tier', tier);
      if (website) fd.append('website', website);
      fd.append('logo', logoFile);
      await onAdd(fd);
      setName('');
      setTier('sponsor');
      setWebsite('');
      setLogoFile(null);
      setIsExpanded(false);
    } catch (e) {
      setErr(e?.message || 'Failed to add partner');
    } finally {
      setAdding(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        disabled={disabled}
        className="w-full p-4 border-2 border-dashed border-white/10 rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300 group"
      >
        <div className="flex items-center justify-center gap-3 text-gray-400 group-hover:text-purple-300">
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add New Partner</span>
        </div>
      </button>
    );
  }

  return (
    <GlassCard className="p-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">Add New Partner</h4>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      <div className="space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Partner name"
          className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
          disabled={disabled}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
            disabled={disabled}
          >
            <option value="sponsor">Sponsor</option>
            <option value="collaborator">Collaborator</option>
            <option value="partner">Partner</option>
          </select>
          
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Website (optional)"
            className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
            disabled={disabled}
          />
        </div>

        <div className="border-2 border-dashed border-white/10 rounded-2xl p-4 hover:border-purple-500/50 transition-all duration-300">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            className="w-full text-white file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:from-purple-600 hover:file:to-pink-600 transition-all duration-300"
            disabled={disabled}
          />
          {logoFile && (
            <p className="text-emerald-400 text-sm mt-2 font-medium">
              ✓ Selected: {logoFile.name}
            </p>
          )}
        </div>

        {err && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-sm font-medium">
            {err}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={submit}
            disabled={adding || disabled}
            className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg shadow-emerald-500/25"
          >
            {adding ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding Partner...
              </div>
            ) : (
              'Add Partner'
            )}
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all duration-300 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </GlassCard>
  );
});

// Main Component
const ArvantisTab = ({ setDashboardError = () => {} }) => {
  const [fests, setFests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  const [query, setQuery] = useState('');
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [limit] = useState(100);
  const [expandedSections, setExpandedSections] = useState({
    partners: true,
    events: true,
    media: true
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    year: new Date().getFullYear(),
    description: '',
    startDate: '',
    endDate: '',
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: 'Arvantis',
    description: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
    location: 'Lovely Professional University',
    contactEmail: '',
  });

  const [activeFest, setActiveFest] = useState(null);
  const [partners, setPartners] = useState([]);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [localError, setLocalError] = useState('');
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Helper functions (same as before)
  const resolveIdentifier = (festOrIdentifier) => {
    if (!festOrIdentifier) return '';
    if (typeof festOrIdentifier === 'string' || typeof festOrIdentifier === 'number')
      return String(festOrIdentifier);
    if (festOrIdentifier.slug) return String(festOrIdentifier.slug);
    if (festOrIdentifier.year) return String(festOrIdentifier.year);
    if (festOrIdentifier._id) return String(festOrIdentifier._id);
    return '';
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const safeFilename = (s = '') => String(s).replace(/[:]/g, '-');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Data loading functions (same logic, enhanced UI)
  const loadFestByIdentifier = useCallback(
    async (identifier, { setSelected = true } = {}) => {
      if (!identifier) {
        setActiveFest(null);
        setPartners([]);
        if (setSelected) setSelectedYear('');
        return null;
      }
      setLoading(true);
      setLocalError('');
      try {
        const id = resolveIdentifier(identifier);
        const details = await getFestDetails(id, { admin: true });
        setActiveFest(details);
        setPartners(Array.isArray(details.partners) ? details.partners : []);
        if (setSelected && details?.year) setSelectedYear(String(details.year));
        return details;
      } catch (err) {
        const msg = err?.message || `Failed to load fest '${identifier}'.`;
        setLocalError(msg);
        setDashboardError(msg);
        setActiveFest(null);
        setPartners([]);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setDashboardError]
  );

  const fetchYearsAndLatest = useCallback(async () => {
    setLoading(true);
    setLocalError('');
    try {
      const res = await getAllFests(
        { page: 1, limit, sortBy: 'year', sortOrder: 'desc' },
        { admin: true }
      );
      const docs = Array.isArray(res.docs) ? res.docs : [];
      setFests(docs);

      const yrs = Array.from(new Set(docs.map((d) => d.year)))
        .sort((a, b) => b - a)
        .map((y) => String(y));
      setYears(yrs);

      const nowYear = new Date().getFullYear();
      const statusRank = (s) => {
        if (!s) return 0;
        if (s === 'ongoing') return 4;
        if (s === 'upcoming') return 3;
        if (s === 'completed') return 2;
        if (s === 'postponed') return 1;
        return 0;
      };

      let candidate = null;
      const currentYearCandidates = docs
        .filter((d) => Number(d.year) === nowYear)
        .sort((a, b) => statusRank(b.status) - statusRank(a.status));
      if (
        currentYearCandidates.length > 0 &&
        statusRank(currentYearCandidates[0].status) > 1
      ) {
        candidate = currentYearCandidates[0];
      }

      if (!candidate) {
        const prefer = docs
          .filter((d) => ['ongoing', 'upcoming'].includes(d.status))
          .sort((a, b) => b.year - a.year || statusRank(b.status) - statusRank(a.status));
        if (prefer.length) candidate = prefer[0];
      }

      if (!candidate) {
        const completed = docs
          .filter((d) => d.status === 'completed')
          .sort((a, b) => b.year - a.year);
        if (completed.length) candidate = completed[0];
      }

      if (!candidate && docs.length) candidate = docs[0];

      if (candidate) {
        const id = candidate.slug || candidate.year || candidate._id;
        setSelectedYear(String(candidate.year));
        await loadFestByIdentifier(id, { setSelected: false });
      } else {
        setActiveFest(null);
        setPartners([]);
        setSelectedYear('');
      }
    } catch (err) {
      const msg = err?.message || 'Failed to fetch fests.';
      setLocalError(msg);
      setDashboardError(msg);
    } finally {
      setLoading(false);
    }
  }, [limit, loadFestByIdentifier, setDashboardError]);

  const fetchEvents = useCallback(async () => {
    try {
      const resp = await apiClient.get('/api/v1/events', { params: { page: 1, limit: 500 } });
      const payload = resp?.data?.data ?? resp?.data;
      const docs = Array.isArray(payload?.docs)
        ? payload.docs
        : Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];
      setEvents(docs);
    } catch (err) {
      const msg = err?.message || 'Failed to fetch events.';
      setLocalError(msg);
      setDashboardError(msg);
    }
  }, [limit, setDashboardError]);

  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    (async () => {
      await fetchYearsAndLatest();
      await fetchEvents();
    })();
  }, [fetchYearsAndLatest, fetchEvents]);

  const handleSelectYear = async (yearStr) => {
    setSelectedYear(yearStr ?? '');
    setLocalError('');
    if (!yearStr) {
      setActiveFest(null);
      setPartners([]);
      return;
    }
    const festForYear = fests.find((f) => String(f.year) === String(yearStr));
    await loadFestByIdentifier(
      festForYear?.slug || festForYear?.year || festForYear?._id || yearStr
    );
  };

  const visibleFests = useMemo(
    () =>
      (fests || [])
        .filter((f) => (!selectedYear ? true : String(f.year) === String(selectedYear)))
        .filter((f) => {
          if (!query) return true;
          const q = String(query).toLowerCase();
          return (
            String(f.year).includes(q) ||
            ((f.name || '') + ' ' + (f.description || '') + ' ' + (f.slug || ''))
              .toLowerCase()
              .includes(q)
          );
        }),
    [fests, selectedYear, query]
  );

  // Action handlers (same logic, enhanced UI feedback)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setLocalError('');
    try {
      const { year, description, startDate, endDate } = createForm;
      if (!year || !startDate || !endDate || !description) {
        throw new Error('Year, description and dates are required');
      }
      const payload = {
        year: Number(year),
        description,
        startDate,
        endDate,
      };
      const created = await createFest(payload);
      setCreateOpen(false);
      showToast('🎉 Fest created successfully!', 'success');
      await fetchYearsAndLatest();
      const id = created?.slug || created?.year || created?._id;
      if (id) await loadFestByIdentifier(id);
    } catch (err) {
      const msg = err?.message || 'Failed to create fest.';
      setLocalError(msg);
      setDashboardError(msg);
      showToast(msg, 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const saveEdit = async () => {
    setActionBusy(true);
    setLocalError('');
    try {
      const id = resolveIdentifier(activeFest);
      const payload = {
        description: editForm.description,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        location: editForm.location,
        contactEmail: editForm.contactEmail,
      };
      await updateFestDetails(id, payload);
      await loadFestByIdentifier(id);
      await fetchYearsAndLatest();
      setEditOpen(false);
      showToast('✨ Fest updated successfully!', 'success');
    } catch (err) {
      const msg = err?.message || 'Failed to save fest edits.';
      setLocalError(msg);
      setDashboardError(msg);
      showToast(msg, 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const openEdit = async (fest) => {
    setLocalError('');
    setActionBusy(true);
    try {
      const details = await loadFestByIdentifier(resolveIdentifier(fest), {
        setSelected: false,
      });
      const s = details || fest || activeFest || {};
      setEditForm({
        name: s.name || 'Arvantis',
        description: s.description || '',
        startDate: s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : '',
        endDate: s.endDate ? new Date(s.endDate).toISOString().slice(0, 10) : '',
        status: s.status || 'upcoming',
        location: s.location || 'Lovely Professional University',
        contactEmail: s.contactEmail || '',
      });
      setEditOpen(true);
    } catch (err) {
      const msg = err?.message || 'Failed to open edit';
      setLocalError(msg);
      setDashboardError(msg);
    } finally {
      setActionBusy(false);
    }
  };

  const exportCSV = async () => {
    setDownloadingCSV(true);
    setLocalError('');
    try {
      const blob = await exportFestsCSV();
      downloadBlob(blob, `arvantis-fests-${safeFilename(new Date().toISOString())}.csv`);
      showToast('📊 CSV exported successfully!', 'success');
    } catch (err) {
      const msg = err?.message || 'Failed to export CSV.';
      setLocalError(msg);
      setDashboardError(msg);
      showToast(msg, 'error');
    } finally {
      setDownloadingCSV(false);
    }
  };

  const removeFest = async (fest) => {
    if (!fest) return;
    if (!window.confirm(`Delete "${fest.name || fest.year}"? This cannot be undone.`)) return;
    setActionBusy(true);
    setLocalError('');
    try {
      const id = resolveIdentifier(fest);
      await deleteFest(id);
      await fetchYearsAndLatest();
      showToast('Fest deleted successfully', 'success');
    } catch (err) {
      const msg = err?.message || 'Failed to delete fest.';
      setLocalError(msg);
      setDashboardError(msg);
      showToast(msg, 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const uploadPoster = async (file) => {
    if (!activeFest) {
      showToast('No active fest selected', 'error');
      return;
    }
    if (!file) {
      showToast('No file selected', 'error');
      return;
    }
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!ALLOWED.includes(file.type)) {
      showToast('Invalid file type. Use JPG/PNG/GIF.', 'error');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast('File too large. Max 10 MB allowed.', 'error');
      return;
    }

    setActionBusy(true);
    setLocalError('');
    try {
      const id = resolveIdentifier(activeFest);
      const fd = new FormData();
      fd.append('poster', file);
      await updateFestPoster(id, fd);
      await loadFestByIdentifier(id);
      await fetchYearsAndLatest();
      showToast('🖼️ Poster uploaded successfully!', 'success');
    } catch (err) {
      const msg = err?.message || 'Failed to upload poster.';
      setLocalError(msg);
      setDashboardError(msg);
      showToast(msg, 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const addGallery = async (files) => {
    if (!activeFest) {
      showToast('No active fest selected', 'error');
      return;
    }
    if (!files || !files.length) {
      showToast('No files selected for gallery', 'error');
      return;
    }
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const ALLOWED = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/webm',
    ];
    for (const f of files) {
      if (!ALLOWED.includes(f.type)) {
        showToast(`Invalid file type: ${f.name}`, 'error');
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        showToast(`File too large: ${f.name}`, 'error');
        return;
      }
    }

    setActionBusy(true);
    setLocalError('');
    try {
      const id = resolveIdentifier(activeFest);
      const fd = new FormData();
      for (const f of files) fd.append('media', f);
      await addGalleryMedia(id, fd);
      await loadFestByIdentifier(id);
      await fetchYearsAndLatest();
      showToast('📸 Gallery updated successfully!', 'success');
    } catch (err) {
      const msg = err?.message || 'Failed to add gallery media.';
      setLocalError(msg);
      setDashboardError(msg);
      showToast(msg, 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const removeGalleryItem = async (publicId) => {
    if (!activeFest) return;
    if (!window.confirm('Remove this media item?')) return;
    setActionBusy(true);
    setLocalError('');
    try {
      const id = resolveIdentifier(activeFest);
      await removeGalleryMedia(id, publicId);
      await loadFestByIdentifier(id);
      await fetchYearsAndLatest();
      showToast('Media removed successfully', 'success');
    } catch (err) {
      const msg = err?.message || 'Failed to remove gallery media.';
      setLocalError(msg);
      setDashboardError(msg);
      showToast(msg, 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const handleLinkEvent = async (festOrEventId, maybeEventId) => {
    let fest = activeFest;
    let eventId = festOrEventId;
    if (maybeEventId !== undefined) {
      fest = festOrEventId;
      eventId = maybeEventId;
    }
    if (!fest || !eventId) return;
    setActionBusy(true);
    setLocalError('');
    try {
      const id = resolveIdentifier(fest);
      await linkEventToFest(id, eventId);
      await loadFestByIdentifier(id);
      showToast('🔗 Event linked successfully!', 'success');
    } catch (err) {
      const msg = err?.message || 'Failed to link event.';
      setLocalError(msg);
      setDashboardError(msg);
      showToast(msg, 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const handleUnlinkEvent = async (eventId) => {
    if (!activeFest || !eventId) return;
    if (!window.confirm('Unlink this event?')) return;
    setActionBusy(true);
    setLocalError('');
    try {
      const id = resolveIdentifier(activeFest);
      await unlinkEventFromFest(id, eventId);
      await loadFestByIdentifier(id);
      showToast('Event unlinked successfully', 'success');
    } catch (err) {
      const msg = err?.message || 'Failed to unlink event.';
      setLocalError(msg);
      setDashboardError(msg);
      showToast(msg, 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const addNewPartner = async (formData) => {
    if (!activeFest) return;
    setActionBusy(true);
    setLocalError('');
    try {
      const id = resolveIdentifier(activeFest);
      await addPartner(id, formData);
      await loadFestByIdentifier(id);
      showToast('🤝 Partner added successfully!', 'success');
    } catch (err) {
      const msg = err?.message || 'Failed to add partner.';
      setLocalError(msg);
      setDashboardError(msg);
      showToast(msg, 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const removeExistingPartner = async (partnerName) => {
    if (!activeFest) return;
    if (!window.confirm(`Remove partner "${partnerName}"?`)) return;
    setActionBusy(true);
    setLocalError('');
    try {
      const id = resolveIdentifier(activeFest);
      await removePartner(id, partnerName);
      await loadFestByIdentifier(id);
      showToast('Partner removed successfully', 'success');
    } catch (err) {
      const msg = err?.message || 'Failed to remove partner.';
      setLocalError(msg);
      setDashboardError(msg);
      showToast(msg, 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const loadAnalytics = async () => {
    setLocalError('');
    setActionBusy(true);
    try {
      const analytics = await getFestAnalytics();
      const stats = await getFestStatistics();
      setActiveFest({ __analytics: true, analytics, statistics: stats });
      setPartners([]);
    } catch (err) {
      const msg = err?.message || 'Failed to load analytics.';
      setLocalError(msg);
      setDashboardError(msg);
      showToast(msg, 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const generateReport = async (fest) => {
    if (!fest) return;
    setActionBusy(true);
    setLocalError('');
    try {
      const id = resolveIdentifier(fest);
      const report = await generateFestReport(id);
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `arvantis-report-${safeFilename(String(fest.year || id))}.json`);
      showToast('📈 Report generated successfully!', 'success');
    } catch (err) {
      const msg = err?.message || 'Failed to generate report.';
      setLocalError(msg);
      setDashboardError(msg);
      showToast(msg, 'error');
    } finally {
      setActionBusy(false);
    }
  };

  // Premium UI Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      {/* Enhanced Header */}
      <GlassCard className="p-8 mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Arvantis Manager
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Premium festival management platform
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                aria-label="Search fests"
                placeholder="Search festivals..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-6 py-4 w-full sm:w-80 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={loadAnalytics}
                disabled={actionBusy}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:scale-105 transition-all duration-300 disabled:opacity-50 group"
                title="Analytics Dashboard"
              >
                <BarChart2 className="w-5 h-5 text-gray-300 group-hover:text-purple-300" />
              </button>

              <button
                onClick={exportCSV}
                disabled={downloadingCSV || actionBusy}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:scale-105 transition-all duration-300 disabled:opacity-50 group"
                title="Export Data"
              >
                <DownloadCloud className="w-5 h-5 text-gray-300 group-hover:text-purple-300" />
              </button>

              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/25 font-semibold"
              >
                <Plus className="w-5 h-5" />
                New Festival
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {localError && (
        <div className="mb-6 p-6 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-sm font-medium backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">!</div>
            {localError}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Enhanced Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Filter by Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => handleSelectYear(e.target.value)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,<svg%20xmlns%3D\"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\"%20viewBox%3D\"0%200%204%205\"><path%20fill%3D\"%236B7280\"%20d%3D\"m2%200%202%202.5L2%205%200%202.5Z\"/></svg>')] bg-no-repeat bg-right-4 bg-size-10"
                >
                  <option value="">All Years</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => fetchYearsAndLatest()}
                disabled={loading || actionBusy}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 disabled:opacity-50 mt-6"
                title="Refresh"
              >
                <Zap className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {loading ? (
                <LoadingSpinner text="Loading festivals..." />
              ) : visibleFests.length === 0 ? (
                <EmptyState
                  title="No festivals found"
                  subtitle={query || selectedYear ? "Try adjusting your filters" : "Create your first festival to get started"}
                  icon={Trophy}
                  action={
                    <button
                      onClick={() => setCreateOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold"
                    >
                      Create Festival
                    </button>
                  }
                />
              ) : (
                visibleFests.map((f) => (
                  <button
                    key={f.slug || f._id || f.year}
                    onClick={() => loadFestByIdentifier(f.slug || f.year || f._id)}
                    disabled={actionBusy}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${
                      activeFest && resolveIdentifier(activeFest) === resolveIdentifier(f)
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 shadow-2xl scale-[1.02]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30 hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-white text-lg group-hover:text-purple-200 transition-colors truncate">
                            {f.name || 'Arvantis'} {f.year}
                          </h3>
                          <Badge variant={f.status} size="sm">
                            {f.status}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-3 leading-relaxed">
                          {f.description || 'No description available'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {f.startDate ? new Date(f.startDate).toLocaleDateString() : 'TBD'}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {f.location || 'LPU'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Enhanced Main Content */}
        <div className="xl:col-span-3">
          {loading ? (
            <GlassCard>
              <LoadingSpinner size="lg" text="Loading festival details..." />
            </GlassCard>
          ) : activeFest ? (
            activeFest.__analytics ? (
              <GlassCard className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-3">Analytics Dashboard</h2>
                    <p className="text-gray-400 text-lg">Comprehensive festival insights and performance metrics</p>
                  </div>
                  <button
                    onClick={() => fetchYearsAndLatest()}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all duration-300 font-semibold"
                  >
                    Back to Festivals
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Festivals"
                    value={activeFest.statistics?.totalFests || '0'}
                    icon={Trophy}
                    trend="+12%"
                  />
                  <StatCard
                    title="Active Events"
                    value={activeFest.statistics?.activeEvents || '0'}
                    icon={Calendar}
                    trend="+5%"
                  />
                  <StatCard
                    title="Partners"
                    value={activeFest.statistics?.totalPartners || '0'}
                    icon={Users}
                    trend="+8%"
                  />
                  <StatCard
                    title="Engagement"
                    value="94%"
                    icon={BarChart2}
                    trend="+3%"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GlassCard className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                      <BarChart2 className="w-6 h-6 text-purple-400" />
                      Performance Summary
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(activeFest.statistics || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-gray-300 font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                          <span className="text-white font-bold text-lg">{value}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                      Yearly Overview
                    </h3>
                    <div className="space-y-4">
                      {(activeFest.analytics || []).map((row) => (
                        <div key={row.year} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div>
                            <span className="text-white font-bold text-lg">{row.year}</span>
                            <div className="flex gap-4 text-sm text-gray-400 mt-1">
                              <span>{row.eventCount} events</span>
                              <span>{row.partnerCount} partners</span>
                            </div>
                          </div>
                          <Badge variant={row.year === new Date().getFullYear() ? 'ongoing' : 'completed'}>
                            {row.year === new Date().getFullYear() ? 'Current' : 'Completed'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </GlassCard>
            ) : (
              <div className="space-y-8">
                {/* Festival Header */}
                <GlassCard className="p-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-4xl font-bold text-white">
                          {activeFest.name || 'Arvantis'}
                        </h2>
                        <Badge variant={activeFest.status} size="lg">
                          {activeFest.status}
                        </Badge>
                      </div>
                      
                      <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                        {activeFest.description || 'No description provided for this festival.'}
                      </p>

                      <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl">
                          <Calendar className="w-5 h-5 text-purple-400" />
                          {activeFest.startDate && activeFest.endDate ? (
                            <span className="font-medium">
                              {new Date(activeFest.startDate).toLocaleDateString()} - {' '}
                              {new Date(activeFest.endDate).toLocaleDateString()}
                            </span>
                          ) : (
                            'Dates to be announced'
                          )}
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl">
                          <MapPin className="w-5 h-5 text-purple-400" />
                          <span className="font-medium">
                            {activeFest.location || 'Lovely Professional University'}
                          </span>
                        </div>
                        {activeFest.contactEmail && (
                          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl">
                            <Users className="w-5 h-5 text-purple-400" />
                            <span className="font-medium">{activeFest.contactEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => openEdit(activeFest)}
                        disabled={actionBusy}
                        className="flex items-center gap-2 px-5 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-2xl hover:bg-blue-500/30 hover:scale-105 transition-all duration-300 font-semibold"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => generateReport(activeFest)}
                        disabled={actionBusy}
                        className="flex items-center gap-2 px-5 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-2xl hover:bg-purple-500/30 hover:scale-105 transition-all duration-300 font-semibold"
                      >
                        <BarChart2 className="w-4 h-4" />
                        Report
                      </button>

                      <button
                        onClick={() => removeFest(activeFest)}
                        disabled={actionBusy}
                        className="flex items-center gap-2 px-5 py-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-2xl hover:bg-red-500/30 hover:scale-105 transition-all duration-300 font-semibold"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </GlassCard>

                {/* Partners & Events Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Partners Section */}
                  <GlassCard className="p-6">
                    <div 
                      className="flex items-center justify-between cursor-pointer mb-6 p-4 hover:bg-white/5 rounded-2xl transition-all duration-300"
                      onClick={() => toggleSection('partners')}
                    >
                      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Building2 className="w-6 h-6 text-purple-400" />
                        Partners & Sponsors
                        <Badge variant="premium" className="ml-2">
                          {(partners || []).length}
                        </Badge>
                      </h3>
                      {expandedSections.partners ? 
                        <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      }
                    </div>

                    {expandedSections.partners && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        {(partners || []).length === 0 ? (
                          <EmptyState
                            title="No partners yet"
                            subtitle="Add your first partner to showcase collaboration"
                            icon={Users}
                            action={
                              <PartnerQuickAdd
                                onAdd={addNewPartner}
                                disabled={actionBusy}
                              />
                            }
                          />
                        ) : (
                          <>
                            <div className="space-y-4">
                              {partners.map((p, idx) => (
                                <div
                                  key={p.publicId || p.name || idx}
                                  className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                                >
                                  <div className="flex items-center gap-4">
                                    {p.logo?.url ? (
                                      <img
                                        src={p.logo.url}
                                        alt={p.name}
                                        className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                                      />
                                    ) : (
                                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Star className="w-6 h-6 text-purple-300" />
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-white font-bold text-lg">{p.name}</div>
                                      <div className="flex items-center gap-3 mt-2">
                                        <Badge variant={p.tier === 'sponsor' ? 'sponsor' : 'collaborator'}>
                                          {p.tier || 'partner'}
                                        </Badge>
                                        {p.website && (
                                          <a 
                                            href={p.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                                          >
                                            Visit Website
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removeExistingPartner(p.name)}
                                    disabled={actionBusy}
                                    className="p-3 text-red-400 hover:bg-red-500/20 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <PartnerQuickAdd
                              onAdd={addNewPartner}
                              disabled={actionBusy}
                            />
                          </>
                        )}
                      </div>
                    )}
                  </GlassCard>

                  {/* Events Section */}
                  <GlassCard className="p-6">
                    <div 
                      className="flex items-center justify-between cursor-pointer mb-6 p-4 hover:bg-white/5 rounded-2xl transition-all duration-300"
                      onClick={() => toggleSection('events')}
                    >
                      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-purple-400" />
                        Festival Events
                        <Badge variant="premium" className="ml-2">
                          {(activeFest.events || []).length}
                        </Badge>
                      </h3>
                      {expandedSections.events ? 
                        <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      }
                    </div>

                    {expandedSections.events && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        {(activeFest.events || []).length === 0 ? (
                          <EmptyState
                            title="No events linked"
                            subtitle="Link events to build your festival schedule"
                            icon={Calendar}
                          />
                        ) : (
                          <div className="space-y-4">
                            {(activeFest.events || []).map((ev) => (
                              <div
                                key={ev._id || ev}
                                className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Calendar className="w-5 h-5 text-blue-300" />
                                  </div>
                                  <div>
                                    <div className="text-white font-bold text-lg">
                                      {ev.title || ev}
                                    </div>
                                    <div className="text-gray-400 text-sm mt-1">
                                      {ev.date ? new Date(ev.date).toLocaleDateString() : 'Date TBD'}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleUnlinkEvent(ev._id || ev)}
                                  disabled={actionBusy}
                                  className="p-3 text-red-400 hover:bg-red-500/20 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                                  title="Unlink event"
                                >
                                  <Unlink className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-4 border-t border-white/10">
                          <select
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v) handleLinkEvent(activeFest, v);
                              e.target.value = '';
                            }}
                            disabled={actionBusy}
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,<svg%20xmlns%3D\"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\"%20viewBox%3D\"0%200%204%205\"><path%20fill%3D\"%236B7280\"%20d%3D\"m2%200%202%202.5L2%205%200%202.5Z\"/></svg>')] bg-no-repeat bg-right-4 bg-size-10"
                          >
                            <option value="">+ Link New Event</option>
                            {(events || []).map((ev) => (
                              <option key={ev._id} value={ev._id}>
                                {ev.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                </div>

                {/* Media Section */}
                <GlassCard className="p-6">
                  <div 
                    className="flex items-center justify-between cursor-pointer mb-6 p-4 hover:bg-white/5 rounded-2xl transition-all duration-300"
                    onClick={() => toggleSection('media')}
                  >
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Image className="w-6 h-6 text-purple-400" />
                      Media Gallery
                      <Badge variant="premium" className="ml-2">
                        {((activeFest.gallery || []).length) + (activeFest.poster?.url ? 1 : 0)}
                      </Badge>
                    </h3>
                    {expandedSections.media ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </div>

                  {expandedSections.media && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      {/* Poster Section */}
                      <div>
                        <h4 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                          <Camera className="w-5 h-5 text-purple-400" />
                          Event Poster
                        </h4>
                        {activeFest.poster?.url ? (
                          <div className="relative group">
                            <img
                              src={activeFest.poster.url}
                              alt="Festival poster"
                              className="w-full max-w-md rounded-3xl shadow-2xl transition-all duration-300 group-hover:shadow-3xl"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl flex items-center justify-center">
                              <button
                                onClick={() => document.getElementById('poster-upload')?.click()}
                                disabled={actionBusy}
                                className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl text-white hover:bg-white/30 transition-all duration-300 font-semibold"
                              >
                                Change Poster
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 bg-white/5 rounded-3xl border-2 border-dashed border-white/10 text-center hover:border-purple-500/50 transition-all duration-300">
                            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-4">No poster uploaded yet</p>
                            <button
                              onClick={() => document.getElementById('poster-upload')?.click()}
                              disabled={actionBusy}
                              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg shadow-purple-500/25"
                            >
                              Upload Poster
                            </button>
                          </div>
                        )}
                        <input
                          id="poster-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => uploadPoster(e.target.files?.[0])}
                          className="hidden"
                          disabled={actionBusy}
                        />
                      </div>

                      {/* Gallery Section */}
                      <div>
                        <h4 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                          <Film className="w-5 h-5 text-purple-400" />
                          Media Gallery
                          <Badge variant="default" className="ml-2">
                            {(activeFest.gallery || []).length} items
                          </Badge>
                        </h4>

                        {(activeFest.gallery || []).length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {(activeFest.gallery || []).map((g) => (
                              <div key={g.publicId} className="relative group">
                                <img
                                  src={g.url}
                                  alt={g.caption || 'Gallery media'}
                                  className="w-full h-32 object-cover rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                                  <button
                                    onClick={() => removeGalleryItem(g.publicId)}
                                    disabled={actionBusy}
                                    className="p-2 bg-red-500/80 text-white rounded-xl hover:bg-red-600 transition-all duration-200"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 bg-white/5 rounded-3xl border-2 border-dashed border-white/10 text-center hover:border-purple-500/50 transition-all duration-300">
                            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg">No gallery items yet</p>
                          </div>
                        )}

                        <div className="mt-6">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={(e) => addGallery([...e.target.files])}
                            disabled={actionBusy}
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:from-purple-600 hover:file:to-pink-600 transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>
            )
          ) : (
            <EmptyState
              title="No festival selected"
              subtitle="Choose a festival from the sidebar or create a new one to get started"
              icon={Trophy}
              size="lg"
              action={
                <button
                  onClick={() => setCreateOpen(true)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-300 font-semibold shadow-2xl shadow-purple-500/25"
                >
                  Create New Festival
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* Enhanced Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <GlassCard className="w-full max-w-2xl p-8 animate-in zoom-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-white">Create New Festival</h3>
                <p className="text-gray-400 mt-2">Start a new festival edition</p>
              </div>
              <button
                onClick={() => setCreateOpen(false)}
                className="p-3 hover:bg-white/10 rounded-2xl transition-all duration-300"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Festival Year
                  </label>
                  <input
                    type="number"
                    value={createForm.year}
                    onChange={(e) => setCreateForm({ ...createForm, year: Number(e.target.value) || new Date().getFullYear() })}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Location
                  </label>
                  <input
                    value="Lovely Professional University"
                    disabled
                    className="w-full p-4 bg-white/10 border border-white/10 rounded-2xl text-gray-400 cursor-not-allowed backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={4}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 resize-none"
                  placeholder="Describe your festival vision, theme, and highlights..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>

              {localError && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-sm font-medium">
                  {localError}
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-300 disabled:opacity-50 font-semibold text-lg shadow-2xl shadow-purple-500/25"
                >
                  {createLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Festival...
                    </div>
                  ) : (
                    'Create Festival'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all duration-300 font-semibold text-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Enhanced Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <GlassCard className="w-full max-w-2xl p-8 animate-in zoom-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-white">Edit Festival</h3>
                <p className="text-gray-400 mt-2">Update festival details</p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="p-3 hover:bg-white/10 rounded-2xl transition-all duration-300"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Festival Name
                </label>
                <input
                  value={editForm.name}
                  disabled
                  className="w-full p-4 bg-white/10 border border-white/10 rounded-2xl text-gray-400 cursor-not-allowed backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>

              {localError && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-sm font-medium">
                  {localError}
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button
                  onClick={saveEdit}
                  disabled={actionBusy}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-300 disabled:opacity-50 font-semibold text-lg shadow-2xl shadow-purple-500/25"
                >
                  {actionBusy ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Changes...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  onClick={() => setEditOpen(false)}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all duration-300 font-semibold text-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Enhanced Toast Notifications */}
      {toast && (
        <div className="fixed top-8 right-8 z-50 animate-in slide-in-from-right-full duration-500">
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ArvantisTab;