import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

const useProfile = (memberId) => {
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchProfile = useCallback(async () => {
		try {
			setLoading(true);
			const response = await apiClient.get(`/api/members/${memberId}`);
			setProfile(response.data);
		} catch (err) {
			setError(err?.message || err);
		} finally {
			setLoading(false);
		}
	}, [memberId]);

	useEffect(() => {
		if (memberId) {
			fetchProfile();
		}
	}, [fetchProfile, memberId]);

	return { profile, loading, error, refetch: fetchProfile };
};

export default useProfile;
