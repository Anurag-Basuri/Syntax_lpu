import React, { useRef, useEffect, useCallback } from 'react';

const TicketForm = ({ formData, setFormData, loading, error, onClose, onSubmit }) => {
	const modalRef = useRef(null);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape') onClose();
			if (e.key === 'Tab' && modalRef.current) {
				const focusable = modalRef.current.querySelectorAll(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				);
				if (focusable.length > 0) {
					const first = focusable[0];
					const last = focusable[focusable.length - 1];
					if (e.shiftKey && document.activeElement === first) {
						e.preventDefault();
						last.focus();
					} else if (!e.shiftKey && document.activeElement === last) {
						e.preventDefault();
						first.focus();
					}
				}
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [onClose]);

	const handleInputChange = useCallback(
		(e) => {
			const { name, value } = e.target;
			setFormData((prev) => {
				if (name === 'hosteler' && value !== 'true') {
					const { hostel, ...rest } = prev;
					return { ...rest, [name]: value };
				}
				return { ...prev, [name]: value };
			});
		},
		[setFormData]
	);

	const handleSubmit = useCallback(
		(e) => {
			e.preventDefault();
			if (onSubmit) onSubmit();
		},
		[onSubmit]
	);

	const handleBackdropClick = useCallback(
		(e) => {
			if (e.target === e.currentTarget) onClose();
		},
		[onClose]
	);

	return (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
			onClick={handleBackdropClick}
			style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
		>
			<div
				ref={modalRef}
				className="bg-gradient-to-br from-red-900/95 to-black/95 backdrop-blur-lg border-2 border-red-700/80 shadow-[0_0_40px_10px_rgba(220,38,38,0.25)] rounded-3xl max-w-lg w-full max-h-[90vh] relative flex flex-col overflow-hidden animate-fadeIn"
				onClick={(e) => e.stopPropagation()}
				style={{
					outline: 'none',
					boxShadow: '0 8px 40px 0 rgba(220,38,38,0.25), 0 1.5px 0 #a04000',
					backgroundImage: `url("https://www.transparenttextures.com/patterns/rust.png"), radial-gradient(circle at 30% 40%, #3d1f1a 0%, #2a0f06 40%, #1a0904 70%, #0a0015 100%)`,
					backgroundBlendMode: 'overlay',
				}}
			>
				<button
					onClick={onClose}
					className="absolute top-3 right-3 text-red-400 hover:text-white text-2xl z-10 transition"
					aria-label="Close modal"
					type="button"
				>
					✕
				</button>
				<div className="flex flex-col items-center pt-6 pb-2">
					<div className="text-4xl mb-2 animate-bounce">🎟️</div>
					<h2
						className="text-3xl font-black mb-1 text-center tracking-tight"
						style={{
							fontFamily: "'Share Tech Mono', 'Bebas Neue', monospace, sans-serif",
							letterSpacing: '0.05em',
							background: 'linear-gradient(45deg, #e25822, #a04000, #e25822)',
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
						}}
					>
						Ticket Purchase
					</h2>
					<div className="w-1/2 h-1.5 bg-gradient-to-r from-red-800 via-red-600 to-red-800 rounded-full mb-2" />
					<p className="text-red-300 text-center mb-2 text-base">
						Fill in your details to continue
					</p>
				</div>
				<form
					onSubmit={handleSubmit}
					className="space-y-4 flex-1 overflow-y-auto px-2 pb-4"
				>
					{error && (
						<div className="bg-red-900/80 border border-red-400 text-red-200 px-3 py-2 rounded text-sm text-center mb-2">
							{error}
						</div>
					)}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="fullName"
								className="block text-xs font-semibold mb-1 text-red-200 tracking-wide"
							>
								Full Name
							</label>
							<input
								id="fullName"
								type="text"
								name="fullName"
								value={formData.fullName || ''}
								onChange={handleInputChange}
								className="w-full border border-red-700 bg-black/60 text-red-100 rounded-lg px-3 py-2 placeholder:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
								placeholder="Enter your full name"
								required
								autoFocus
							/>
						</div>
						<div>
							<label
								htmlFor="email"
								className="block text-xs font-semibold mb-1 text-red-200 tracking-wide"
							>
								Email Address
							</label>
							<input
								id="email"
								type="email"
								name="email"
								value={formData.email || ''}
								onChange={handleInputChange}
								className="w-full border border-red-700 bg-black/60 text-red-100 rounded-lg px-3 py-2 placeholder:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
								placeholder="Enter your email"
								required
								autoComplete="email"
							/>
						</div>
						<div>
							<label
								htmlFor="phone"
								className="block text-xs font-semibold mb-1 text-red-200 tracking-wide"
							>
								Phone Number
							</label>
							<input
								id="phone"
								type="tel"
								name="phone"
								value={formData.phone || ''}
								onChange={handleInputChange}
								className="w-full border border-red-700 bg-black/60 text-red-100 rounded-lg px-3 py-2 placeholder:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
								placeholder="Enter your phone number"
								required
								autoComplete="tel"
							/>
						</div>
						<div>
							<label
								htmlFor="lpuId"
								className="block text-xs font-semibold mb-1 text-red-200 tracking-wide"
							>
								LPU Registration Number
							</label>
							<input
								id="lpuId"
								type="text"
								name="lpuId"
								value={formData.lpuId || ''}
								onChange={handleInputChange}
								className="w-full border border-red-700 bg-black/60 text-red-100 rounded-lg px-3 py-2 placeholder:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
								placeholder="Enter your LPU registration number"
								required
							/>
						</div>
						<div>
							<label
								htmlFor="gender"
								className="block text-xs font-semibold mb-1 text-red-200 tracking-wide"
							>
								Gender
							</label>
							<select
								id="gender"
								name="gender"
								value={formData.gender || ''}
								onChange={handleInputChange}
								className="w-full border border-red-700 bg-black/60 text-red-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
								required
							>
								<option value="">Select your gender</option>
								<option value="Male">Male</option>
								<option value="Female">Female</option>
							</select>
						</div>
						<div>
							<label
								htmlFor="hosteler"
								className="block text-xs font-semibold mb-1 text-red-200 tracking-wide"
							>
								Are you a Hosteler?
							</label>
							<select
								id="hosteler"
								name="hosteler"
								value={formData.hosteler || ''}
								onChange={handleInputChange}
								className="w-full border border-red-700 bg-black/60 text-red-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
								required
							>
								<option value="">Select your status</option>
								<option value="true">Yes</option>
								<option value="false">No</option>
							</select>
						</div>
						{formData.hosteler === 'true' && (
							<div>
								<label
									htmlFor="hostel"
									className="block text-xs font-semibold mb-1 text-red-200 tracking-wide"
								>
									Hostel Name
								</label>
								<input
									id="hostel"
									type="text"
									name="hostel"
									value={formData.hostel || ''}
									onChange={handleInputChange}
									className="w-full border border-red-700 bg-black/60 text-red-100 rounded-lg px-3 py-2 placeholder:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
									placeholder="Enter your hostel name"
									required
								/>
							</div>
						)}
						<div>
							<label
								htmlFor="course"
								className="block text-xs font-semibold mb-1 text-red-200 tracking-wide"
							>
								Course
							</label>
							<input
								id="course"
								type="text"
								name="course"
								value={formData.course || ''}
								onChange={handleInputChange}
								className="w-full border border-red-700 bg-black/60 text-red-100 rounded-lg px-3 py-2 placeholder:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
								placeholder="Enter your course name"
								required
							/>
						</div>
						<div>
							<label className="block text-xs font-semibold mb-1 text-red-200 tracking-wide">
								How did you hear about us? <span className="text-red-400">*</span>
							</label>
							<div className="flex flex-col gap-1">
								<label className="inline-flex items-center gap-2">
									<input
										type="radio"
										name="club"
										value="vibranta"
										checked={formData.club === 'vibranta'}
										onChange={handleInputChange}
										required
										className="accent-red-600"
									/>
									<span className="text-red-100">Vibranta</span>
								</label>
								<label className="inline-flex items-center gap-2">
									<input
										type="radio"
										name="club"
										value="SML"
										checked={formData.club === 'SML'}
										onChange={handleInputChange}
										required
										className="accent-red-600"
									/>
									<span className="text-red-100">SML</span>
								</label>
								<label className="inline-flex items-center gap-2">
									<input
										type="radio"
										name="club"
										value="VIBE"
										checked={formData.club === 'VIBE'}
										onChange={handleInputChange}
										required
										className="accent-red-600"
									/>
									<span className="text-red-100">VIBE</span>
								</label>
								<label className="inline-flex items-center gap-2">
									<input
										type="radio"
										name="club"
										value="BEAST"
										checked={formData.club === 'BEAST'}
										onChange={handleInputChange}
										required
										className="accent-red-600"
									/>
									<span className="text-red-100">BEAST</span>
								</label>
							</div>
						</div>
					</div>
					<div>
						<label className="block text-xs font-semibold mb-1 text-red-200 tracking-wide">
							Amount
						</label>
						<div className="flex items-center justify-between">
							<span className="text-lg font-bold text-red-100">
								₹{formData.amount || 0}
							</span>
							<span className="text-xs bg-red-900/60 px-2 py-1 rounded text-red-200">
								Fixed Price
							</span>
						</div>
					</div>
					<div className="flex gap-3 pt-4 sticky bottom-0 bg-gradient-to-t from-black/95 to-transparent pb-2 pointer-events-none z-10">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 py-2 bg-red-900/80 hover:bg-red-800 rounded-lg font-medium text-red-200 hover:text-white transition pointer-events-auto"
							disabled={loading}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="flex-1 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-lg font-medium text-white disabled:opacity-50 transition pointer-events-auto"
						>
							{loading ? (
								<span className="flex items-center justify-center gap-2">
									<span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
									Processing...
								</span>
							) : (
								<span className="flex items-center justify-center gap-1.5">
									<span>Pay Now</span>
									<span className="text-lg">🔥</span>
								</span>
							)}
						</button>
					</div>
				</form>
				<div className="absolute inset-0 pointer-events-none z-0">
					{/* Subtle overlay for extra effect */}
					<div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-black/40 opacity-60" />
					<div
						className="absolute inset-0"
						style={{
							backgroundImage: `url("https://www.transparenttextures.com/patterns/rust.png")`,
							opacity: 0.15,
							mixBlendMode: 'overlay',
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default TicketForm;
