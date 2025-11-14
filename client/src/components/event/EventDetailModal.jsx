import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Handles invalid or missing dates gracefully
const safeFormatDate = (dateInput) => {
	if (!dateInput) return 'Date TBD';
	const date = new Date(dateInput);
	if (isNaN(date.getTime())) {
		return 'Invalid Date';
	}
	return new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
};

const EventDetailModal = ({ event, isOpen, onClose }) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const closeBtnRef = useRef(null);

	useEffect(() => {
		if (!isOpen) return;
		// focus close button for keyboard users
		closeBtnRef.current?.focus();
		const onKey = (e) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen, onClose]);

	if (!isOpen || !event) return null;

	const eventDate = new Date(event.eventDate || event.date);
	const isValidDate = !isNaN(eventDate.getTime());
	const isOngoing =
		isValidDate &&
		(event.status === 'ongoing' || eventDate.toDateString() === new Date().toDateString());
	const isUpcoming = isValidDate && eventDate > new Date() && !isOngoing;

	const nextImage = () => {
		if (event.posters?.length > 1) {
			setCurrentImageIndex((prev) => (prev + 1) % event.posters.length);
		}
	};

	const prevImage = () => {
		if (event.posters?.length > 1) {
			setCurrentImageIndex(
				(prev) => (prev - 1 + event.posters.length) % event.posters.length
			);
		}
	};

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
				onClick={onClose}
				role="presentation"
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					className="glass-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
					onClick={(e) => e.stopPropagation()}
					role="dialog"
					aria-modal="true"
					aria-labelledby="event-modal-title"
					tabIndex={-1}
				>
					{/* Close Button */}
					<button
						ref={closeBtnRef}
						onClick={onClose}
						className="absolute top-3 right-3 z-20 bg-red-500/80 text-white p-2 rounded-full"
						aria-label="Close event details"
						type="button"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>

					{/* Image Gallery */}
					<div className="relative h-[45vh] bg-black rounded-t-2xl">
						{event.posters?.length > 0 ? (
							<img
								key={currentImageIndex}
								src={event.posters[currentImageIndex].url}
								alt={
									event.posters[currentImageIndex].caption ||
									`${event.title} poster`
								}
								className="w-full h-full object-contain"
								loading="lazy"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
								🎭
							</div>
						)}
						{event.posters?.length > 1 && (
							<>
								<button
									onClick={prevImage}
									type="button"
									className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
									aria-label="Previous image"
								>
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 19l-7-7 7-7"
										/>
									</svg>
								</button>
								<button
									onClick={nextImage}
									type="button"
									className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
									aria-label="Next image"
								>
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</button>
							</>
						)}
					</div>

					{/* Content */}
					<div className="p-6 space-y-4">
						<h2 id="event-modal-title" className="text-2xl font-bold text-white">
							{event.title}
						</h2>
						<div className="flex flex-wrap gap-4 text-sm">
							<div className="flex items-center gap-2 text-blue-300">
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span className="font-medium">
									{safeFormatDate(event.eventDate)}
								</span>
							</div>
							{event.venue && (
								<div className="flex items-center gap-2 text-cyan-300">
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
									</svg>
									<span className="font-medium">{event.venue}</span>
								</div>
							)}
						</div>
						<p className="text-gray-300 leading-relaxed">{event.description}</p>
						{event.tags?.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{event.tags.map((tag) => (
									<span
										key={tag}
										className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium"
									>
										{tag}
									</span>
								))}
							</div>
						)}
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default EventDetailModal;
