import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export type AdminRole = 'COO' | 'CFO' | 'CISO' | 'Marketing' | 'IT' | 'Support' | 'Admin';

export interface AdminUser {
  id: string;
  user_id: string | null;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
}

export function useAdminRole() {
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  // Hjelpfunksjon må være definert før bruk
  const getPermissionsForRole = (r: AdminRole): Record<string, boolean> => {
    return {
      full_access: r === 'COO' || r === 'Admin',
      view_all_users: r === 'COO' || r === 'Admin' || r === 'CFO',
      view_financials: r === 'COO' || r === 'CFO' || r === 'Admin',
      view_security: r === 'COO' || r === 'CISO' || r === 'Admin',
      view_marketing: r === 'COO' || r === 'Marketing' || r === 'Admin',
      view_system: r === 'COO' || r === 'IT' || r === 'Admin',
      view_support: r === 'COO' || r === 'Support' || r === 'Admin',
      manage_agents: r === 'COO' || r === 'Admin',
      manage_billing: r === 'CFO' || r === 'Admin',
      manage_users: r === 'COO' || r === 'Admin',
      manage_security: r === 'CISO' || r === 'Admin',
    };
  };

  const checkRole = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      // Sjekk om bruker er admin
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', user.email)
        .eq('is_active', true)
        .maybeSingle();

      if (adminData) {
        setRole(adminData.role as AdminRole);
        setPermissions(getPermissionsForRole(adminData.role as AdminRole));
      } else {
        setRole(null);
      }
    } catch {
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkRole();
  }, [checkRole]);

  const hasPermission = (perm: string): boolean => {
    return permissions[perm] || false;
  };

  return {
    role,
    loading,
    permissions,
    hasPermission,
    isAdmin: role !== null,
    refresh: checkRole,
  };
}

export function useAllAdmins() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return { admins, loading, refresh: fetchAdmins };
}