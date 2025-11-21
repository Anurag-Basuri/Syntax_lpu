import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	getAllFests,
	getFestDetails,
	createFest,
	updateFestDetails,
	deleteFest,
	addFestPoster,
	removeFestPoster,
	updateFestHero,
	removeFestHero,
	addGalleryMedia,
	removeGalleryMedia,
	addPartner,
	updatePartner,
	removePartner,
	reorderPartners,
	linkEventToFest,
	unlinkEventFromFest,
	exportFestsCSV,
	downloadFestAnalytics,
	downloadFestStatistics,
	downloadFestReport,
	setFestStatus,
	updatePresentation,
	updateSocialLinks,
	updateThemeColors,
	addTrack,
	removeTrack,
	reorderTracks,
	addFAQ,
	removeFAQ,
	reorderFAQs,
	addGuideline,
	updateGuideline,
	removeGuideline,
	reorderGuidelines,
	addPrize,
	updatePrize,
	removePrize,
	reorderPrizes,
	addGuest,
	updateGuest,
	removeGuest,
	bulkDeleteMedia,
	duplicateFest,
} from '../../services/arvantisServices.js';

import GlassCard from '../../components/Arvantis/GlassCard.jsx';
import LoadingSpinner from '../../components/Arvantis/LoadingSpinner.jsx';
import FestList from '../../components/Arvantis/FestList.jsx';
import FestUtilities from '../../components/Arvantis/FestUtilities.jsx';
import FestHeader from '../../components/Arvantis/FestHeader.jsx';
import BasicDetails from '../../components/Arvantis/BasicDetails.jsx';
import MediaSection from '../../components/Arvantis/MediaSection.jsx';
import EditGuidelines from '../../components/Arvantis/EditGuidelines.jsx';
import EditPrizes from '../../components/Arvantis/EditPrizes.jsx';
import EditGuests from '../../components/Arvantis/EditGuests.jsx';
import PartnerQuickAdd from '../../components/Arvantis/PartnerQuickAdd.jsx';
import EditPrizesIcon from '../../components/Arvantis/Badge.jsx'; // not used, kept for future
import Toast from '../../components/Arvantis/Toast.jsx';
import EmptyState from '../../components/Arvantis/EmptyState.jsx';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const FILE_TYPES_IMAGES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

const safeFilename = (s = '') => String(s).replace(/[:]/g, '-').replace(/\s+/g, '-');

const EditArvantis = ({ setDashboardError = () => {} }) => {
	// lists / selection
	const [fests, setFests] = useState([]);
	const [selectedFestId, setSelectedFestId] = useState(null);

	// UI states
	const [loading, setLoading] = useState(true);
	const [actionBusy, setActionBusy] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [createLoading, setCreateLoading] = useState(false);
	const [downloadingCSV, setDownloadingCSV] = useState(false);
	const [toast, setToast] = useState(null);
	const toastTimerRef = useRef(null);

	// edit state
	const [editForm, setEditForm] = useState(null);
	const [heroFile, setHeroFile] = useState(null);
	const [heroCaption, setHeroCaption] = useState('');
	const [mediaSelection, setMediaSelection] = useState(new Set());
	const [bulkDeleting, setBulkDeleting] = useState(false);

	// Quick-add inputs for sub sections
	const [guidelineQuickTitle, setGuidelineQuickTitle] = useState('');
	const [guidelineQuickDetails, setGuidelineQuickDetails] = useState('');
	const [prizeQuickTitle, setPrizeQuickTitle] = useState('');
	const [prizeQuickPosition, setPrizeQuickPosition] = useState('');
	const [prizeQuickAmount, setPrizeQuickAmount] = useState('');
	const [prizeQuickCurrency, setPrizeQuickCurrency] = useState('INR');
	const [prizeQuickDescription, setPrizeQuickDescription] = useState('');
	const [guestQuickName, setGuestQuickName] = useState('');
	const [guestQuickBio, setGuestQuickBio] = useState('');

	// refs
	const mountedRef = useRef(false);

	/* ---------- helpers ---------- */
	const showToast = useCallback((type, message, ttl = 4000) => {
		setToast({ type, message });
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		toastTimerRef.current = setTimeout(() => setToast(null), ttl);
	}, []);

	const handleError = useCallback(
		(err, fallback = 'Request failed') => {
			const msg = err?.response?.data?.message || err?.message || fallback;
			showToast('error', msg);
			console.error(err);
			return msg;
		},
		[showToast]
	);

	const normalizeFest = useCallback((raw) => {
		if (!raw) return null;
		// server may return Mongoose doc or plain object
		const obj = raw.toObject ? raw.toObject() : raw;
		// ensure arrays exist
		obj.partners = obj.partners || [];
		obj.posters = obj.posters || [];
		obj.gallery = obj.gallery || [];
		obj.tracks = obj.tracks || [];
		obj.faqs = obj.faqs || [];
		obj.guidelines = obj.guidelines || [];
		obj.prizes = obj.prizes || [];
		obj.guests = obj.guests || [];
		return obj;
	}, []);

	/* ---------- data fetchers ---------- */
	const fetchFests = useCallback(async () => {
		setLoading(true);
		try {
			const page = await getAllFests({ page: 1, limit: 100 }, { admin: true });
			const docs = page.docs || [];
			setFests(docs);
			// keep selection if exists else pick latest
			if (!selectedFestId && docs.length > 0) {
				setSelectedFestId(docs[0]._id || docs[0].id || docs[0].year);
			}
		} catch (err) {
			setDashboardError(handleError(err, 'Failed to load fests'));
		} finally {
			setLoading(false);
		}
	}, [selectedFestId, setDashboardError, handleError]);

	const loadFestDetails = useCallback(
		async (identifier) => {
			if (!identifier) return;
			setActionBusy(true);
			try {
				const data = await getFestDetails(identifier, { admin: true });
				const norm = normalizeFest(data);
				setEditForm(norm);
				setSelectedFestId(norm?._id || norm?.id || identifier);
				// sync hero caption local input
				setHeroCaption(norm?.heroMedia?.caption || norm?.hero?.caption || '');
			} catch (err) {
				handleError(err, 'Failed to load fest details');
			} finally {
				setActionBusy(false);
			}
		},
		[normalizeFest, handleError]
	);

	/* initial load */
	useEffect(() => {
		if (mountedRef.current) return;
		mountedRef.current = true;
		void (async () => {
			await fetchFests();
			setLoading(false);
		})();
	}, [fetchFests]);

	/* keep selection changes loading details */
	useEffect(() => {
		if (!selectedFestId) return;
		void loadFestDetails(selectedFestId);
	}, [selectedFestId, loadFestDetails]);

	/* ---------- create / update / delete ---------- */
	const handleCreateSubmit = useCallback(
		async (payload) => {
			setCreateLoading(true);
			try {
				const created = await createFest(payload);
				showToast('success', 'Fest created');
				await fetchFests();
				setCreateOpen(false);
				// load created fest
				await loadFestDetails(created._id || created.id || created.year);
			} catch (err) {
				handleError(err, 'Failed to create fest');
			} finally {
				setCreateLoading(false);
			}
		},
		[fetchFests, loadFestDetails, showToast, handleError]
	);

	const saveEdit = useCallback(async () => {
		if (!editForm) return;
		setActionBusy(true);
		try {
			const payload = {
				// only allow editable fields
				name: editForm.name,
				description: editForm.description,
				tagline: editForm.tagline,
				startDate: editForm.startDate,
				endDate: editForm.endDate,
				location: editForm.location,
				contactEmail: editForm.contactEmail,
				contactPhone: editForm.contactPhone,
				status: editForm.status,
			};
			const updated = await updateFestDetails(
				editForm._id || editForm.id || editForm.slug,
				payload
			);
			setEditForm(normalizeFest(updated));
			showToast('success', 'Fest updated');
			// refresh list
			void fetchFests();
		} catch (err) {
			handleError(err, 'Failed to save fest');
		} finally {
			setActionBusy(false);
		}
	}, [editForm, normalizeFest, fetchFests, showToast, handleError]);

	const removeFestHandler = useCallback(
		async (fest) => {
			if (!fest) return;
			// confirm
			/* eslint-disable no-alert */
			if (!confirm(`Delete fest ${fest.name || fest.year}? This is irreversible.`)) return;
			/* eslint-enable no-alert */
			setActionBusy(true);
			try {
				await deleteFest(fest._id || fest.id || fest.slug);
				showToast('success', 'Fest deleted');
				setEditForm(null);
				setSelectedFestId(null);
				await fetchFests();
			} catch (err) {
				handleError(err, 'Failed to delete fest');
			} finally {
				setActionBusy(false);
			}
		},
		[fetchFests, showToast, handleError]
	);

	/* ---------- media ---------- */
	const uploadPosterHandler = useCallback(
		async (files) => {
			if (!editForm) return;
			if (!files || files.length === 0) return;
			setActionBusy(true);
			try {
				const fd = new FormData();
				files.forEach((f) => fd.append('posters', f));
				const res = await addFestPoster(editForm._id || editForm.id || editForm.slug, fd);
				// append new posters to editForm
				setEditForm((s) => {
					const copy = { ...(s || {}) };
					copy.posters = [...(copy.posters || []), ...(Array.isArray(res) ? res : [res])];
					return copy;
				});
				showToast('success', 'Poster(s) uploaded');
			} catch (err) {
				handleError(err, 'Failed to upload posters');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	const removePosterHandler = useCallback(
		async (publicId) => {
			if (!editForm || !publicId) return;
			if (!confirm('Delete this poster?')) return;
			setActionBusy(true);
			try {
				await removeFestPoster(editForm._id || editForm.id || editForm.slug, publicId);
				setEditForm((s) => {
					const copy = { ...(s || {}) };
					copy.posters = (copy.posters || []).filter((p) => p.publicId !== publicId);
					return copy;
				});
				showToast('success', 'Poster removed');
			} catch (err) {
				handleError(err, 'Failed to remove poster');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	const uploadHeroHandler = useCallback(
		async (file, caption) => {
			if (!editForm || !file) return;
			setActionBusy(true);
			try {
				const fd = new FormData();
				fd.append('hero', file);
				if (caption) fd.append('caption', caption);
				const res = await updateFestHero(editForm._id || editForm.id || editForm.slug, fd);
				setEditForm((s) => ({ ...(s || {}), heroMedia: res }));
				setHeroFile(null);
				showToast('success', 'Hero updated');
			} catch (err) {
				handleError(err, 'Failed to update hero');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	const removeHeroHandler = useCallback(async () => {
		if (!editForm) return;
		if (!confirm('Delete hero image?')) return;
		setActionBusy(true);
		try {
			await removeFestHero(editForm._id || editForm.id || editForm.slug);
			setEditForm((s) => ({ ...(s || {}), heroMedia: undefined }));
			showToast('success', 'Hero removed');
		} catch (err) {
			handleError(err, 'Failed to remove hero');
		} finally {
			setActionBusy(false);
		}
	}, [editForm, showToast, handleError]);

	const addGalleryHandler = useCallback(
		async (files) => {
			if (!editForm || !files || files.length === 0) return;
			setActionBusy(true);
			try {
				const fd = new FormData();
				files.forEach((f) => fd.append('media', f));
				const res = await addGalleryMedia(editForm._id || editForm.id || editForm.slug, fd);
				setEditForm((s) => ({
					...(s || {}),
					gallery: [...(s.gallery || []), ...(Array.isArray(res) ? res : [res])],
				}));
				showToast('success', 'Gallery items added');
			} catch (err) {
				handleError(err, 'Failed to add gallery media');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	const removeGalleryHandler = useCallback(
		async (publicId) => {
			if (!editForm || !publicId) return;
			if (!confirm('Remove gallery item?')) return;
			setActionBusy(true);
			try {
				await removeGalleryMedia(editForm._id || editForm.id || editForm.slug, publicId);
				setEditForm((s) => ({
					...(s || {}),
					gallery: (s.gallery || []).filter((g) => g.publicId !== publicId),
				}));
				showToast('success', 'Gallery item removed');
			} catch (err) {
				handleError(err, 'Failed to remove gallery item');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	/* ---------- partners ---------- */
	const addPartnerHandler = useCallback(
		async (payload) => {
			if (!editForm) return;
			setActionBusy(true);
			try {
				const res = await addPartner(editForm._id || editForm.id || editForm.slug, payload);
				// if sent FormData, backend returns created partner
				setEditForm((s) => ({ ...(s || {}), partners: [...(s.partners || []), res] }));
				showToast('success', 'Partner added');
			} catch (err) {
				handleError(err, 'Failed to add partner');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	const updatePartnerHandler = useCallback(
		async (partnerName, payload) => {
			if (!editForm) return;
			setActionBusy(true);
			try {
				const res = await updatePartner(
					editForm._id || editForm.id || editForm.slug,
					partnerName,
					payload
				);
				setEditForm((s) => {
					const copy = { ...(s || {}) };
					copy.partners = (copy.partners || []).map((p) =>
						p.name === partnerName ? res : p
					);
					return copy;
				});
				showToast('success', 'Partner updated');
			} catch (err) {
				handleError(err, 'Failed to update partner');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	const removePartnerHandler = useCallback(
		async (partnerName) => {
			if (!editForm || !partnerName) return;
			if (!confirm(`Remove partner ${partnerName}?`)) return;
			setActionBusy(true);
			try {
				await removePartner(editForm._id || editForm.id || editForm.slug, partnerName);
				setEditForm((s) => ({
					...(s || {}),
					partners: (s.partners || []).filter((p) => p.name !== partnerName),
				}));
				showToast('success', 'Partner removed');
			} catch (err) {
				handleError(err, 'Failed to remove partner');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	const reorderPartnersHandler = useCallback(
		async (order) => {
			if (!editForm || !Array.isArray(order)) return;
			setActionBusy(true);
			try {
				const res = await reorderPartners(
					editForm._id || editForm.id || editForm.slug,
					order
				);
				setEditForm((s) => ({ ...(s || {}), partners: res }));
				showToast('success', 'Partners reordered');
			} catch (err) {
				handleError(err, 'Failed to reorder partners');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	/* ---------- sub-resources: guidelines / prizes / guests ---------- */
	const handleAddGuideline = useCallback(async () => {
		if (!editForm) return;
		const payload = { title: guidelineQuickTitle || '', details: guidelineQuickDetails || '' };
		setActionBusy(true);
		try {
			const added = await addGuideline(editForm._id || editForm.id || editForm.slug, payload);
			setEditForm((s) => ({ ...(s || {}), guidelines: [...(s.guidelines || []), added] }));
			setGuidelineQuickTitle('');
			setGuidelineQuickDetails('');
			showToast('success', 'Guideline added');
		} catch (err) {
			handleError(err, 'Failed to add guideline');
		} finally {
			setActionBusy(false);
		}
	}, [editForm, guidelineQuickTitle, guidelineQuickDetails, showToast, handleError]);

	const handleRemoveGuideline = useCallback(
		async (id) => {
			if (!editForm || !id) return;
			setActionBusy(true);
			try {
				await removeGuideline(editForm._id || editForm.id || editForm.slug, id);
				setEditForm((s) => ({
					...(s || {}),
					guidelines: (s.guidelines || []).filter(
						(g) => String(g.id || g._id) !== String(id)
					),
				}));
				showToast('success', 'Guideline removed');
			} catch (err) {
				handleError(err, 'Failed to remove guideline');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	const handleReorderGuidelines = useCallback(
		async (order) => {
			if (!editForm || !Array.isArray(order)) return;
			setActionBusy(true);
			try {
				const res = await reorderGuidelines(
					editForm._id || editForm.id || editForm.slug,
					order
				);
				setEditForm((s) => ({ ...(s || {}), guidelines: res }));
				showToast('success', 'Guidelines reordered');
			} catch (err) {
				handleError(err, 'Failed to reorder guidelines');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	const handleAddPrize = useCallback(
		async (payload) => {
			if (!editForm) return;
			setActionBusy(true);
			try {
				const added = await addPrize(editForm._id || editForm.id || editForm.slug, payload);
				setEditForm((s) => ({ ...(s || {}), prizes: [...(s.prizes || []), added] }));
				showToast('success', 'Prize added');
			} catch (err) {
				handleError(err, 'Failed to add prize');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	const handleRemovePrize = useCallback(
		async (id) => {
			if (!editForm || !id) return;
			setActionBusy(true);
			try {
				await removePrize(editForm._id || editForm.id || editForm.slug, id);
				setEditForm((s) => ({
					...(s || {}),
					prizes: (s.prizes || []).filter((p) => String(p.id || p._id) !== String(id)),
				}));
				showToast('success', 'Prize removed');
			} catch (err) {
				handleError(err, 'Failed to remove prize');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	const handleReorderPrizes = useCallback(
		async (order) => {
			if (!editForm || !Array.isArray(order)) return;
			setActionBusy(true);
			try {
				const res = await reorderPrizes(
					editForm._id || editForm.id || editForm.slug,
					order
				);
				setEditForm((s) => ({ ...(s || {}), prizes: res }));
				showToast('success', 'Prizes reordered');
			} catch (err) {
				handleError(err, 'Failed to reorder prizes');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	const handleAddGuest = useCallback(
		async (payload) => {
			if (!editForm) return;
			setActionBusy(true);
			try {
				const added = await addGuest(editForm._id || editForm.id || editForm.slug, payload);
				setEditForm((s) => ({ ...(s || {}), guests: [...(s.guests || []), added] }));
				setGuestQuickName('');
				setGuestQuickBio('');
				showToast('success', 'Guest added');
			} catch (err) {
				handleError(err, 'Failed to add guest');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	const handleUpdateGuest = useCallback(
		async (guestId, updates) => {
			if (!editForm || !guestId) return;
			setActionBusy(true);
			try {
				const res = await updateGuest(
					editForm._id || editForm.id || editForm.slug,
					guestId,
					updates
				);
				setEditForm((s) => ({
					...(s || {}),
					guests: (s.guests || []).map((g) =>
						String(g.id || g._id) === String(guestId) ? res : g
					),
				}));
				showToast('success', 'Guest updated');
			} catch (err) {
				handleError(err, 'Failed to update guest');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	const handleRemoveGuest = useCallback(
		async (guestId) => {
			if (!editForm || !guestId) return;
			setActionBusy(true);
			try {
				await removeGuest(editForm._id || editForm.id || editForm.slug, guestId);
				setEditForm((s) => ({
					...(s || {}),
					guests: (s.guests || []).filter(
						(g) => String(g.id || g._id) !== String(guestId)
					),
				}));
				showToast('success', 'Guest removed');
			} catch (err) {
				handleError(err, 'Failed to remove guest');
			} finally {
				setActionBusy(false);
			}
		},
		[editForm, showToast, handleError]
	);

	/* ---------- misc: analytics / export / bulk delete ---------- */
	const exportCSVHandler = useCallback(async () => {
		setDownloadingCSV(true);
		try {
			const blob = await exportFestsCSV();
			// download
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `arvantis-fests-${new Date().toISOString()}.csv`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);
			showToast('success', 'CSV exported');
		} catch (err) {
			handleError(err, 'Failed to export CSV');
		} finally {
			setDownloadingCSV(false);
		}
	}, [showToast, handleError]);

	const downloadAnalyticsHandler = useCallback(async () => {
		try {
			await downloadFestAnalytics();
			showToast('success', 'Analytics downloaded');
		} catch (err) {
			handleError(err, 'Failed to download analytics');
		}
	}, [showToast, handleError]);

	const downloadStatisticsHandler = useCallback(async () => {
		try {
			await downloadFestStatistics();
			showToast('success', 'Statistics downloaded');
		} catch (err) {
			handleError(err, 'Failed to download statistics');
		}
	}, [showToast, handleError]);

	const downloadReportHandler = useCallback(
		async (identifier) => {
			try {
				await downloadFestReport(identifier);
				showToast('success', 'Report downloaded');
			} catch (err) {
				handleError(err, 'Failed to download report');
			}
		},
		[showToast, handleError]
	);

	const bulkDeleteSelectedMedia = useCallback(async () => {
		if (!editForm || mediaSelection.size === 0) return;
		if (!confirm(`Delete ${mediaSelection.size} selected media items?`)) return;
		setBulkDeleting(true);
		try {
			const publicIds = Array.from(mediaSelection);
			await bulkDeleteMedia(editForm._id || editForm.id || editForm.slug, publicIds);
			// remove from local copy
			setEditForm((s) => {
				const copy = { ...(s || {}) };
				copy.gallery = (copy.gallery || []).filter((g) => !publicIds.includes(g.publicId));
				copy.posters = (copy.posters || []).filter((p) => !publicIds.includes(p.publicId));
				if (copy.heroMedia && publicIds.includes(copy.heroMedia.publicId))
					copy.heroMedia = undefined;
				copy.partners = (copy.partners || []).map((p) => {
					if (p.logo && publicIds.includes(p.logo.publicId)) {
						const clone = { ...p };
						clone.logo = undefined;
						return clone;
					}
					return p;
				});
				return copy;
			});
			setMediaSelection(new Set());
			showToast('success', 'Selected media deleted');
		} catch (err) {
			handleError(err, 'Failed to bulk delete media');
		} finally {
			setBulkDeleting(false);
		}
	}, [editForm, mediaSelection, showToast, handleError]);

	/* ---------- helpers for UI interactions ---------- */
	const toggleMediaSelect = useCallback((publicId) => {
		setMediaSelection((s) => {
			const copy = new Set(s);
			if (copy.has(publicId)) copy.delete(publicId);
			else copy.add(publicId);
			return copy;
		});
	}, []);

	/* ---------- UI: derived ---------- */
	const visibleFests = useMemo(() => fests || [], [fests]);

	/* ---------- render ---------- */
	if (loading) {
		return <LoadingSpinner size="lg" text="Loading fests..." />;
	}

	return (
		<div className="grid grid-cols-4 gap-6 p-6">
			{toast && (
				<div className="col-span-4 fixed top-6 right-6 z-50">
					<Toast
						type={toast.type}
						message={toast.message}
						onDismiss={() => setToast(null)}
					/>
				</div>
			)}
			{/* Left column: list & utilities */}
			<div className="col-span-1 space-y-4">
				<GlassCard className="p-4">
					<FestList
						fests={visibleFests}
						selectedFestId={selectedFestId}
						loadFestDetails={(id) => void loadFestDetails(id)}
						fetchFests={() => void fetchFests()}
						setCreateOpen={setCreateOpen}
						exportCSV={exportCSVHandler}
						downloadingCSV={downloadingCSV}
					/>
				</GlassCard>

				<GlassCard className="p-4">
					<FestUtilities
						downloadAnalytics={downloadAnalyticsHandler}
						refreshEvents={() => void fetchFests()}
						downloadStatistics={downloadStatisticsHandler}
					/>
				</GlassCard>

				{!visibleFests.length && (
					<GlassCard className="p-4">
						<EmptyState
							title="No fests found"
							subtitle="Create your first Arvantis fest"
						/>
					</GlassCard>
				)}
			</div>

			{/* Main editor */}
			<div className="col-span-3">
				{!editForm ? (
					<GlassCard className="p-8">
						<div className="text-center text-gray-300">
							<h3 className="text-xl font-semibold mb-2">Select a fest to edit</h3>
							<p className="mb-4">Pick a fest from the left or create a new one.</p>
							<button
								onClick={() => setCreateOpen(true)}
								className="py-2 px-4 bg-purple-600 text-white rounded"
							>
								Create New Fest
							</button>
						</div>
					</GlassCard>
				) : (
					<GlassCard className="p-6">
						<FestHeader
							editForm={editForm}
							saveEdit={saveEdit}
							removeFest={removeFestHandler}
							downloadReport={() =>
								downloadReportHandler(editForm._id || editForm.id || editForm.slug)
							}
							actionBusy={actionBusy}
						/>

						<BasicDetails
							editForm={editForm}
							setEditForm={setEditForm}
							heroCaption={heroCaption}
							setHeroCaption={setHeroCaption}
						/>

						<MediaSection
							editForm={editForm}
							mediaSelection={mediaSelection}
							toggleMediaSelect={toggleMediaSelect}
							uploadPoster={uploadPosterHandler}
							removePoster={removePosterHandler}
							heroFile={heroFile}
							setHeroFile={setHeroFile}
							heroCaption={heroCaption}
							setHeroCaption={setHeroCaption}
							uploadHero={uploadHeroHandler}
							removeHero={removeHeroHandler}
							addGallery={addGalleryHandler}
							removeGalleryItem={removeGalleryHandler}
							actionBusy={actionBusy}
						/>

						{/* Partners quick add */}
						<div className="mb-4">
							<h4 className="font-semibold text-white mb-2">
								Partners ({(editForm.partners || []).length})
							</h4>
							<div className="grid grid-cols-3 gap-4">
								{(editForm.partners || []).map((p) => (
									<div key={p.name} className="p-3 bg-white/3 rounded">
										<div className="font-medium text-white truncate">
											{p.name}
										</div>
										<div className="text-sm text-gray-400 truncate">
											{p.tier || ''}
										</div>
									</div>
								))}
								<div>
									<PartnerQuickAdd
										onAdd={addPartnerHandler}
										disabled={actionBusy}
									/>
								</div>
							</div>
						</div>

						{/* Tracks */}
						<div className="mb-4">
							<h4 className="font-semibold text-white mb-2">
								Tracks ({(editForm.tracks || []).length})
							</h4>
							<div className="space-y-2">
								{(editForm.tracks || []).map((t) => (
									<div
										key={t.key}
										className="flex items-center justify-between p-3 bg-white/3 rounded"
									>
										<div>
											<div className="font-medium text-white">{t.title}</div>
											<div className="text-sm text-gray-400">
												{t.description}
											</div>
										</div>
										<button
											disabled={actionBusy}
											onClick={async () => {
												if (!confirm('Remove track?')) return;
												try {
													await removeTrack(
														editForm._id ||
															editForm.id ||
															editForm.slug,
														t.key
													);
													// reload fest
													await loadFestDetails(
														editForm._id || editForm.id || editForm.slug
													);
													showToast('success', 'Track removed');
												} catch (err) {
													handleError(err, 'Failed to remove track');
												}
											}}
											className="text-red-400"
										>
											Remove
										</button>
									</div>
								))}
							</div>

							<div className="mt-3 flex gap-2">
								<input
									placeholder="New track title"
									className="p-2 bg-white/5 rounded flex-1"
									value={''}
									readOnly
								/>
								{/* adding via small inline UI omitted for brevity; keep addTrack service wired in UI elsewhere */}
							</div>
						</div>

						{/* FAQs */}
						<div className="mb-4">
							<h4 className="font-semibold text-white mb-2">
								FAQs ({(editForm.faqs || []).length})
							</h4>
							<div className="space-y-2">
								{(editForm.faqs || []).map((f) => (
									<div
										key={f._id || f.question}
										className="p-3 bg-white/3 rounded"
									>
										<div className="font-medium text-white">{f.question}</div>
										<div className="text-sm text-gray-400 whitespace-pre-wrap mt-1">
											{f.answer}
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Guidelines / Prizes / Guests */}
						<EditGuidelines
							items={editForm.guidelines || []}
							quickTitle={guidelineQuickTitle}
							setQuickTitle={setGuidelineQuickTitle}
							quickDetails={guidelineQuickDetails}
							setQuickDetails={setGuidelineQuickDetails}
							onAdd={handleAddGuideline}
							onRemove={handleRemoveGuideline}
							onReorder={(fromIdx, toIdx) => {
								const arr = [...(editForm.guidelines || [])];
								if (toIdx < 0 || toIdx >= arr.length) return;
								const [moved] = arr.splice(fromIdx, 1);
								arr.splice(toIdx, 0, moved);
								handleReorderGuidelines(arr.map((g) => g.id || g._id));
							}}
							onUpdate={async (id, payload) => {
								try {
									await updateGuideline(
										editForm._id || editForm.id || editForm.slug,
										id,
										payload
									);
									await loadFestDetails(
										editForm._id || editForm.id || editForm.slug
									);
									showToast('success', 'Guideline updated');
								} catch (err) {
									handleError(err, 'Failed to update guideline');
								}
							}}
							actionBusy={actionBusy}
						/>

						<EditPrizes
							items={editForm.prizes || []}
							quickTitle={prizeQuickTitle}
							setQuickTitle={setPrizeQuickTitle}
							quickPosition={prizeQuickPosition}
							setQuickPosition={setPrizeQuickPosition}
							quickAmount={prizeQuickAmount}
							setQuickAmount={setPrizeQuickAmount}
							quickCurrency={prizeQuickCurrency}
							setQuickCurrency={setPrizeQuickCurrency}
							quickDescription={prizeQuickDescription}
							setQuickDescription={setPrizeQuickDescription}
							onAdd={() =>
								handleAddPrize({
									title: prizeQuickTitle,
									position: prizeQuickPosition,
									amount: prizeQuickAmount ? Number(prizeQuickAmount) : undefined,
									currency: prizeQuickCurrency,
									description: prizeQuickDescription,
								})
							}
							onRemove={handleRemovePrize}
							onReorder={(fromIdx, toIdx) => {
								const arr = [...(editForm.prizes || [])];
								if (toIdx < 0 || toIdx >= arr.length) return;
								const [moved] = arr.splice(fromIdx, 1);
								arr.splice(toIdx, 0, moved);
								handleReorderPrizes(arr.map((p) => p.id || p._id));
							}}
							onUpdate={async (id, payload) => {
								try {
									await updatePrize(
										editForm._id || editForm.id || editForm.slug,
										id,
										payload
									);
									await loadFestDetails(
										editForm._id || editForm.id || editForm.slug
									);
									showToast('success', 'Prize updated');
								} catch (err) {
									handleError(err, 'Failed to update prize');
								}
							}}
							actionBusy={actionBusy}
						/>

						<EditGuests
							items={editForm.guests || []}
							quickName={guestQuickName}
							setQuickName={setGuestQuickName}
							quickBio={guestQuickBio}
							setQuickBio={setGuestQuickBio}
							onAdd={() =>
								handleAddGuest({ name: guestQuickName, bio: guestQuickBio })
							}
							onUpdate={handleUpdateGuest}
							onRemove={handleRemoveGuest}
							actionBusy={actionBusy}
						/>

						{/* Bulk media delete */}
						{mediaSelection.size > 0 && (
							<div className="mt-4 flex items-center gap-3">
								<button
									disabled={bulkDeleting}
									onClick={bulkDeleteSelectedMedia}
									className="px-4 py-2 bg-red-600 text-white rounded"
								>
									Delete selected ({mediaSelection.size})
								</button>
								<button
									onClick={() => setMediaSelection(new Set())}
									className="px-3 py-2 bg-white/5 rounded"
								>
									Clear selection
								</button>
							</div>
						)}
					</GlassCard>
				)}
			</div>
		</div>
	);
};

export default EditArvantis;
