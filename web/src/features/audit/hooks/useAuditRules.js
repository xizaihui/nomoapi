import { useState, useEffect, useCallback } from 'react';
import { fetchAuditRules, createAuditRule, updateAuditRule, deleteAuditRule } from '../api';

export function useAuditRules(initialParams = {}) {
  const [rules, setRules] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, page_size: 20, ...initialParams });

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await fetchAuditRules(p || params);
      if (res.success) {
        setRules(res.data.rules || []);
        setTotal(res.data.total || 0);
      }
    } catch (e) {
      console.error('加载审计规则失败:', e);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { load(params); }, [params]);

  const refresh = () => load(params);
  const updateParams = (newParams) => setParams((prev) => ({ ...prev, ...newParams, page: newParams.page || 1 }));

  const addRule = async (rule) => {
    const res = await createAuditRule(rule);
    if (res.success) refresh();
    return res;
  };

  const editRule = async (id, rule) => {
    const res = await updateAuditRule(id, rule);
    if (res.success) refresh();
    return res;
  };

  const removeRule = async (id) => {
    const res = await deleteAuditRule(id);
    if (res.success) refresh();
    return res;
  };

  return { rules, total, loading, params, setParams: updateParams, refresh, addRule, editRule, removeRule };
}
