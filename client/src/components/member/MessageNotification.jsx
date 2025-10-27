import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react';

const MessageNotification = ({ message, onClose }) => {
	const isSuccess =
		message &&
		(message.includes('successfully') ||
			message.includes('Success') ||
			message.includes('complete'));

	const isWarning =
		message &&
		(message.includes('warning') ||
			message.includes('restricted') ||
			message.includes('limit'));

	const isError = message && !isSuccess && !isWarning;

	useEffect(() => {
		if (message) {
			const timer = setTimeout(onClose, 6000);
			return () => clearTimeout(timer);
		}
	}, [message, onClose]);

	const getStyles = () => {
		if (isSuccess) {
			return {
				container:
					'bg-green-50/95 dark:bg-green-900/95 border-green-200 dark:border-green-700',
				iconBg: 'bg-green-100 dark:bg-green-800',
				iconColor: 'text-green-600 dark:text-green-400',
				title: 'text-green-800 dark:text-green-200',
				message: 'text-green-700 dark:text-green-300',
				close: 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200',
				icon: CheckCircle,
			};
		} else if (isWarning) {
			return {
				container:
					'bg-amber-50/95 dark:bg-amber-900/95 border-amber-200 dark:border-amber-700',
				iconBg: 'bg-amber-100 dark:bg-amber-800',
				iconColor: 'text-amber-600 dark:text-amber-400',
				title: 'text-amber-800 dark:text-amber-200',
				message: 'text-amber-700 dark:text-amber-300',
				close: 'text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200',
				icon: Info,
			};
		} else {
			return {
				container: 'bg-red-50/95 dark:bg-red-900/95 border-red-200 dark:border-red-700',
				iconBg: 'bg-red-100 dark:bg-red-800',
				iconColor: 'text-red-600 dark:text-red-400',
				title: 'text-red-800 dark:text-red-200',
				message: 'text-red-700 dark:text-red-300',
				close: 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200',
				icon: AlertTriangle,
			};
		}
	};

	const styles = getStyles();
	const IconComponent = styles.icon;

	return (
		<AnimatePresence>
			{message && (
				<motion.div
					initial={{ opacity: 0, y: -50, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -50, scale: 0.95 }}
					className="fixed top-20 right-4 z-50 max-w-md"
				>
					<div
						className={`p-4 rounded-xl shadow-lg border backdrop-blur-sm ${styles.container}`}
					>
						<div className="flex items-start gap-3">
							<div className={`p-2 rounded-full ${styles.iconBg}`}>
								<IconComponent className={`w-5 h-5 ${styles.iconColor}`} />
							</div>
							<div className="flex-1 min-w-0">
								<p className={`text-sm font-semibold ${styles.title}`}>
									{isSuccess ? 'Success' : isWarning ? 'Warning' : 'Error'}
								</p>
								<p className={`text-sm mt-1 ${styles.message}`}>{message}</p>
							</div>
							<button
								onClick={onClose}
								className={`p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${styles.close}`}
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						{/* Progress bar for auto-dismiss */}
						<motion.div
							initial={{ width: '100%' }}
							animate={{ width: '0%' }}
							transition={{ duration: 6, ease: 'linear' }}
							className={`mt-3 h-1 rounded-full ${
								isSuccess
									? 'bg-green-300 dark:bg-green-600'
									: isWarning
										? 'bg-amber-300 dark:bg-amber-600'
										: 'bg-red-300 dark:bg-red-600'
							}`}
						/>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default MessageNotification;
