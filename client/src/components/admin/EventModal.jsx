import React, { useState, useEffect } from 'react';
import {
	CalendarDays,
	MapPin,
	BookOpen,
	X,
	Tag,
	DollarSign,
	Users,
	UploadCloud,
	Clock,
	Link,
} from 'lucide-react';

const EventModal = ({ isEdit, open, onClose, eventFields, setEventFields, onSubmit, loading }) => {
	// Local helper state for tags string input
	const [tagsInput, setTagsInput] = useState((eventFields.tags || []).join(', '));

	useEffect(() => {
		setTagsInput((eventFields.tags || []).join(', '));
	}, [eventFields.tags, open]);

	if (!open) return null;

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		// Boolean checkbox handling
		if (type === 'checkbox') {
			setEventFields((prev) => ({ ...prev, [name]: checked }));
			return;
		}

		// Special handling for registration-related flattened fields:
		if (name === 'registrationMode') {
			setEventFields((prev) => ({
				...prev,
				registrationMode: value,
				registration: { ...(prev.registration || {}), mode: value },
			}));
			return;
		}
		if (name === 'externalUrl') {
			setEventFields((prev) => ({
				...prev,
				externalUrl: value,
				registration: { ...(prev.registration || {}), externalUrl: value },
			}));
			return;
		}
		if (name === 'allowGuests') {
			setEventFields((prev) => ({
				...prev,
				registration: { ...(prev.registration || {}), allowGuests: value === 'true' },
			}));
			return;
		}
		// capacityOverride numeric field
		if (name === 'capacityOverride') {
			setEventFields((prev) => ({
				...prev,
				registration: {
					...(prev.registration || {}),
					capacityOverride: value === '' ? undefined : value,
				},
			}));
			return;
		}

		// numeric fields keep string here; parent will normalize/convert
		if (['totalSpots', 'ticketPrice'].includes(name)) {
			setEventFields((prev) => ({ ...prev, [name]: value }));
			return;
		}

		// Default shallow set for other fields
		setEventFields((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = (e) => {
		const files = Array.from(e.target.files || []);
		// keep as File objects for parent to build FormData
		setEventFields((prev) => ({ ...prev, posters: files }));
	};

	const handleTagsBlur = () => {
		const normalized =
			typeof tagsInput === 'string'
				? tagsInput
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean)
				: [];
		setEventFields((prev) => ({ ...prev, tags: normalized }));
		setTagsInput(normalized.join(', '));
	};

	const handleTagKeyDown = (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleTagsBlur();
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
			<div className="w-full max-w-3xl bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
				<div className="flex justify-between items-center p-4 border-b border-gray-700">
					<h3 className="text-lg font-semibold text-white">
						{isEdit ? 'Edit Event' : 'Create New Event'}
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-white rounded-full p-1"
						aria-label="Close modal"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="p-6">
					<div className="space-y-5">
						{/* Title */}
						<div>
							<label className="block text-sm text-gray-400 mb-1">
								Event Title *
							</label>
							<div className="relative">
								<BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<input
									type="text"
									name="title"
									value={eventFields.title || ''}
									onChange={handleChange}
									className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Enter event title"
									required
								/>
							</div>
						</div>

						{/* Date/time + Time-only (optional) */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
							<div>
								<label className="block text-sm text-gray-400 mb-1">
									Date & Time *
								</label>
								<div className="relative">
									<CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<input
										type="datetime-local"
										name="date"
										value={eventFields.date || ''}
										onChange={handleChange}
										className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm text-gray-400 mb-1">
									Optional Time (HH:MM)
								</label>
								<div className="relative">
									<Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<input
										type="text"
										name="eventTime"
										value={eventFields.eventTime || ''}
										onChange={handleChange}
										placeholder="e.g., 14:30"
										className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm text-gray-400 mb-1">
									Category *
								</label>
								<input
									type="text"
									name="category"
									value={eventFields.category || ''}
									onChange={handleChange}
									placeholder="Workshop, Competition, Meetup..."
									className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
							</div>
						</div>

						{/* Location & Organizer */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<div>
								<label className="block text-sm text-gray-400 mb-1">
									Location *
								</label>
								<div className="relative">
									<MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<input
										type="text"
										name="location"
										value={eventFields.location || ''}
										onChange={handleChange}
										placeholder="Venue name or address"
										className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm text-gray-400 mb-1">
									Organizer *
								</label>
								<div className="relative">
									<Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<input
										type="text"
										name="organizer"
										value={eventFields.organizer || ''}
										onChange={handleChange}
										placeholder="Organizer or team name"
										className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
									/>
								</div>
							</div>
						</div>

						{/* Description */}
						<div>
							<label className="block text-sm text-gray-400 mb-1">
								Description *
							</label>
							<textarea
								name="description"
								value={eventFields.description || ''}
								onChange={handleChange}
								rows="4"
								className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Describe the event (min 10 characters)"
								required
							></textarea>
						</div>

						{/* Numeric, Tags & Status */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
							<div>
								<label className="block text-sm text-gray-400 mb-1">
									Total Spots
								</label>
								<div className="relative">
									<DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<input
										type="number"
										name="totalSpots"
										min="0"
										value={eventFields.totalSpots ?? ''}
										onChange={handleChange}
										className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="0 = unlimited"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm text-gray-400 mb-1">
									Ticket Price
								</label>
								<div className="relative">
									<DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<input
										type="number"
										name="ticketPrice"
										min="0"
										step="0.01"
										value={eventFields.ticketPrice ?? ''}
										onChange={handleChange}
										className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="0 for free"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm text-gray-400 mb-1">Status</label>
								<select
									name="status"
									value={eventFields.status || 'upcoming'}
									onChange={handleChange}
									className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="upcoming">Upcoming</option>
									<option value="ongoing">Ongoing</option>
									<option value="completed">Completed</option>
									<option value="cancelled">Cancelled</option>
									<option value="postponed">Postponed</option>
								</select>
							</div>
						</div>

						{/* Tags input */}
						<div>
							<label className="block text-sm text-gray-400 mb-1">Tags</label>
							<div className="relative">
								<Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<input
									type="text"
									name="tags"
									value={tagsInput}
									onChange={(e) => setTagsInput(e.target.value)}
									onBlur={handleTagsBlur}
									onKeyDown={handleTagKeyDown}
									placeholder="Comma separated tags (e.g., hackathon, workshop)"
									className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							{(eventFields.tags || []).length > 0 && (
								<div className="mt-2 flex flex-wrap gap-2">
									{eventFields.tags.map((t, i) => (
										<span
											key={i}
											className="px-2.5 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded-full"
										>
											{t}
										</span>
									))}
								</div>
							)}
						</div>

						{/* Posters */}
						<div>
							<label className="block text-sm text-gray-400 mb-1">
								Event Posters {isEdit ? '(optional)' : '*'}
							</label>
							<div className="flex items-center gap-3">
								<label className="w-full cursor-pointer">
									<div className="flex items-center gap-3 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white">
										<UploadCloud className="h-5 w-5 text-gray-300" />
										<span className="text-sm">Choose image(s)</span>
									</div>
									<input
										type="file"
										name="posters"
										onChange={handleFileChange}
										accept="image/*"
										multiple
										className="hidden"
									/>
								</label>
							</div>

							{eventFields.posters && eventFields.posters.length > 0 && (
								<div className="mt-2 text-xs text-gray-400">
									{eventFields.posters.map((f, i) => (
										<div key={i}>{f.name}</div>
									))}
								</div>
							)}
							{!isEdit && (
								<p className="mt-2 text-xs text-gray-500">
									At least one poster is required for new events.
								</p>
							)}
						</div>

						{/* Registration controls */}
						<div className="border-t border-gray-700 pt-4">
							<h4 className="text-sm text-gray-200 font-medium mb-3">Registration</h4>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
								<div>
									<label className="block text-sm text-gray-400 mb-1">Mode</label>
									<select
										name="registrationMode"
										value={
											(eventFields.registration &&
												eventFields.registration.mode) ||
											eventFields.registrationMode ||
											'none'
										}
										onChange={handleChange}
										className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="none">None</option>
										<option value="internal">Internal</option>
										<option value="external">External</option>
									</select>
								</div>

								<div>
									<label className="block text-sm text-gray-400 mb-1">
										External URL
									</label>
									<div className="relative">
										<Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
										<input
											type="url"
											name="externalUrl"
											value={
												(eventFields.registration &&
													eventFields.registration.externalUrl) ||
												eventFields.externalUrl ||
												''
											}
											onChange={handleChange}
											placeholder="https://example.com/register"
											className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm text-gray-400 mb-1">
										Allow Guests
									</label>
									<select
										name="allowGuests"
										value={
											(eventFields.registration &&
												String(eventFields.registration.allowGuests)) ||
											'true'
										}
										onChange={handleChange}
										className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="true">Yes</option>
										<option value="false">No</option>
									</select>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
								<div>
									<label className="block text-sm text-gray-400 mb-1">
										Registration open
									</label>
									<input
										type="datetime-local"
										name="registrationOpenDate"
										value={eventFields.registrationOpenDate || ''}
										onChange={(e) =>
											setEventFields((prev) => ({
												...prev,
												registrationOpenDate: e.target.value,
											}))
										}
										className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								<div>
									<label className="block text-sm text-gray-400 mb-1">
										Registration close
									</label>
									<input
										type="datetime-local"
										name="registrationCloseDate"
										value={eventFields.registrationCloseDate || ''}
										onChange={(e) =>
											setEventFields((prev) => ({
												...prev,
												registrationCloseDate: e.target.value,
											}))
										}
										className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								<div>
									<label className="block text-sm text-gray-400 mb-1">
										Capacity override
									</label>
									<input
										type="number"
										name="capacityOverride"
										min="0"
										value={
											(eventFields.registration &&
												eventFields.registration.capacityOverride) ??
											''
										}
										onChange={handleChange}
										placeholder="Optional"
										className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-6">
						<button
							type="button"
							onClick={onClose}
							className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"
						>
							Cancel
						</button>
						<button
							onClick={onSubmit}
							disabled={loading}
							className={`px-6 py-2 rounded-lg text-white ${
								loading
									? 'bg-blue-500/50 cursor-not-allowed'
									: 'bg-blue-600 hover:bg-blue-500'
							}`}
						>
							{loading
								? isEdit
									? 'Updating...'
									: 'Creating...'
								: isEdit
								? 'Update Event'
								: 'Create Event'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EventModal;
