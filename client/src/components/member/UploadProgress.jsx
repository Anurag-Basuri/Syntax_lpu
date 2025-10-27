import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Image, X, CheckCircle, Loader } from 'lucide-react';

const UploadProgress = ({ progress, fileName, type, onCancel }) => {
	const getIcon = () => {
		if (progress >= 100) return CheckCircle;
		if (type === 'image') return Image;
		if (type === 'document') return FileText;
		return Upload;
	};

	const Icon = getIcon();

	return (
		<motion.div
			initial={{ opacity: 0, y: -20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: -20, scale: 0.95 }}
			className="fixed top-20 left-4 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-600 p-4 min-w-[320px] max-w-[400px]"
		>
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-3">
					<div
						className={`p-2 rounded-lg relative ${
							progress >= 100
								? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
								: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
						}`}
					>
						<Icon className="w-5 h-5" />
						{progress > 0 && progress < 100 && (
							<div className="absolute inset-0 flex items-center justify-center">
								<Loader className="w-3 h-3 text-blue-500 animate-spin" />
							</div>
						)}
					</div>
					<div className="min-w-0">
						<p className="font-semibold text-slate-800 dark:text-white text-sm">
							{progress >= 100 ? 'Upload Complete!' : 'Uploading...'}
						</p>
						<p
							className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-[200px]"
							title={fileName}
						>
							{fileName}
						</p>
					</div>
				</div>
				{progress < 100 && onCancel && (
					<button
						onClick={onCancel}
						className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
						title="Cancel upload"
					>
						<X className="w-4 h-4" />
					</button>
				)}
			</div>

			<div className="space-y-2">
				<div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
					<span className="font-medium">{Math.round(progress)}% complete</span>
					<span>{progress >= 100 ? '✓ Done' : 'In progress...'}</span>
				</div>
				<div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5 overflow-hidden">
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: `${progress}%` }}
						transition={{ duration: 0.3, ease: 'easeOut' }}
						className={`h-full rounded-full relative ${
							progress >= 100
								? 'bg-gradient-to-r from-green-500 to-emerald-500'
								: 'bg-gradient-to-r from-blue-500 to-cyan-500'
						}`}
					>
						{progress > 0 && progress < 100 && (
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
						)}
					</motion.div>
				</div>

				{progress >= 100 && (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-xs text-green-600 dark:text-green-400 font-medium text-center"
					>
						Upload successful! Your {type} has been saved.
					</motion.p>
				)}
			</div>
		</motion.div>
	);
};

export default UploadProgress;
