import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export interface BillingPlan {
  id: string;
  user_id: string;
  plan_type: 'subscription' | 'per_video' | 'credits';
  plan_name: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  price: number;
  credits_used: number;
  credits_remaining: number;
  videos_this_month: number;
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
}

export interface CreditPackage {
  id: string;
  user_id: string;
  amount: number;
  used: number;
  price: number;
  purchase_date: string;
  expires_at: string | null;
}

export function useBilling() {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [credits, setCredits] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBilling = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [plansRes, creditsRes] = await Promise.all([
        supabase.from('billing').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('credits').select('*').eq('user_id', user.id).order('purchase_date', { ascending: false }),
      ]);

      if (plansRes.error) throw plansRes.error;
      if (creditsRes.error) throw creditsRes.error;

      setPlans(plansRes.data || []);
      setCredits(creditsRes.data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  const getActivePlan = useCallback((): BillingPlan | null => {
    return plans.find(p => p.status === 'active') || null;
  }, [plans]);

  const getTotalCredits = useCallback((): number => {
    return credits.reduce((sum, c) => sum + (c.amount - c.used), 0);
  }, [credits]);

  const canCreateVideo = useCallback((): boolean => {
    const plan = getActivePlan();
    if (!plan) return credits.length > 0;

    if (plan.plan_type === 'subscription') {
      return plan.videos_this_month < getVideosIncluded(plan.plan_name);
    }
    if (plan.plan_type === 'per_video') {
      return plan.status === 'active';
    }
    return getTotalCredits() > 0;
  }, [plans, credits, getActivePlan, getTotalCredits]);

  const getVideosIncluded = (planName: string): number => {
    const map: Record<string, number> = {
      Starter: 5,
      Pro: 15,
      Enterprise: 999999,
    };
    return map[planName] || 0;
  };

  const getVideoPrice = (planName: string): number => {
    const map: Record<string, number> = {
      Standard: 149,
      Premium: 249,
      Express: 399,
      Starter: 149,
      Pro: 249,
      Enterprise: 399,
    };
    return map[planName] || 149;
  };

  return {
    plans,
    credits,
    loading,
    error,
    refresh: fetchBilling,
    getActivePlan,
    getTotalCredits,
    canCreateVideo,
    getVideosIncluded,
    getVideoPrice,
  };
}

export const useCredits = useBilling;