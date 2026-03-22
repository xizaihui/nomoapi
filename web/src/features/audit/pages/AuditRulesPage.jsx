import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuditRules } from '../hooks/useAuditRules';
import { RISK_LEVELS, CATEGORIES, RULE_TYPES } from '../constants';
import { fetchRetentionPolicies, fetchRetentionSummary, upsertRetentionPolicy, deleteRetentionPolicy, triggerRetentionCleanup } from '../api';
import { BookOpen, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, X, Clock, Database, Play, Infinity, AlertTriangle, ShieldCheck, Timer } from 'lucide-react';

/* ============================================================
   保存策略预设
============================================================ */
const PRESET_DAYS = [
  { labelKey: '30 天', value: 30 },
  { labelKey: '60 天', value: 60 },
  { labelKey: '90 天', value: 90 },
  { labelKey: '180 天', value: 180 },
  { labelKey: '365 天', value: 365 },
  { labelKey: '永久', value: 0 },
];

/* ============================================================
   主页面
============================================================ */
const AuditRulesPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('rules');

  const tabs = [
    { key: 'rules', label: t('审计规则'), icon: ShieldCheck },
    { key: 'retention', label: t('保存策略'), icon: Timer },
  ];

  return (
    <div className='p-4 md:p-6 pt-[72px] md:pt-[80px] space-y-6 max-w-[1400px] mx-auto'>
      {/* Tab 切换 */}
      <div className='flex items-center gap-1 border-b'>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className='w-4 h-4' />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 内容 */}
      {activeTab === 'rules' ? <RulesPanel /> : <RetentionPanel />}
    </div>
  );
};

/* ============================================================
   审计规则面板
============================================================ */
const RulesPanel = () => {
  const { t } = useTranslation();
  const { rules, total, loading, params, setParams, refresh, addRule, editRule, removeRule } = useAuditRules();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const totalPages = Math.ceil(total / (params.page_size || 20));

  const openCreate = () => { setEditingRule(null); setModalOpen(true); };
  const openEdit = (rule) => { setEditingRule(rule); setModalOpen(true); };

  const handleDelete = async (id, name) => {
    if (!confirm(t('确定删除规则「{{name}}」？', { name }))) return;
    await removeRule(id);
  };

  const handleToggle = async (rule) => {
    await editRule(rule.id, { ...rule, enabled: !rule.enabled });
  };

  const handleFilterChange = (cat) => {
    setCategoryFilter(cat);
    setParams({ category: cat, page: 1 });
  };

  return (
    <div className='space-y-5'>
      {/* 标题行 */}
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm text-muted-foreground'>{t('管理安全审计的匹配规则')}</p>
        </div>
        <button
          onClick={openCreate}
          className='h-9 rounded-md bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1'
        >
          <Plus className='w-4 h-4' />
          {t('添加规则')}
        </button>
      </div>

      {/* 分类筛选 */}
      <div className='flex flex-wrap gap-2'>
        <button
          onClick={() => handleFilterChange('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!categoryFilter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          {t('全部')}
        </button>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => handleFilterChange(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoryFilter === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {cat.icon} {t(cat.label)}
          </button>
        ))}
      </div>

      {/* 规则列表 */}
      <div className='space-y-3'>
        {loading ? (
          <div className='rounded-lg border bg-card p-8 text-center text-muted-foreground'>{t('加载中...')}</div>
        ) : rules.length === 0 ? (
          <div className='rounded-lg border bg-card p-8 text-center text-muted-foreground'>{t('暂无审计规则')}</div>
        ) : (
          rules.map((rule) => {
            const cat = CATEGORIES[rule.category] || {};
            const risk = RISK_LEVELS[rule.risk_level] || RISK_LEVELS[1];
            const ruleType = RULE_TYPES[rule.rule_type] || {};
            let patterns = [];
            try { patterns = JSON.parse(rule.patterns); } catch { patterns = [rule.patterns]; }

            return (
              <div key={rule.id} className='rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='font-medium'>{rule.name}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${risk.badge}`}>
                        {t(risk.label)}
                      </span>
                      <span className='px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground'>
                        {cat.icon} {t(cat.label)}
                      </span>
                      <span className='px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground'>
                        {t(ruleType.label)}
                      </span>
                      {rule.is_global ? (
                        <span className='px-2 py-0.5 rounded-full text-xs bg-muted/60 text-foreground dark:bg-muted dark:text-muted-foreground'>
                          {t('全局')}
                        </span>
                      ) : (
                        <span className='px-2 py-0.5 rounded-full text-xs bg-muted/60 text-foreground/80 dark:bg-muted dark:text-muted-foreground'>
                          {t('自定义')} ({rule.owner_group})
                        </span>
                      )}
                    </div>
                    {rule.description && (
                      <p className='text-sm text-muted-foreground mt-1'>{rule.description}</p>
                    )}
                    <div className='flex flex-wrap gap-1 mt-2'>
                      {patterns.slice(0, 8).map((p, i) => (
                        <code key={i} className='px-1.5 py-0.5 bg-muted rounded text-xs font-mono'>{p}</code>
                      ))}
                      {patterns.length > 8 && (
                        <span className='text-xs text-muted-foreground'>+{patterns.length - 8} {t('更多')}</span>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center gap-1 flex-shrink-0'>
                    <button onClick={() => handleToggle(rule)} className='p-1.5 rounded hover:bg-muted transition-colors' title={rule.enabled ? t('禁用') : t('启用')}>
                      {rule.enabled ? <ToggleRight className='w-5 h-5 text-foreground/80' /> : <ToggleLeft className='w-5 h-5 text-muted-foreground' />}
                    </button>
                    <button onClick={() => openEdit(rule)} className='p-1.5 rounded hover:bg-muted transition-colors' title={t('编辑')}>
                      <Pencil className='w-4 h-4 text-muted-foreground' />
                    </button>
                    <button onClick={() => handleDelete(rule.id, rule.name)} className='p-1.5 rounded hover:bg-muted transition-colors' title={t('删除')}>
                      <Trash2 className='w-4 h-4 text-foreground/80' />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 分页 */}
      {total > 0 && (
        <div className='flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>{t('共 {{total}} 条规则', { total })}</span>
          <div className='flex items-center gap-2'>
            <button disabled={params.page <= 1} onClick={() => setParams({ page: params.page - 1 })} className='h-8 w-8 rounded-md border flex items-center justify-center disabled:opacity-50 hover:bg-muted transition-colors'>
              <ChevronLeft className='w-4 h-4' />
            </button>
            <span className='text-sm'>{params.page} / {totalPages}</span>
            <button disabled={params.page >= totalPages} onClick={() => setParams({ page: params.page + 1 })} className='h-8 w-8 rounded-md border flex items-center justify-center disabled:opacity-50 hover:bg-muted transition-colors'>
              <ChevronRight className='w-4 h-4' />
            </button>
          </div>
        </div>
      )}

      {/* 规则弹窗 */}
      {modalOpen && (
        <RuleModal
          rule={editingRule}
          onClose={() => setModalOpen(false)}
          onSave={async (data) => {
            if (editingRule) {
              const res = await editRule(editingRule.id, data);
              if (res.success) setModalOpen(false);
              return res;
            } else {
              const res = await addRule(data);
              if (res.success) setModalOpen(false);
              return res;
            }
          }}
        />
      )}
    </div>
  );
};

/* ============================================================
   保存策略面板
============================================================ */
const RetentionPanel = () => {
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
    setTimeout(loadData, 3000);
  };

  const openCreate = () => { setEditingPolicy(null); setModalOpen(true); };
  const openEdit = (policy) => { setEditingPolicy(policy); setModalOpen(true); };

  // 合并 policies 和 summary
  const policyMap = {};
  policies.forEach((p) => { policyMap[p.group] = p; });

  const displayItems = [];
  const globalPolicy = policyMap['*'];
  if (globalPolicy) {
    const globalSummary = summary.find((s) => s.group === '*');
    displayItems.push({ ...globalPolicy, doc_count: globalSummary?.doc_count || 0, is_global: true });
  }
  policies.filter((p) => p.group !== '*').forEach((p) => {
    const s = summary.find((si) => si.group === p.group);
    displayItems.push({ ...p, doc_count: s?.doc_count || 0, is_global: false });
  });
  summary
    .filter((s) => s.group !== '*' && s.is_default && !policyMap[s.group])
    .forEach((s) => {
      displayItems.push({
        id: null, group: s.group,
        retention_days: globalPolicy?.retention_days || 90,
        description: '继承全局默认',
        doc_count: s.doc_count, is_global: false, inherited: true,
      });
    });

  return (
    <div className='space-y-5'>
      {/* 标题行 */}
      <div className='flex items-center justify-between flex-wrap gap-3'>
        <p className='text-sm text-muted-foreground'>{t('配置审计日志的保存时间，支持按分组（公司）设置不同策略')}</p>
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

      {/* 说明 */}
      <div className='rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1'>
        <p>• <strong>{t('全局默认（*）')}</strong>{t('：对所有没有专属策略的分组生效')}</p>
        <p>• {t('保存天数设为')} <strong>0</strong> {t('表示永久保存，不会自动清理')}</p>
        <p>• {t('每天凌晨 3 点自动执行清理，也可手动触发')}</p>
      </div>

      {/* 策略列表 */}
      {loading ? (
        <div className='rounded-lg border bg-card p-8 text-center text-muted-foreground'>{t('加载中...')}</div>
      ) : (
        <div className='space-y-3'>
          {displayItems.map((item) => (
            <div key={item.group} className={`rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow ${item.is_global ? 'border-primary/30' : ''}`}>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    {item.is_global ? (
                      <span className='font-semibold text-base'>🌐 {t('全局默认')}</span>
                    ) : (
                      <span className='font-medium text-base'>{item.group}</span>
                    )}
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
                  {item.description && <p className='text-sm text-muted-foreground mt-1'>{item.description}</p>}
                  <div className='flex items-center gap-4 mt-2 text-xs text-muted-foreground'>
                    <span className='flex items-center gap-1'>
                      <Database className='w-3 h-3' />
                      {(item.doc_count || 0).toLocaleString()} {t('条记录')}
                    </span>
                    {item.retention_days > 0 && item.doc_count > 0 && (
                      <span className='flex items-center gap-1'>
                        <AlertTriangle className='w-3 h-3' />
                        {t('超过')} {item.retention_days} {t('天的记录将被自动清理')}
                      </span>
                    )}
                  </div>
                </div>
                <div className='flex items-center gap-1 flex-shrink-0'>
                  <button onClick={() => openEdit(item)} className='p-1.5 rounded hover:bg-muted transition-colors' title={t('编辑')}>
                    <Pencil className='w-4 h-4 text-muted-foreground' />
                  </button>
                  {!item.is_global && item.id && (
                    <button onClick={() => handleDelete(item.id, item.group)} className='p-1.5 rounded hover:bg-muted transition-colors' title={t('删除')}>
                      <Trash2 className='w-4 h-4 text-muted-foreground' />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {displayItems.length === 0 && (
            <div className='rounded-lg border bg-card p-8 text-center text-muted-foreground'>{t('暂无保存策略')}</div>
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
            if (res.success) { setModalOpen(false); loadData(); }
            return res;
          }}
        />
      )}
    </div>
  );
};

/* ============================================================
   规则编辑弹窗
============================================================ */
const RuleModal = ({ rule, onClose, onSave }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: rule?.name || '',
    category: rule?.category || 'custom',
    rule_type: rule?.rule_type || 'keyword',
    patterns: rule?.patterns ? (() => { try { return JSON.parse(rule.patterns).join('\n'); } catch { return rule.patterns; } })() : '',
    risk_level: rule?.risk_level ?? 1,
    enabled: rule?.enabled ?? true,
    description: rule?.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError(t('请输入规则名称')); return; }
    if (!form.patterns.trim()) { setError(t('请输入匹配模式')); return; }
    const patterns = form.patterns.split('\n').map((s) => s.trim()).filter(Boolean);
    if (patterns.length === 0) { setError(t('匹配模式不能为空')); return; }
    setSaving(true);
    setError('');
    try {
      const res = await onSave({ ...form, patterns: JSON.stringify(patterns), risk_level: Number(form.risk_level) });
      if (!res.success) setError(res.message || t('保存失败'));
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50' onClick={onClose}>
      <div className='bg-background rounded-lg border shadow-sm w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between p-4 border-b'>
          <h2 className='text-base font-medium'>{rule ? t('编辑规则') : t('添加规则')}</h2>
          <button onClick={onClose} className='p-1 rounded hover:bg-muted'><X className='w-4 h-4' /></button>
        </div>
        <div className='p-4 space-y-4'>
          {error && <div className='p-2 rounded bg-muted/60 text-foreground dark:bg-muted dark:text-muted-foreground text-sm'>{error}</div>}
          <div>
            <label className='text-sm font-medium'>{t('规则名称')}</label>
            <input type='text' value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className='mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm' placeholder={t('例如：色情内容检测')} />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-sm font-medium'>{t('规则类型')}</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className='mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm'>
                {Object.entries(CATEGORIES).map(([k, v]) => (<option key={k} value={k}>{v.icon} {t(v.label)}</option>))}
              </select>
            </div>
            <div>
              <label className='text-sm font-medium'>{t('匹配方式')}</label>
              <select value={form.rule_type} onChange={(e) => setForm((f) => ({ ...f, rule_type: e.target.value }))} className='mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm'>
                {Object.entries(RULE_TYPES).map(([k, v]) => (<option key={k} value={k}>{t(v.label)}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className='text-sm font-medium'>{t('风险等级')}</label>
            <select value={form.risk_level} onChange={(e) => setForm((f) => ({ ...f, risk_level: e.target.value }))} className='mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm'>
              <option value={1}>{t('可疑')}</option>
              <option value={2}>{t('危险')}</option>
              <option value={3}>{t('高危')}</option>
            </select>
          </div>
          <div>
            <label className='text-sm font-medium'>{form.rule_type === 'keyword' ? t('关键词（每行一个）') : t('正则表达式（每行一个）')}</label>
            <textarea value={form.patterns} onChange={(e) => setForm((f) => ({ ...f, patterns: e.target.value }))} rows={6} className='mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono' placeholder={form.rule_type === 'keyword' ? t('色情\n赌博\n毒品') : t('(?i)password\\s*[:=]\\s*\\S+')} />
          </div>
          <div>
            <label className='text-sm font-medium'>{t('描述')}</label>
            <input type='text' value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className='mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm' placeholder={t('规则的简要说明')} />
          </div>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input type='checkbox' checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} className='rounded' />
            <span className='text-sm'>{t('启用规则')}</span>
          </label>
        </div>
        <div className='flex justify-end gap-2 p-4 border-t'>
          <button onClick={onClose} className='h-9 rounded-md border px-4 text-sm hover:bg-muted transition-colors'>{t('取消')}</button>
          <button onClick={handleSubmit} disabled={saving} className='h-9 rounded-md bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50'>{saving ? t('保存中...') : t('保存')}</button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   保存策略编辑弹窗
============================================================ */
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
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50' onClick={onClose}>
      <div className='bg-background rounded-lg border shadow-sm w-full max-w-md mx-4' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between p-4 border-b'>
          <h2 className='text-base font-medium'>{policy ? t('编辑保存策略') : t('添加保存策略')}</h2>
          <button onClick={onClose} className='p-1 rounded hover:bg-muted'><X className='w-4 h-4' /></button>
        </div>
        <div className='p-4 space-y-4'>
          {error && <div className='p-2 rounded bg-destructive/10 text-destructive text-sm'>{error}</div>}
          <div>
            <label className='text-sm font-medium'>{t('分组名称')}</label>
            {isGlobal ? (
              <div className='mt-1 h-9 flex items-center px-3 rounded-md border border-border bg-muted text-sm text-muted-foreground'>* ({t('全局默认')})</div>
            ) : (
              <input type='text' value={form.group} onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))} className='mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm' placeholder={t('输入分组名，如 company-a')} disabled={!!policy?.id && policy?.group !== '*'} />
            )}
            <p className='text-xs text-muted-foreground mt-1'>
              {isGlobal ? t('全局默认策略对所有没有专属策略的分组生效') : t('输入用户所属的分组名称（即用户管理中的分组字段）')}
            </p>
          </div>
          <div>
            <label className='text-sm font-medium'>{t('保存天数')}</label>
            <div className='flex flex-wrap gap-2 mt-2'>
              {PRESET_DAYS.map((preset) => (
                <button key={preset.value} onClick={() => { setForm((f) => ({ ...f, retention_days: preset.value })); setCustomDays(false); }}
                  className={`h-8 px-3 rounded-md text-sm font-medium transition-colors ${!customDays && form.retention_days === preset.value ? 'bg-foreground text-background' : 'border border-border text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  {preset.value === 0 ? <><Infinity className='w-3 h-3 inline mr-1' />{t(preset.labelKey)}</> : t(preset.labelKey)}
                </button>
              ))}
              <button onClick={() => setCustomDays(true)} className={`h-8 px-3 rounded-md text-sm font-medium transition-colors ${customDays ? 'bg-foreground text-background' : 'border border-border text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                {t('自定义')}
              </button>
            </div>
            {customDays && (
              <div className='flex items-center gap-2 mt-2'>
                <input type='number' min='0' value={form.retention_days} onChange={(e) => setForm((f) => ({ ...f, retention_days: parseInt(e.target.value) || 0 }))} className='h-9 w-24 rounded-md border border-border bg-background px-3 text-sm' />
                <span className='text-sm text-muted-foreground'>{t('天')}</span>
              </div>
            )}
          </div>
          <div>
            <label className='text-sm font-medium'>{t('备注')}</label>
            <input type='text' value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className='mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm' placeholder={t('可选，如：VIP 客户保留 1 年')} />
          </div>
        </div>
        <div className='flex justify-end gap-2 p-4 border-t'>
          <button onClick={onClose} className='h-9 rounded-md border px-4 text-sm hover:bg-muted transition-colors'>{t('取消')}</button>
          <button onClick={handleSubmit} disabled={saving} className='h-9 rounded-md bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50'>{saving ? t('保存中...') : t('保存')}</button>
        </div>
      </div>
    </div>
  );
};

export default AuditRulesPage;
