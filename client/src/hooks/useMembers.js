import { useState, useCallback } from 'react';
import { publicClient, apiClient } from '../services/api.js';

// Utility for consistent error parsing
const parseError = (err) => {
	if (err?.response?.data?.message) return err.response.data.message;
	if (err?.response?.data?.error) return err.response.data.error;
	if (err?.message) return err.message;
	return 'Unknown error occurred';
};

// Generic hook for member actions
const useMemberAction = (actionFn) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [data, setData] = useState(null);

	const action = useCallback(
		async (...args) => {
			setLoading(true);
			setError(null);
			try {
				const result = await actionFn(...args);
				setData(result);
				return result;
			} catch (err) {
				const errorMessage = parseError(err);
				setError(errorMessage);
				console.error('Member action error:', errorMessage);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[actionFn]
	);

	const reset = () => {
		setData(null);
		setError(null);
	};

	return { action, data, loading, error, reset };
};

// Fetch all members
export const useGetAllMembers = () => {
	const actionFn = async () => {
		const res = await publicClient.get('api/members/getall');
		return {
			members: res.data.data.members,
			total: res.data.data.totalMembers,
		};
	};
	const { action: getAllMembers, data, loading, error, reset } = useMemberAction(actionFn);

	return {
		getAllMembers,
		members: data?.members || [],
		total: data?.total || 0,
		loading,
		error,
		reset,
	};
};

// Fetch leaders
export const useGetLeaders = () => {
	const actionFn = async () => {
		const res = await publicClient.get('api/members/getleaders');
		return res.data.data.members;
	};
	const { action: getLeaders, data: leaders, loading, error, reset } = useMemberAction(actionFn);

	return { getLeaders, leaders: leaders || [], loading, error, reset };
};

// Get current member profile (for logged-in user)
export const useGetCurrentMember = () => {
	const actionFn = async () => {
		const res = await apiClient.get('api/members/me');
		return res.data.data.member;
	};
	const {
		action: getCurrentMember,
		data: member,
		loading,
		error,
		reset,
	} = useMemberAction(actionFn);

	return { getCurrentMember, member, loading, error, reset };
};

// Update member profile (for logged-in user)
export const useUpdateProfile = () => {
	const actionFn = async (id, updateData) => {
		const res = await apiClient.put(`api/members/${id}/update`, updateData);
		return res.data.data.member;
	};
	const {
		action: updateProfile,
		data: member,
		loading,
		error,
		reset,
	} = useMemberAction(actionFn);

	return { updateProfile, member, loading, error, reset };
};

// Upload profile picture
export const useUploadProfilePicture = () => {
	const actionFn = async (id, formData) => {
		const res = await apiClient.post(`api/members/${id}/profile-picture`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return res.data.data.member;
	};
	const {
		action: uploadProfilePicture,
		data: member,
		loading,
		error,
		reset,
	} = useMemberAction(actionFn);

	return { uploadProfilePicture, member, loading, error, reset };
};

// Upload Resume
export const useUploadResume = () => {
	const actionFn = async (id, formData) => {
		const res = await apiClient.post(`api/members/${id}/resume`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return res.data.data.member;
	};
	const { action: uploadResume, data: member, loading, error, reset } = useMemberAction(actionFn);

	return { uploadResume, member, loading, error, reset };
};

// Reset member password
export const useResetPassword = () => {
	const actionFn = async (LpuId, newPassword) => {
		const res = await publicClient.post('api/members/reset-password', { LpuId, newPassword });
		return res.data.data.member;
	};
	const {
		action: resetPassword,
		data: member,
		loading,
		error,
		reset,
	} = useMemberAction(actionFn);

	return { resetPassword, member, loading, error, reset };
};

// Send password reset email
export const useSendResetPasswordEmail = () => {
	const actionFn = async (email) => {
		const res = await publicClient.post('api/members/send-reset-email', { email });
		return res.data;
	};
	const {
		action: sendResetPasswordEmail,
		data,
		loading,
		error,
		reset,
	} = useMemberAction(actionFn);

	return { sendResetPasswordEmail, data, loading, error, reset };
};

// Ban a member (admin only)
export const useBanMember = () => {
	const actionFn = async (id, reason, reviewTime) => {
		const res = await apiClient.put(`api/members/${id}/ban`, { reason, reviewTime });
		return res.data.data.member;
	};
	const { action: banMember, data: member, loading, error, reset } = useMemberAction(actionFn);

	return { banMember, member, loading, error, reset };
};

// Remove a member (admin only)
export const useRemoveMember = () => {
	const actionFn = async (id, reason, reviewTime) => {
		const res = await apiClient.put(`api/members/${id}/remove`, { reason, reviewTime });
		return res.data.data.member;
	};
	const { action: removeMember, data: member, loading, error, reset } = useMemberAction(actionFn);

	return { removeMember, member, loading, error, reset };
};

// Unban a member (admin only)
export const useUnbanMember = () => {
	const actionFn = async (id) => {
		const res = await apiClient.put(`api/members/${id}/unban`, {});
		return res.data.data.member;
	};
	const { action: unbanMember, data: member, loading, error, reset } = useMemberAction(actionFn);

	return { unbanMember, member, loading, error, reset };
};

// Update member by admin
export const useUpdateMemberByAdmin = () => {
	const actionFn = async (id, updateData) => {
		const res = await apiClient.put(`api/members/${id}/admin`, updateData);
		return res.data.data.member;
	};
	const {
		action: updateMemberByAdmin,
		data: member,
		loading,
		error,
		reset,
	} = useMemberAction(actionFn);

	return { updateMemberByAdmin, member, loading, error, reset };
};
