import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, X } from 'lucide-react';

const PasswordResetModal = ({
	isOpen,
	onClose,
	newPassword,
	setNewPassword,
	confirmPassword,
	setConfirmPassword,
	showPassword,
	setShowPassword,
	showConfirmPassword,
	setShowConfirmPassword,
	onSubmit,
	isLoading,
}) => {
	if (!isOpen) return null;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
			onClick={onClose}
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.9 }}
				onClick={(e) => e.stopPropagation()}
				className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700"
			>
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
						<Lock className="w-5 h-5 text-violet-500" />
						Reset Password
					</h3>
					<button
						onClick={onClose}
						className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
							New Password
						</label>
						<div className="relative">
							<input
								type={showPassword ? 'text' : 'password'}
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all pr-10 text-sm"
								placeholder="Enter new password"
								required
								minLength={8}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
							>
								{showPassword ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</button>
						</div>
					</div>

					<div>
						<label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
							Confirm Password
						</label>
						<div className="relative">
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all pr-10 text-sm"
								placeholder="Confirm new password"
								required
								minLength={8}
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
							>
								{showConfirmPassword ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</button>
						</div>
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isLoading}
							className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm disabled:opacity-50"
						>
							{isLoading ? (
								<div className="flex items-center justify-center gap-2">
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									Resetting...
								</div>
							) : (
								'Reset Password'
							)}
						</button>
					</div>
				</form>
			</motion.div>
		</motion.div>
	);
};

export default PasswordResetModal;
