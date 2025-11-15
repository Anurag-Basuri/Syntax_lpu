export default function normalizeEventPayload(req, res, next) {
	// Normalize common frontend aliases to backend model fields
	if (!req.body) return next();

	// date (frontend) -> eventDate (model)
	if (req.body.date && !req.body.eventDate) req.body.eventDate = req.body.date;

	// location -> venue
	if (req.body.location && !req.body.venue) req.body.venue = req.body.location;

	// tags array -> keep as array, allow comma string too
	if (Array.isArray(req.body.tags)) {
		// keep as-is
	} else if (typeof req.body.tags === 'string' && req.body.tags.includes(',')) {
		req.body.tags = req.body.tags
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);
	} else if (typeof req.body.tags === 'string' && req.body.tags.trim().length) {
		req.body.tags = [req.body.tags.trim()];
	}

	// registration flattening convenience: allow registration.* or flattened keys
	if (req.body.registrationMode && !req.body.registration) {
		req.body.registration = { mode: req.body.registrationMode };
	}
	if (req.body.externalUrl && req.body.registration && !req.body.registration.externalUrl) {
		req.body.registration.externalUrl = req.body.externalUrl;
	}

	// Ensure numeric strings are converted where expected
	if (typeof req.body.totalSpots === 'string' && req.body.totalSpots !== '') {
		const n = Number(req.body.totalSpots);
		if (!Number.isNaN(n)) req.body.totalSpots = n;
	}
	if (typeof req.body.ticketPrice === 'string' && req.body.ticketPrice !== '') {
		const n = Number(req.body.ticketPrice);
		if (!Number.isNaN(n)) req.body.ticketPrice = n;
	}

	return next();
}
