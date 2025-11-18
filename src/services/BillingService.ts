import { api } from '@/lib/api';

export const getPublishedSubscriptionPlans = async () => {
  return api<any>('/billing/plans/publish', { method: 'GET' });
};

export const getSubscriptionPlanDetailsById = async (plan_id: string) => {
  return api<any>(`/billing/plans/${plan_id}`, { method: 'GET' });
};

export const requestSubscriptionLink = async (plan_id: string) => {
  return api<any>('/billing/create-subscription', {
    method: 'POST',
    body: JSON.stringify({ plan_id }),
  });
};

export const createSubscriptionStripe = async (
  plan_id: string,
  payment_method_id?: string,
  currency?: string
) => {
  const payload: any = { plan_id };
  if (payment_method_id) payload.payment_method_id = payment_method_id;
  if (currency && currency !== 'USD') payload.currency = currency;

  return api<any>('/billing/create-subscription-stripe', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const stopSubscription = async () => {
  return api<any>('/billing/stop-subscription', { method: 'POST' });
};

export const getUserBillingData = async () => {
  return api<any>('/billing/my-data', { method: 'GET' });
};

export const getSubscriptionPlans = async (page = 1) => {
  return api<any>(`/billing/plans?page=${page}`, { method: 'GET' });
};

export default {
  getPublishedSubscriptionPlans,
  getSubscriptionPlanDetailsById,
  requestSubscriptionLink,
  createSubscriptionStripe,
  stopSubscription,
  getUserBillingData,
  getSubscriptionPlans,
};
