import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getAllMembers,
	getLeaders,
	updateMemberByAdmin,
	banMember,
	unbanMember,
} from '../services/memberServices.js';
import { toast } from 'react-hot-toast';

// Hook to fetch all members
export const useMembers = () => {
	return useQuery({
		queryKey: ['members'],
		queryFn: getAllMembers,
		staleTime: 60_000,
	});
};

// Hook to fetch all club leaders
export const useLeaders = () => {
	return useQuery({
		queryKey: ['leaders'],
		queryFn: async () => {
			const data = await getLeaders();
			return data?.members || []; // Just return the array of leaders
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
