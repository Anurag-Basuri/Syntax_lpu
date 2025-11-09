import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getAllMembers,
	getLeaders,
	updateMemberByAdmin,
	banMember,
	unbanMember,
} from '../services/memberServices.js';
import { toast } from 'react-hot-toast';

const normalizeMember = (m) => ({
	_id: m._id,
	fullname: m.fullname || 'Unknown',
	designation: Array.isArray(m.designation) ? m.designation : [m.designation].filter(Boolean),
	department: Array.isArray(m.department) ? m.department : [m.department].filter(Boolean),
	primaryDesignation:
		m.primaryDesignation || (Array.isArray(m.designation) ? m.designation[0] : m.designation),
	primaryDepartment:
		m.primaryDepartment || (Array.isArray(m.department) ? m.department[0] : m.department),
	profilePicture: m.profilePicture?.url || null,
	skills: m.skills || [],
	bio: m.bio || '',
	socialLinks: m.socialLinks || [],
	joinedAt: m.joinedAt,
	LpuId: m.LpuId,
	hosteler: m.hosteler,
	hostel: m.hostel,
});

// Hook to fetch all members
export const useMembers = () => {
	return useQuery({
		queryKey: ['members'],
		queryFn: async () => {
			const { members, totalMembers } = await getAllMembers();
			return { members: members.map(normalizeMember), totalMembers };
		},
		staleTime: 60_000,
	});
};

// Hook to fetch all club leaders
export const useLeaders = () => {
	return useQuery({
		queryKey: ['leaders'],
		queryFn: async () => {
			const data = await getLeaders();
			const list = data?.members || [];
			return list.map(normalizeMember);
		},
		staleTime: 60_000,
	});
};

// Hook for admins to manage member actions
export const useManageMember = () => {
	const queryClient = useQueryClient();

	const { mutate: updateMember, isPending: isUpdating } = useMutation({
		mutationFn: ({ memberId, data }) => updateMemberByAdmin(memberId, data),
		onSuccess: () => {
			toast.success('Member updated.');
			queryClient.invalidateQueries({ queryKey: ['members'] });
		},
		onError: (error) => {
			toast.error(error.message);
			console.error('Failed to update member:', error);
		},
	});

	const { mutate: ban, isPending: isBanning } = useMutation({
		mutationFn: ({ memberId, reason }) => banMember(memberId, { reason }),
		onSuccess: () => {
			toast.success('Member has been banned.');
			queryClient.invalidateQueries({ queryKey: ['members'] });
		},
		onError: (error) => {
			toast.error(error.message);
			console.error('Failed to ban member:', error);
		},
	});

	const { mutate: unban, isPending: isUnbanning } = useMutation({
		mutationFn: unbanMember,
		onSuccess: () => {
			toast.success('Member has been unbanned.');
			queryClient.invalidateQueries({ queryKey: ['members'] });
		},
		onError: (error) => {
			toast.error(error.message);
			console.error('Failed to unban member:', error);
		},
	});

	return { updateMember, isUpdating, ban, isBanning, unban, isUnbanning };
};
