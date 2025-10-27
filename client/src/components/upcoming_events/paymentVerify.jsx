import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { publicClient } from '../../services/api.js';

const CONTACT_EMAIL = 'vibranta.helpdesk@gmail.com';
const CONTACT_PHONE = '+91-9771072294';

const PaymentSuccess = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState('loading');
	const [message, setMessage] = useState('');
	const [transactionData, setTransactionData] = useState(null);
	const [ticketData, setTicketData] = useState(null);
	const [errorDetails, setErrorDetails] = useState('');
	const [retryCount, setRetryCount] = useState(0);

	const verifyPayment = async () => {
		try {
			const orderId = searchParams.get('order_id');
			if (!orderId) {
				setStatus('failed');
				setMessage('Order ID not found in the URL.');
				return;
			}

			// Call verify payment endpoint
			const response = await publicClient.post(`api/cashfree/verify?order_id=${orderId}`);
			const { data } = response.data;

			if (!data || !data.transaction) {
				setStatus('failed');
				setMessage('No transaction data received from server.');
				return;
			}

			setTransactionData(data.transaction);

			if (data.transaction.status === 'SUCCESS') {
				setStatus('success');
				setMessage('Payment successful! Your ticket has been sent to your email.');
				if (data.ticket) setTicketData(data.ticket);
			} else if (
				data.transaction.status === 'PENDING' ||
				data.transaction.status === 'ACTIVE'
			) {
				setStatus('pending');
				setMessage('Payment is being processed. You will receive confirmation shortly.');
			} else {
				setStatus('failed');
				setMessage(
					`Payment failed or expired. Status: ${data.transaction.status || 'Unknown'}`
				);
			}
		} catch (error) {
			setStatus('failed');
			let errMsg =
				error?.response?.data?.message ||
				error?.message ||
				'Payment verification failed due to a network/server error.';
			setMessage('Payment verification failed.');
			setErrorDetails(errMsg);
			console.error('Payment verification error:', error);
		}
	};

	useEffect(() => {
		verifyPayment();
		// eslint-disable-next-line
	}, [searchParams, retryCount]);

	const getStatusIcon = () => {
		switch (status) {
			case 'success':
				return '✅';
			case 'failed':
				return '❌';
			case 'pending':
				return '⏳';
			default:
				return '🔄';
		}
	};

	const getStatusColor = () => {
		switch (status) {
			case 'success':
				return 'text-green-400';
			case 'failed':
				return 'text-red-400';
			case 'pending':
				return 'text-yellow-400';
			default:
				return 'text-blue-400';
		}
	};

	const goBackToEvent = () => {
		navigate('/event');
	};

	const goHome = () => {
		navigate('/');
	};

	const handleRetry = () => {
		setStatus('loading');
		setMessage('');
		setErrorDetails('');
		setRetryCount((c) => c + 1);
	};

	return (
		<div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
			<motion.div
				className="max-w-md w-full bg-gradient-to-br from-red-900/40 to-black/70 backdrop-blur-sm border border-red-600/50 rounded-xl p-8 text-center"
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<motion.div
					className="text-6xl mb-6"
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
				>
					{getStatusIcon()}
				</motion.div>

				<motion.h1
					className={`text-2xl font-bold mb-4 ${getStatusColor()}`}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					{status === 'loading' && 'Verifying Payment...'}
					{status === 'success' && 'Payment Successful!'}
					{status === 'failed' && 'Payment Failed'}
					{status === 'pending' && 'Payment Pending'}
				</motion.h1>

				<motion.p
					className="text-red-300 mb-6"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}
				>
					{message}
				</motion.p>

				{errorDetails && status === 'failed' && (
					<motion.div
						className="mb-4 text-xs text-red-500 bg-red-900/30 rounded p-2"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<strong>Error Details:</strong> {errorDetails}
					</motion.div>
				)}

				{transactionData && (
					<motion.div
						className="bg-black/30 rounded-lg p-4 mb-6 text-left"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
					>
						<h3 className="text-red-400 font-bold mb-2">Transaction Details</h3>
						<div className="space-y-1 text-sm">
							<div className="flex justify-between">
								<span className="text-red-300">Order ID:</span>
								<span className="text-white font-mono">
									{transactionData.orderId}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-red-300">Amount:</span>
								<span className="text-white">₹{transactionData.amount}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-red-300">Status:</span>
								<span className={`font-bold ${getStatusColor()}`}>
									{transactionData.status}
								</span>
							</div>
							{transactionData.user && (
								<div className="flex justify-between">
									<span className="text-red-300">Name:</span>
									<span className="text-white">{transactionData.user.name}</span>
								</div>
							)}
							{transactionData.lpuId && (
								<div className="flex justify-between">
									<span className="text-red-300">LPU ID:</span>
									<span className="text-white">{transactionData.lpuId}</span>
								</div>
							)}
						</div>
					</motion.div>
				)}

				{ticketData && (
					<motion.div
						className="bg-green-900/30 rounded-lg p-4 mb-6 text-left"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6 }}
					>
						<h3 className="text-green-400 font-bold mb-2">🎟️ Ticket Details</h3>
						<div className="space-y-1 text-sm">
							<div className="flex justify-between">
								<span className="text-green-300">Ticket ID:</span>
								<span className="text-white font-mono">
									{ticketData.ticketId || ticketData._id || 'N/A'}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-green-300">Event:</span>
								<span className="text-white">
									{ticketData.eventName || 'RaveYard 2025'}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-green-300">Name:</span>
								<span className="text-white">
									{ticketData.fullName || transactionData?.user?.name || 'N/A'}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-green-300">LPU ID:</span>
								<span className="text-white">
									{ticketData.lpuId || transactionData?.lpuId || 'N/A'}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-green-300">Status:</span>
								<span className="text-green-400 font-bold">CONFIRMED</span>
							</div>
							{ticketData.qrCode?.url && (
								<div className="flex flex-col items-center mt-4">
									<img
										src={ticketData.qrCode.url}
										alt="QR Code"
										className="w-32 h-32 rounded-lg border-4 border-green-400 bg-white"
									/>
									<span className="text-green-300 text-xs mt-2">
										Show this QR at entry
									</span>
								</div>
							)}
						</div>
					</motion.div>
				)}

				{status === 'loading' && (
					<motion.div
						className="flex justify-center"
						animate={{ rotate: 360 }}
						transition={{ repeat: Infinity, duration: 1 }}
					>
						<div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full"></div>
					</motion.div>
				)}

				{status !== 'loading' && (
					<motion.div
						className="flex flex-col gap-3"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6 }}
					>
						{status !== 'success' && (
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={handleRetry}
								className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900 rounded-lg font-medium text-white transition-colors"
							>
								Retry Verification
							</motion.button>
						)}
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={goBackToEvent}
							className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-lg font-medium text-white transition-colors"
						>
							Back to Event
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={goHome}
							className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-white transition-colors"
						>
							Go to Home
						</motion.button>
					</motion.div>
				)}

				{status === 'failed' && (
					<motion.div
						className="mt-6 p-4 bg-red-900/20 border border-red-600/50 rounded-lg"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.7 }}
					>
						<p className="text-red-400 text-sm mb-2">
							💀 Something went wrong with your payment.
							<br />
							Please try again using the Retry button above.
						</p>
						<p className="text-red-300 text-xs mt-2">
							If your payment is still not registered after retrying, please&nbsp;
							<a
								href="/contact"
								className="underline text-blue-300 hover:text-blue-400"
							>
								contact us
							</a>
							&nbsp;or reach out at&nbsp;
							<a
								href={`mailto:${CONTACT_EMAIL}`}
								className="underline text-blue-300 hover:text-blue-400"
							>
								{CONTACT_EMAIL}
							</a>
							&nbsp;or call&nbsp;
							<a
								href={`tel:${CONTACT_PHONE}`}
								className="underline text-blue-300 hover:text-blue-400"
							>
								{CONTACT_PHONE}
							</a>
							.
						</p>
					</motion.div>
				)}

				{status === 'success' && (
					<motion.div
						className="mt-6 p-4 bg-green-900/20 border border-green-600/50 rounded-lg"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.7 }}
					>
						<p className="text-green-400 text-sm">
							🎟️ Your ticket has been generated and sent to your email!
							<br />
							📧 Check your inbox for the QR code ticket.
							<br />
							👻 Welcome to RaveYard 2025!
						</p>
					</motion.div>
				)}
			</motion.div>
		</div>
	);
};

export default PaymentSuccess;
