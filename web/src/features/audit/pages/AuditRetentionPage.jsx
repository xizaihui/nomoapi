import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchRetentionPolicies, fetchRetentionSummary, upsertRetentionPolicy, deleteRetentionPolicy, triggerRetentionCleanup } from '../api';
import { Clock, Database, Plus, Pencil, Trash2, Play, X, Infinity, AlertTriangle } from 'lucide-react';

const PRESET_DAYS = [
  { label: '30 天', value: 30 },
  { label: '60 天', value: 60 },
  { label: '90 天', value: 90 },
  { label: '180 天', value: 180 },
  { label: '365 天', value: 365 },
  { label: '永久', value: 0 },
];

const AuditRetentionPage = () => {
  const { t } = useTranslation();
  const [policies, setPolicies] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [cleaning, setCleaning] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([fetchRetentionPolicies(), fetchRetentionSummary()]);
      if (pRes.success) setPolicies(pRes.data || []);
      if (sRes.success) setSummary(sRes.data || []);
    } catch (e) {
      console.error('Load retention data failed', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id, group) => {
    if (!confirm(t('确定删除分组「{{group}}」的保存策略？删除后将使用全局默认策略。', { group }))) return;
    const res = await deleteRetentionPolicy(id);
    if (res.success) loadData();
  };

  const handleCleanup = async () => {
    if (!confirm(t('确定立即执行一次清理？将按当前策略删除过期日志。'))) return;
    setCleaning(true);
    await triggerRetentionCleanup();
    setCleaning(false);
    setTimeout(loadData, 3000); // 3秒后刷新
  };

  const openCreate = () => {
    setEditingPolicy(null);
    setModalOpen(true);
  };

  const openEdit = (policy) => {
    setEditingPolicy(policy);
    setModalOpen(true);
  };

  // 合并 policies 和 summary 成展示数据
  const policyMap = {};
  policies.forEach((p) => { policyMap[p.group] = p; });

  const summaryMap = {};
  summary.forEach((s) => {
    if (!s.is_default || s.group === '*') return; // 只存非默认的分组概况
    summaryMap[s.group] = s;
  });

  // 合并：所有策略 + 有数据但没有策略的分组
  const displayItems = [];
  // 先放全局默认
  const globalPolicy = policyMap['*'];
  if (globalPolicy) {
    const globalSummary = summary.find((s) => s.group === '*');
    displayItems.push({
      ...globalPolicy,
      doc_count: globalSummary?.doc_count || 0,
      is_global: true,
    });
  }
  // 再放有专属策略的分组
  policies.filter((p) => p.group !== '*').forEach((p) => {
    const s = summary.find((si) => si.group === p.group);
    displayItems.push({
      ...p,
      doc_count: s?.doc_count || 0,
      is_global: false,
    });
  });
  // 最后放有数据但没有专属策略的分组
  summary
    .filter((s) => s.group !== '*' && s.is_default && !policyMap[s.group])
    .forEach((s) => {
      displayItems.push({
        id: null,
        group: s.group,
        retention_days: globalPolicy?.retention_days || 90,
        description: '继承全局默认',
        doc_count: s.doc_count,
        is_global: false,
        inherited: true,
      });
    });

  return (
    <div className='p-4 md:p-6 pt-[72px] md:pt-[80px] space-y-6 max-w-[1200px] mx-auto'>
      {/* 标题 */}
      <div className='flex items-center justify-between flex-wrap gap-3'>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-primary/10'>
            <Clock className='w-6 h-6 text-primary' />
          </div>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>{t('日志保存策略')}</h1>
            <p className='text-sm text-muted-foreground'>{t('配置审计日志的保存时间，支持按分组（公司）设置不同策略')}</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={handleCleanup}
            disabled={cleaning}
            className='h-9 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted transition-colors flex items-center gap-1.5 disabled:opacity-50'
          >
            <Play className='w-4 h-4' />
            {cleaning ? t('清理中...') : t('立即清理')}
          </button>
          <button
            onClick={openCreate}
            className='h-9 rounded-md bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5'
          >
            <Plus className='w-4 h-4' />
            {t('添加策略')}
          </button>
        </div>
      </div>

      {/* 说明卡片 */}
      <div className='rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1'>
        <p>• <strong>{t('全局默认（*）')}</strong>{t('：对所有没有专属策略的分组生效')}</p>
        <p>• {t('保存天数设为')} <strong>0</strong> {t('表示永久保存，不会自动清理')}</p>
        <p>• {t('每天凌晨 3 点自动执行清理，也可手动触发')}</p>
        <p>• {t('不同公司（分组）可以设置不同的保存时间')}</p>
      </div>

      {/* 策略列表 */}
      {loading ? (
        <div className='rounded-lg border bg-card p-8 text-center text-muted-foreground'>{t('加载中...')}</div>
      ) : (
        <div className='space-y-3'>
          {displayItems.map((item) => (
            <div
              key={item.group}
              className={`rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow ${item.is_global ? 'border-primary/30' : ''}`}
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    {item.is_global ? (
                      <span className='font-semibold text-lg'>🌐 {t('全局默认')}</span>
                    ) : (
                      <span className='font-medium text-lg'>{item.group}</span>
                    )}
                    {/* 保存天数 badge */}
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground'>
                      {item.retention_days === 0 ? (
                        <><Infinity className='w-3 h-3 mr-1' />{t('永久保存')}</>
                      ) : (
                        <><Clock className='w-3 h-3 mr-1' />{item.retention_days} {t('天')}</>
                      )}
                    </span>
                    {item.inherited && (
                      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted/60 text-muted-foreground'>
                        {t('继承全局')}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className='text-sm text-muted-foreground mt-1'>{item.description}</p>
                  )}
                  <div className='flex items-center gap-4 mt-2 text-xs text-muted-foreground'>
                    <span className='flex items-center gap-1'>
                      <Database className='w-3 h-3' />
                      {(item.doc_count || 0).toLocaleString()} {t('条记录')}
                    </span>
                    {item.retention_days > 0 && item.doc_count > 0 && (
                      <span className='flex items-center gap-1 text-foreground/60'>
                        <AlertTriangle className='w-3 h-3' />
                        {t('超过')} {item.retention_days} {t('天的记录将被自动清理')}
                      </span>
                    )}
                  </div>
                </div>
                <div className='flex items-center gap-1 flex-shrink-0'>
                  <button
                    onClick={() => openEdit(item)}
                    className='p-1.5 rounded hover:bg-muted transition-colors'
                    title={t('编辑')}
                  >
                    <Pencil className='w-4 h-4 text-muted-foreground' />
                  </button>
                  {!item.is_global && item.id && (
                    <button
                      onClick={() => handleDelete(item.id, item.group)}
                      className='p-1.5 rounded hover:bg-muted transition-colors'
                      title={t('删除')}
                    >
                      <Trash2 className='w-4 h-4 text-foreground/60' />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {displayItems.length === 0 && (
            <div className='rounded-lg border bg-card p-8 text-center text-muted-foreground'>
              {t('暂无保存策略')}
            </div>
          )}
        </div>
      )}

      {/* 编辑弹窗 */}
      {modalOpen && (
        <RetentionModal
          policy={editingPolicy}
          isGlobal={editingPolicy?.is_global || editingPolicy?.group === '*'}
          onClose={() => setModalOpen(false)}
          onSave={async (data) => {
            const res = await upsertRetentionPolicy(data);
            if (res.success) {
              setModalOpen(false);
              loadData();
            }
            return res;
          }}
        />
      )}
    </div>
  );
};

// 编辑弹窗
const RetentionModal = ({ policy, isGlobal, onClose, onSave }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    group: policy?.group || '',
    retention_days: policy?.retention_days ?? 90,
    description: policy?.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [customDays, setCustomDays] = useState(
    !PRESET_DAYS.some((p) => p.value === (policy?.retention_days ?? 90))
  );

  const handleSubmit = async () => {
    if (!form.group.trim()) { setError(t('请输入分组名')); return; }
    setSaving(true);
    setError('');
    try {
      const res = await onSave(form);
      if (res && !res.success) setError(res.message || t('保存失败'));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50' onClick={onClose}>
      <div className='bg-background rounded-lg border shadow-sm w-full max-w-md mx-4' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between p-4 border-b'>
          <h2 className='text-lg font-semibold'>
            {policy ? t('编辑保存策略') : t('添加保存策略')}
          </h2>
          <button onClick={onClose} className='p-1 rounded hover:bg-muted'><X className='w-4 h-4' /></button>
        </div>
        <div className='p-4 space-y-4'>
          {error && (
            <div className='p-2 rounded bg-destructive/10 text-destructive text-sm'>{error}</div>
          )}

          <div>
            <label className='text-sm font-medium'>{t('分组名称')}</label>
            {isGlobal ? (
              <div className='mt-1 h-9 flex items-center px-3 rounded-md border border-border bg-muted text-sm text-muted-foreground'>
                * ({t('全局默认')})
              </div>
            ) : (
              <input
                type='text'
                value={form.group}
                onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
                className='mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm'
                placeholder={t('输入分组名，如 company-a')}
                disabled={!!policy?.id && policy?.group !== '*'}
              />
            )}
            <p className='text-xs text-muted-foreground mt-1'>
              {isGlobal
                ? t('全局默认策略对所有没有专属策略的分组生效')
                : t('输入用户所属的分组名称（即用户管理中的分组字段）')}
            </p>
          </div>

          <div>
            <label className='text-sm font-medium'>{t('保存天数')}</label>
            <div className='flex flex-wrap gap-2 mt-2'>
              {PRESET_DAYS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    setForm((f) => ({ ...f, retention_days: preset.value }));
                    setCustomDays(false);
                  }}
                  className={`h-8 px-3 rounded-md text-sm font-medium transition-colors ${
                    !customDays && form.retention_days === preset.value
                      ? 'bg-foreground text-background'
                      : 'border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {preset.value === 0 ? <><Infinity className='w-3 h-3 inline mr-1' />{preset.label}</> : preset.label}
                </button>
              ))}
              <button
                onClick={() => setCustomDays(true)}
                className={`h-8 px-3 rounded-md text-sm font-medium transition-colors ${
                  customDays
                    ? 'bg-foreground text-background'
                    : 'border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {t('自定义')}
              </button>
            </div>
            {customDays && (
              <div className='flex items-center gap-2 mt-2'>
                <input
                  type='number'
                  min='0'
                  value={form.retention_days}
                  onChange={(e) => setForm((f) => ({ ...f, retention_days: parseInt(e.target.value) || 0 }))}
                  className='h-9 w-24 rounded-md border border-border bg-background px-3 text-sm'
                />
                <span className='text-sm text-muted-foreground'>{t('天')}</span>
              </div>
            )}
          </div>

          <div>
            <label className='text-sm font-medium'>{t('备注')}</label>
            <input
              type='text'
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className='mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm'
              placeholder={t('可选，如：VIP 客户保留 1 年')}
            />
          </div>
        </div>
        <div className='flex justify-end gap-2 p-4 border-t'>
          <button onClick={onClose} className='h-9 rounded-md border px-4 text-sm hover:bg-muted transition-colors'>
            {t('取消')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className='h-9 rounded-md bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50'
          >
            {saving ? t('保存中...') : t('保存')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditRetentionPage;
