import { getDashboard } from '@/api/generated/api';
import { getAccessToken } from '@/features/auth/model/accessToken';

export async function loadDashboard(signal?: AbortSignal) {
  const token = getAccessToken();
  const response = await getDashboard({
    signal,
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (response.status !== 200)
    throw new Error('ホームの情報を取得できませんでした。');
  return response.data;
}
