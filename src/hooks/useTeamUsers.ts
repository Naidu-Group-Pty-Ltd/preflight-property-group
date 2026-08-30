import { useQuery } from '@tanstack/react-query';
import { invokeSecureFunction } from '@/lib/secureInvoke';

export interface TeamUser {
  id: string;
  username: string;
  email: string | null;
  is_active: boolean;
}

/**
 * Fetches all active team members from custom_users via the secure edge function.
 * Used for assigning reminders and deals to specific users.
 */
export function useTeamUsers() {
  return useQuery({
    queryKey: ['team-users'],
    queryFn: async () => {
      const { data, error } = await invokeSecureFunction('manage-templates', {
        operation: 'list',
        table: 'custom_users',
        listOptions: {
          select: 'id, username, email, is_active',
          filters: { is_active: true },
          orderBy: 'username',
          orderAsc: true,
        },
      });

      if (error) throw error;
      // Edge function returns { success, records, count }
      const records = data?.records || data || [];
      return (Array.isArray(records) ? records : []) as TeamUser[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
