import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QrReader } from 'react-zxing';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import {
	QrCode,
	AlertCircle,
	CheckCircle,
	XCircle,
	RotateCcw,
	Mail,
	Phone,
	Calendar,
	CameraOff,
	Loader2,
} from 'lucide-react';

// 🔹 Helper to extract consistent error messages
const getErrorMessage = (err, navigate) => {
	if (err?.response?.status === 401) {
		navigate('/auth');
		return 'Unauthorized. Please login again.';
	}
	if (err?.response?.status === 404) return 'Ticket not found.';
	if (err?.response?.data?.message) return err.response.data.message;
	return err?.message || 'Something went wrong.';
};

// 🔹 Toast Component
const Toast = ({ message, type = 'info', onClose }) => {
	if (!message) return null;

	const config = {
		success: { bg: 'bg-green-900/80', text: 'text-green-200', icon: <CheckCircle size={18} /> },
		error: { bg: 'bg-red-900/80', text: 'text-red-200', icon: <XCircle size={18} /> },
		info: { bg: 'bg-blue-900/80', text: 'text-blue-200', icon: <AlertCircle size={18} /> },
	};
	const { bg, text, icon } = config[type] || config.info;

	return (
		<motion.div
			className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 ${bg} ${text}`}
			initial={{ opacity: 0, y: -25 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -25 }}
		>
			{icon}
			<span className="font-medium">{message}</span>
			<button onClick={onClose} className="ml-2 text-xl hover:opacity-70">
				×
			</button>
		</motion.div>
	);
};

// 🔹 Ticket Details Component
const TicketDetails = ({ ticket, error, onReset, onMarkUsed, updateLoading }) => {
	if (!ticket && !error) {
		return (
			<div className="text-center py-10">
				<QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
				<p className="text-gray-300">Scan a QR code to see ticket details</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-10">
				<XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
				<p className="text-red-300 font-medium">{error}</p>
				<button
					onClick={onReset}
					className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<motion.div
			className={`p-5 rounded-xl border-2 ${
				ticket.isUsed
					? 'bg-red-900/30 border-red-500/50'
					: 'bg-green-900/30 border-green-500/50'
			}`}
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3 }}
		>
			<div className="flex items-center gap-3 mb-4">
				{ticket.isUsed ? (
					<XCircle className="w-8 h-8 text-red-400" />
				) : (
					<CheckCircle className="w-8 h-8 text-green-400" />
				)}
				<div>
					<h3 className="text-xl font-bold">{ticket.fullName}</h3>
					<span
						className={`px-3 py-1 rounded-full text-sm font-medium ${
							ticket.isUsed
								? 'bg-red-500/20 text-red-300'
								: 'bg-green-500/20 text-green-300'
						}`}
					>
						{ticket.isUsed ? 'Already Used' : 'Valid Ticket'}
					</span>
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex items-center gap-3">
					<Mail className="w-5 h-5 text-blue-400" />
					<div>
						<p className="text-sm text-blue-300">Email</p>
						<p className="font-medium">{ticket.email}</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Mail className="w-5 h-5 text-blue-400" />
					<div>
						<p className="text-sm text-blue-300">LpuId</p>
						<p className="font-medium">{ticket.lpuId}</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Phone className="w-5 h-5 text-blue-400" />
					<div>
						<p className="text-sm text-blue-300">Phone</p>
						<p className="font-medium">{ticket.phone}</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Phone className="w-5 h-5 text-blue-400" />
					<div>
						<p className="text-sm text-blue-300">Hostel</p>
						<p className="font-medium">{ticket.hostel}</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Calendar className="w-5 h-5 text-blue-400" />
					<div>
						<p className="text-sm text-blue-300">Event</p>
						<p className="font-medium">{ticket.eventName}</p>
					</div>
				</div>
			</div>

			{!ticket.isUsed && (
				<button
					onClick={onMarkUsed}
					disabled={updateLoading}
					className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
				>
					{updateLoading ? (
						<>
							<Loader2 className="animate-spin" size={18} /> Updating...
						</>
					) : (
						<>
							<CheckCircle size={18} /> Mark as Used
						</>
					)}
				</button>
			)}

			<button
				onClick={onReset}
				disabled={updateLoading}
				className="w-full mt-3 py-2 border border-blue-500/30 text-blue-300 hover:bg-blue-500/10 rounded-xl transition-all duration-200 disabled:opacity-50"
			>
				Scan Another Ticket
			</button>
		</motion.div>
	);
};

// 🔹 Main QR Scanner Component
const QRScanner = () => {
	const { isAuthenticated, loading: authLoading } = useAuth();
	const navigate = useNavigate();

	const [ticket, setTicket] = useState(null);
	const [error, setError] = useState('');
	const [scanning, setScanning] = useState(true);
	const [loading, setLoading] = useState(false);
	const [updateLoading, setUpdateLoading] = useState(false);
	const [toast, setToast] = useState({ message: '', type: 'info' });
	const [cameraError, setCameraError] = useState('');

	const toastTimer = useRef();

	// Toast auto-hide
	useEffect(() => {
		if (toast.message) {
			clearTimeout(toastTimer.current);
			toastTimer.current = setTimeout(() => setToast({ message: '', type: 'info' }), 4000);
		}
		return () => clearTimeout(toastTimer.current);
	}, [toast]);

	// Redirect if not auth
	useEffect(() => {
		if (!authLoading && !isAuthenticated) navigate('/auth');
	}, [isAuthenticated, authLoading, navigate]);

	// Keyboard shortcut for reset
	useEffect(() => {
		const handleKey = (e) => e.code === 'Space' && resetScanner();
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	}, []);

	const resetScanner = useCallback(() => {
		setTicket(null);
		setError('');
		setToast({ message: '', type: 'info' });
		setCameraError('');
		setScanning(true);
		setLoading(false);
		setUpdateLoading(false);
	}, []);

	const handleCameraError = (err) => {
		const msg =
			err?.name === 'NotAllowedError'
				? 'Camera access denied. Please allow camera permission.'
				: err?.name === 'NotFoundError'
				? 'No camera device found.'
				: 'Camera error. Please check your device.';
		setCameraError(msg);
		setScanning(false);
		setToast({ message: msg, type: 'error' });
	};

	// Utility to extract ticketId robustly from QR code text
	function extractTicketId(qrText) {
		if (!qrText) return null;
		// Try JSON parse
		try {
			const parsed = JSON.parse(qrText);
			if (parsed && typeof parsed.ticketId === 'string' && parsed.ticketId.length > 0) {
				return parsed.ticketId;
			}
		} catch {
			// Not JSON, fall through
		}
		// Fallback: treat as plain ticketId string
		if (typeof qrText === 'string' && qrText.length > 0) {
			return qrText;
		}
		return null;
	}

	const handleScan = async (result) => {
		if (result?.text && scanning && !loading) {
			setScanning(false);
			setLoading(true);
			setError('');
			setToast({ message: '', type: 'info' });
			setCameraError('');

			const ticketId = extractTicketId(result.text.trim());

			// Validate ticketId (basic: length or UUID format)
			if (!ticketId || ticketId.length < 8) {
				setError('Invalid or missing ticket ID.');
				setToast({ message: 'Invalid or missing ticket ID.', type: 'error' });
				setLoading(false);
				return;
			}

			try {
				const { data } = await apiClient.get(`/api/tickets/check/${ticketId}`);
				setTicket(data.data);
				setToast({ message: 'Ticket scanned successfully!', type: 'success' });
			} catch (err) {
				let msg = getErrorMessage(err, navigate);
				if (err?.code === 'ERR_NETWORK') {
					msg = 'Network error. Please check your internet connection.';
				}
				setError(msg);
				setToast({ message: msg, type: 'error' });
				setTicket(null);
			} finally {
				setLoading(false);
			}
		}
	};

	const markAsUsed = async () => {
		if (!ticket?.ticketId) {
			setToast({ message: 'No ticket ID found.', type: 'error' });
			return;
		}
		setUpdateLoading(true);
		try {
			const { data } = await apiClient.patch(`/api/tickets/check/${ticket.ticketId}/status`, {
				isUsed: true,
			});
			setTicket(data.data);
			setToast({ message: 'Ticket marked as used!', type: 'success' });
		} catch (err) {
			setToast({ message: getErrorMessage(err, navigate), type: 'error' });
		} finally {
			setUpdateLoading(false);
		}
	};

	if (authLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e17] to-[#0f172a] text-white">
				<Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
			</div>
		);
	}

	if (!isAuthenticated) return null;

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#0f172a] text-white pt-20">
			<AnimatePresence>
				{toast.message && (
					<Toast
						message={toast.message}
						type={toast.type}
						onClose={() => setToast({ message: '', type: 'info' })}
					/>
				)}
			</AnimatePresence>

			<div className="relative z-10 max-w-5xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Scanner Section */}
				<motion.div
					className="bg-blue-900/20 backdrop-blur-lg rounded-2xl border border-blue-500/30 shadow-2xl overflow-hidden"
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="p-6">
						<h2 className="text-2xl font-bold mb-4 text-center">Scanner</h2>
						{cameraError ? (
							<div className="flex flex-col items-center justify-center py-8">
								<CameraOff className="w-16 h-16 text-red-400 mb-4" />
								<p className="text-red-300 mb-2">{cameraError}</p>
								<button
									onClick={resetScanner}
									className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
								>
									Retry
								</button>
							</div>
						) : scanning ? (
							<div className="relative">
								<div className="relative overflow-hidden rounded-xl bg-black">
									<QrReader
										onResult={(result, err) => {
											if (result) {
												handleScan(result);
											} else if (
												err &&
												(err.name === 'NotAllowedError' ||
													err.name === 'NotFoundError' ||
													err.name === 'NotReadableError' ||
													err.name === 'OverconstrainedError')
											) {
												handleCameraError(err);
											}
										}}
										constraints={{ facingMode: 'environment', aspectRatio: 1 }}
										style={{ width: '100%' }}
									/>
								</div>
								{loading && (
									<div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl">
										<Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
									</div>
								)}
							</div>
						) : (
							<div className="text-center py-8">
								<QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-300 mb-6">Scanner paused</p>
								<button
									onClick={resetScanner}
									disabled={loading || updateLoading}
									className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:scale-105 disabled:opacity-50 mx-auto"
								>
									<RotateCcw size={20} /> Scan Again
								</button>
							</div>
						)}
					</div>
				</motion.div>

				{/* Ticket Details Section */}
				<motion.div
					className="bg-blue-900/20 backdrop-blur-lg rounded-2xl border border-blue-500/30 shadow-2xl overflow-hidden"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					<div className="p-6">
						<h2 className="text-2xl font-bold mb-4 text-center">Ticket Details</h2>
						<TicketDetails
							ticket={ticket}
							error={error}
							onReset={resetScanner}
							onMarkUsed={markAsUsed}
							updateLoading={updateLoading}
						/>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default QRScanner;
