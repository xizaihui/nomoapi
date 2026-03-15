import { useState, useEffect, useCallback } from 'react';
import { fetchAuditLogs, fetchAuditStats } from '../api';

export function useAuditLogs(initialParams = {}) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, page_size: 20, ...initialParams });

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await fetchAuditLogs(p || params);
      if (res.success) {
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
      }
    } catch (e) {
      console.error('加载审计日志失败:', e);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { load(params); }, [params]);

  const refresh = () => load(params);
  const updateParams = (newParams) => setParams((prev) => ({ ...prev, ...newParams, page: newParams.page || 1 }));

  return { logs, total, loading, params, setParams: updateParams, refresh };
}

export function useAuditStats(group = '') {
  const [stats, setStats] = useState({ total: 0, by_level: {}, by_category: {} });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const now = Math.floor(Date.now() / 1000);
      const res = await fetchAuditStats({ group, start_time: now - 86400 * 30, end_time: now });
      if (res.success) setStats(res.data);
    } catch (e) {
      console.error('加载审计统计失败:', e);
    } finally {
      setLoading(false);
    }
  }, [group]);

  useEffect(() => { load(); }, [load]);

  return { stats, loading, refresh: load };
}
