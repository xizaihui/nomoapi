import { API } from '@/helpers/api';

const BASE = '/api/audit';

// --- 审计日志 ---
export async function fetchAuditLogs(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.set(k, v);
  });
  const res = await API.get(`${BASE}/logs?${query.toString()}`);
  return res.data;
}

export async function fetchAuditStats(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.set(k, v);
  });
  const res = await API.get(`${BASE}/stats?${query.toString()}`);
  return res.data;
}

export async function reviewAuditLog(requestId, reviewNote = '') {
  const res = await API.post(`${BASE}/logs/${requestId}/review`, { review_note: reviewNote });
  return res.data;
}

// --- 审计规则 ---
export async function fetchAuditRules(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.set(k, v);
  });
  const res = await API.get(`${BASE}/rules?${query.toString()}`);
  return res.data;
}

export async function createAuditRule(rule) {
  const res = await API.post(`${BASE}/rules`, rule);
  return res.data;
}

export async function updateAuditRule(id, rule) {
  const res = await API.put(`${BASE}/rules/${id}`, rule);
  return res.data;
}

export async function deleteAuditRule(id) {
  const res = await API.delete(`${BASE}/rules/${id}`);
  return res.data;
}

// --- 审计配置 ---
export async function fetchAuditStatus() {
  const res = await API.get(`${BASE}/status`);
  return res.data;
}

export async function setUserAuditConfig(userId, auditEnabled) {
  const res = await API.post(`${BASE}/config/user/${userId}`, { audit_enabled: auditEnabled });
  return res.data;
}

export async function batchGetAuditConfigs(userIds) {
  const res = await API.post(`${BASE}/config/batch`, { user_ids: userIds });
  return res.data;
}

// --- 保存策略 ---
export async function fetchRetentionPolicies() {
  const res = await API.get(`${BASE}/retention/policies`);
  return res.data;
}

export async function fetchRetentionSummary() {
  const res = await API.get(`${BASE}/retention/summary`);
  return res.data;
}

export async function upsertRetentionPolicy(data) {
  const res = await API.post(`${BASE}/retention/policies`, data);
  return res.data;
}

export async function deleteRetentionPolicy(id) {
  const res = await API.delete(`${BASE}/retention/policies/${id}`);
  return res.data;
}

export async function triggerRetentionCleanup() {
  const res = await API.post(`${BASE}/retention/cleanup`);
  return res.data;
}
