import { useState, useEffect, useCallback } from 'react';
import { publicClient } from '../services/api';

const useSocials = () => {
	const [socials, setSocials] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchSocials = useCallback(async () => {
		try {
			setLoading(true);
			const response = await publicClient.get('/api/socials/getall');
			setSocials(response.data);
		} catch (err) {
			setError(err?.message || err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSocials();
	}, [fetchSocials]);

	return { socials, loading, error, refetch: fetchSocials };
};

export default useSocials;
