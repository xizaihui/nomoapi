import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuditRules } from '../hooks/useAuditRules';
import { RISK_LEVELS, CATEGORIES, RULE_TYPES } from '../constants';
import { BookOpen, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, X } from 'lucide-react';

const AuditRulesPage = () => {
  const { t } = useTranslation();
  const { rules, total, loading, params, setParams, refresh, addRule, editRule, removeRule } = useAuditRules();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const totalPages = Math.ceil(total / (params.page_size || 20));

  const openCreate = () => {
    setEditingRule(null);
    setModalOpen(true);
  };

  const openEdit = (rule) => {
    setEditingRule(rule);
    setModalOpen(true);
  };

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
    <div className='p-4 md:p-6 pt-[72px] md:pt-[80px] space-y-6 max-w-[1400px] mx-auto'>
      {/* 页面标题 */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-primary/10'>
            <BookOpen className='w-6 h-6 text-primary' />
          </div>
          <div>
            <h1 className='text-xl font-semibold tracking-tight'>{t('审计规则')}</h1>
            <p className='text-sm text-muted-foreground'>{t('管理安全审计的匹配规则')}</p>
          </div>
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
            {cat.icon} {cat.label}
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
                        {risk.label}
                      </span>
                      <span className='px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground'>
                        {cat.icon} {cat.label}
                      </span>
                      <span className='px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground'>
                        {ruleType.label}
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
                    <button
                      onClick={() => handleToggle(rule)}
                      className='p-1.5 rounded hover:bg-muted transition-colors'
                      title={rule.enabled ? t('禁用') : t('启用')}
                    >
                      {rule.enabled ? (
                        <ToggleRight className='w-5 h-5 text-foreground/80' />
                      ) : (
                        <ToggleLeft className='w-5 h-5 text-muted-foreground' />
                      )}
                    </button>
                    <button
                      onClick={() => openEdit(rule)}
                      className='p-1.5 rounded hover:bg-muted transition-colors'
                      title={t('编辑')}
                    >
                      <Pencil className='w-4 h-4 text-muted-foreground' />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id, rule.name)}
                      className='p-1.5 rounded hover:bg-muted transition-colors'
                      title={t('删除')}
                    >
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
            <button
              disabled={params.page <= 1}
              onClick={() => setParams({ page: params.page - 1 })}
              className='h-8 w-8 rounded-md border flex items-center justify-center disabled:opacity-50 hover:bg-muted transition-colors'
            >
              <ChevronLeft className='w-4 h-4' />
            </button>
            <span className='text-sm'>{params.page} / {totalPages}</span>
            <button
              disabled={params.page >= totalPages}
              onClick={() => setParams({ page: params.page + 1 })}
              className='h-8 w-8 rounded-md border flex items-center justify-center disabled:opacity-50 hover:bg-muted transition-colors'
            >
              <ChevronRight className='w-4 h-4' />
            </button>
          </div>
        </div>
      )}

      {/* 创建/编辑弹窗 */}
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

// 规则编辑弹窗
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
      const res = await onSave({
        ...form,
        patterns: JSON.stringify(patterns),
        risk_level: Number(form.risk_level),
      });
      if (!res.success) setError(res.message || t('保存失败'));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
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
            <input
              type='text'
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className='mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm'
              placeholder={t('例如：色情内容检测')}
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-sm font-medium'>{t('规则类型')}</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className='mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm'
              >
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='text-sm font-medium'>{t('匹配方式')}</label>
              <select
                value={form.rule_type}
                onChange={(e) => setForm((f) => ({ ...f, rule_type: e.target.value }))}
                className='mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm'
              >
                {Object.entries(RULE_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className='text-sm font-medium'>{t('风险等级')}</label>
            <select
              value={form.risk_level}
              onChange={(e) => setForm((f) => ({ ...f, risk_level: e.target.value }))}
              className='mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm'
            >
              <option value={1}>{t('可疑')}</option>
              <option value={2}>{t('危险')}</option>
              <option value={3}>{t('高危')}</option>
            </select>
          </div>

          <div>
            <label className='text-sm font-medium'>
              {form.rule_type === 'keyword' ? t('关键词（每行一个）') : t('正则表达式（每行一个）')}
            </label>
            <textarea
              value={form.patterns}
              onChange={(e) => setForm((f) => ({ ...f, patterns: e.target.value }))}
              rows={6}
              className='mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono'
              placeholder={form.rule_type === 'keyword' ? t('色情\n赌博\n毒品') : t('(?i)password\\s*[:=]\\s*\\S+')}
            />
          </div>

          <div>
            <label className='text-sm font-medium'>{t('描述')}</label>
            <input
              type='text'
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className='mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm'
              placeholder={t('规则的简要说明')}
            />
          </div>

          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              checked={form.enabled}
              onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
              className='rounded'
            />
            <span className='text-sm'>{t('启用规则')}</span>
          </label>
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

export default AuditRulesPage;
