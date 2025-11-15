export default function normalizeEventPayload(req, res, next) {
	// Normalize common aliases from admin frontend
	if (req.body) {
		// date (frontend) -> eventDate (model)
		if (req.body.date && !req.body.eventDate) req.body.eventDate = req.body.date;

		// location -> venue
		if (req.body.location && !req.body.venue) req.body.venue = req.body.location;

		// allow tags as array or string -> ensure string for express-validator / controller
		if (Array.isArray(req.body.tags)) req.body.tags = req.body.tags.join(',');

		// registration convenience fields: allow registrationMode / externalUrl to map
		if (req.body.registrationMode && !req.body.registration)
			req.body.registration = { mode: req.body.registrationMode };
		if (req.body.externalUrl && req.body.registration && !req.body.registration.externalUrl)
			req.body.registration.externalUrl = req.body.externalUrl;
	}
	return next();
}
