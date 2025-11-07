import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getAllMembers,
	getLeaders,
	updateMemberByAdmin,
	banMember,
	unbanMember,
} from '../services/memberServices.js';

// Hook to fetch all members
export const useMembers = () => {
	return useQuery({
		queryKey: ['members'],
		queryFn: getAllMembers,
	});
};

// Hook to fetch all club leaders
export const useLeaders = () => {
	return useQuery({
		queryKey: ['leaders'],
		queryFn: getLeaders,
	});
};

// Hook for admins to manage member actions
export const useManageMember = () => {
	const queryClient = useQueryClient();

	const { mutate: updateMember, isPending: isUpdating } = useMutation({
		mutationFn: ({ memberId, data }) => updateMemberByAdmin(memberId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['members'] });
		},
	});

	const { mutate: ban, isPending: isBanning } = useMutation({
		mutationFn: ({ memberId, reason }) => banMember(memberId, { reason }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['members'] });
		},
	});

	const { mutate: unban, isPending: isUnbanning } = useMutation({
		mutationFn: unbanMember,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['members'] });
		},
	});

	return { updateMember, isUpdating, ban, isBanning, unban, isUnbanning };
};
