export default function formatApiError(err) {
	if (!err) return 'Unknown error';

	// Axios-style error with response body
	const res = err.response;
	if (res) {
		const status = res.status;
		const data = res.data || {};
		const baseMessage =
			data.message ||
			data.error ||
			(typeof data === 'string' ? data : err.message || 'Server error');

		// Try to surface structured validation details if present
		let details = null;
		if (Array.isArray(data.errors) && data.errors.length) details = data.errors;
		else if (data.validation) details = data.validation;
		else if (data.errors && typeof data.errors === 'object') details = data.errors;
		else if (data.detail) details = data.detail;

		let out = `(${status}) ${baseMessage}`;

		if (details) {
			// Format arrays of errors or objects
			if (Array.isArray(details)) {
				const msgs = details
					.map((d) => d.msg || d.message || JSON.stringify(d))
					.filter(Boolean);
				if (msgs.length) out += ' — ' + msgs.join('; ');
			} else if (typeof details === 'object') {
				const vals = Object.values(details)
					.flat()
					.map((v) =>
						typeof v === 'string' ? v : v?.msg || v?.message || JSON.stringify(v)
					)
					.filter(Boolean);
				if (vals.length) out += ' — ' + vals.join('; ');
			} else {
				out += ' — ' + String(details);
			}
		}

		return out;
	}

	// Non-axios errors fallback
	return err.message || String(err);
}
