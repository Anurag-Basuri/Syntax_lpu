export const getHeroMedia = (fest) => {
	// Accept Mongoose doc or plain object
	const obj = fest && typeof fest.toObject === 'function' ? fest.toObject() : fest || {};
	// prefer explicit heroMedia
	if (obj.heroMedia && obj.heroMedia.url) return obj.heroMedia;
	// next prefer posters array first item
	if (Array.isArray(obj.posters) && obj.posters.length > 0) return obj.posters[0];
	// fallback to legacy poster virtual or gallery first item
	if (obj.poster && obj.poster.url) return obj.poster;
	if (Array.isArray(obj.gallery) && obj.gallery.length > 0) return obj.gallery[0];
	return null;
};

export const getFirstPoster = (fest) => {
	const obj = fest && typeof fest.toObject === 'function' ? fest.toObject() : fest || {};
	if (Array.isArray(obj.posters) && obj.posters.length > 0) return obj.posters[0];
	if (obj.poster && obj.poster.url) return obj.poster;
	return null;
};
