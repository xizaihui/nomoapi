import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuditLogs, useAuditStats } from '../hooks/useAuditLogs';
import { reviewAuditLog } from '../api';
import { RISK_LEVELS, CATEGORIES } from '../constants';
import { Shield, Search, Eye, CheckCircle, AlertTriangle, XCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const AuditLogsPage = () => {
  const { t } = useTranslation();
  const { logs, total, loading, params, setParams, refresh } = useAuditLogs();
  const { stats } = useAuditStats();
  const [expandedId, setExpandedId] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [filters, setFilters] = useState({ risk_level: '', risk_category: '', username: '', keyword: '' });

  const totalPages = Math.ceil(total / (params.page_size || 20));

  const applyFilters = () => {
    const p = { ...filters };
    Object.keys(p).forEach((k) => { if (p[k] === '') delete p[k]; });
    setParams({ ...p, page: 1 });
  };

  const handleReview = async (requestId) => {
    const res = await reviewAuditLog(requestId, reviewNote);
    if (res.success) {
      setReviewNote('');
      setExpandedId(null);
      refresh();
    }
  };

  return (
    <div className='p-4 md:p-6 pt-[72px] md:pt-[80px] space-y-6 max-w-[1400px] mx-auto'>
      {/* 页面标题 */}
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-lg bg-primary/10'>
          <Shield className='w-6 h-6 text-primary' />
        </div>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>{t('安全审计')}</h1>
          <p className='text-sm text-muted-foreground'>{t('监控员工 AI 使用行为，识别潜在安全风险')}</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <StatCard label={t('总记录')} value={stats.total || 0} icon={<Eye className='w-4 h-4' />} color='blue' />
        <StatCard label={t('可疑')} value={stats.by_level?.['1'] || 0} icon={<AlertTriangle className='w-4 h-4' />} color='yellow' />
        <StatCard label={t('危险')} value={stats.by_level?.['2'] || 0} icon={<XCircle className='w-4 h-4' />} color='orange' />
        <StatCard label={t('高危')} value={stats.by_level?.['3'] || 0} icon={<Shield className='w-4 h-4' />} color='red' />
      </div>

      {/* 筛选栏 */}
      <div className='rounded-lg border bg-card p-4'>
        <div className='flex items-center gap-2 mb-3'>
          <Filter className='w-4 h-4 text-muted-foreground' />
          <span className='text-sm font-medium'>{t('筛选条件')}</span>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3'>
          <input
            type='text'
            placeholder={t('用户名')}
            value={filters.username}
            onChange={(e) => setFilters((f) => ({ ...f, username: e.target.value }))}
            className='h-9 rounded-md border border-input bg-background px-3 text-sm'
          />
          <input
            type='text'
            placeholder={t('搜索提问内容')}
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
            className='h-9 rounded-md border border-input bg-background px-3 text-sm'
          />
          <select
            value={filters.risk_level}
            onChange={(e) => setFilters((f) => ({ ...f, risk_level: e.target.value }))}
            className='h-9 rounded-md border border-input bg-background px-3 text-sm'
          >
            <option value=''>{t('全部风险等级')}</option>
            {Object.entries(RISK_LEVELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            value={filters.risk_category}
            onChange={(e) => setFilters((f) => ({ ...f, risk_category: e.target.value }))}
            className='h-9 rounded-md border border-input bg-background px-3 text-sm'
          >
            <option value=''>{t('全部规则类型')}</option>
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
          <button
            onClick={applyFilters}
            className='h-9 rounded-md bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90 transition-colors'
          >
            <Search className='w-4 h-4 inline mr-1' />
            {t('搜索')}
          </button>
        </div>
      </div>

      {/* 日志表格 */}
      <div className='rounded-lg border bg-card overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b bg-muted/50'>
                <th className='text-left p-3 font-medium'>{t('时间')}</th>
                <th className='text-left p-3 font-medium'>{t('用户')}</th>
                <th className='text-left p-3 font-medium'>{t('Key')}</th>
                <th className='text-left p-3 font-medium'>{t('模型')}</th>
                <th className='text-left p-3 font-medium'>{t('提问内容')}</th>
                <th className='text-left p-3 font-medium'>{t('风险')}</th>
                <th className='text-left p-3 font-medium'>{t('类型')}</th>
                <th className='text-left p-3 font-medium'>{t('状态')}</th>
                <th className='text-left p-3 font-medium'>{t('操作')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className='p-8 text-center text-muted-foreground'>{t('加载中...')}</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={9} className='p-8 text-center text-muted-foreground'>{t('暂无审计记录')}</td></tr>
              ) : (
                logs.map((log) => {
                  const risk = RISK_LEVELS[log.risk_level] || RISK_LEVELS[0];
                  const cat = CATEGORIES[log.risk_category] || {};
                  const isExpanded = expandedId === log.request_id;
                  return (
                    <React.Fragment key={log.request_id}>
                      <tr className='border-b hover:bg-muted/30 transition-colors'>
                        <td className='p-3 whitespace-nowrap text-muted-foreground'>
                          {new Date(log.created_at * 1000).toLocaleString('zh-CN')}
                        </td>
                        <td className='p-3 font-medium'>{log.username}</td>
                        <td className='p-3 text-muted-foreground'>{log.token_name}</td>
                        <td className='p-3 text-muted-foreground text-xs'>{log.model_name}</td>
                        <td className='p-3 max-w-[300px] truncate' title={log.prompt}>
                          {log.prompt?.substring(0, 80)}{log.prompt?.length > 80 ? '...' : ''}
                        </td>
                        <td className='p-3'>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${risk.badge}`}>
                            {risk.label}
                          </span>
                        </td>
                        <td className='p-3 text-xs'>
                          {cat.icon && <span className='mr-1'>{cat.icon}</span>}
                          {cat.label || '-'}
                        </td>
                        <td className='p-3'>
                          {log.reviewed ? (
                            <span className='inline-flex items-center gap-1 text-foreground/80 text-xs'>
                              <CheckCircle className='w-3 h-3' /> {t('已审阅')}
                            </span>
                          ) : (
                            <span className='text-muted-foreground text-xs'>{t('待审阅')}</span>
                          )}
                        </td>
                        <td className='p-3'>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : log.request_id)}
                            className='text-xs text-primary hover:underline'
                          >
                            {isExpanded ? t('收起') : t('详情')}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className='bg-muted/20'>
                          <td colSpan={9} className='p-4'>
                            <div className='space-y-3'>
                              <div>
                                <span className='text-xs font-medium text-muted-foreground'>{t('完整提问')}:</span>
                                <p className='mt-1 text-sm bg-background rounded p-3 border whitespace-pre-wrap max-h-[200px] overflow-y-auto'>
                                  {log.prompt}
                                </p>
                              </div>
                              {log.risk_tags?.length > 0 && (
                                <div>
                                  <span className='text-xs font-medium text-muted-foreground'>{t('命中规则')}:</span>
                                  <div className='flex flex-wrap gap-1 mt-1'>
                                    {log.risk_tags.map((tag, i) => (
                                      <span key={i} className='px-2 py-0.5 bg-muted/60 text-foreground dark:bg-muted dark:text-muted-foreground rounded text-xs'>{tag}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {log.risk_detail && (
                                <div>
                                  <span className='text-xs font-medium text-muted-foreground'>{t('风险详情')}:</span>
                                  <p className='mt-1 text-sm'>{log.risk_detail}</p>
                                </div>
                              )}
                              {!log.reviewed && (
                                <div className='flex items-center gap-2 pt-2 border-t'>
                                  <input
                                    type='text'
                                    placeholder={t('审阅备注（可选）')}
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                    className='flex-1 h-8 rounded-md border border-input bg-background px-3 text-sm'
                                  />
                                  <button
                                    onClick={() => handleReview(log.request_id)}
                                    className='h-8 rounded-md bg-foreground/70 text-white px-3 text-sm font-medium hover:bg-foreground/80 transition-colors'
                                  >
                                    <CheckCircle className='w-3 h-3 inline mr-1' />
                                    {t('标记已审阅')}
                                  </button>
                                </div>
                              )}
                              {log.reviewed && log.review_note && (
                                <div>
                                  <span className='text-xs font-medium text-muted-foreground'>{t('审阅备注')}:</span>
                                  <p className='mt-1 text-sm'>{log.review_note} — {log.reviewed_by}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {total > 0 && (
          <div className='flex items-center justify-between px-4 py-3 border-t'>
            <span className='text-sm text-muted-foreground'>
              {t('共 {{total}} 条记录', { total })}
            </span>
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
      </div>
    </div>
  );
};

// 统计卡片组件
const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    blue: 'bg-muted/30 text-foreground dark:bg-muted dark:text-muted-foreground/60',
    yellow: 'bg-muted/30 text-foreground/80 dark:bg-muted dark:text-muted-foreground',
    orange: 'bg-muted/30 text-foreground/80 dark:bg-muted dark:text-muted-foreground',
    red: 'bg-muted/30 text-foreground/80 dark:bg-muted dark:text-muted-foreground',
  };
  return (
    <div className={`rounded-lg border p-4 ${colors[color] || ''}`}>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium opacity-80'>{label}</span>
        {icon}
      </div>
      <div className='text-2xl font-bold mt-1'>{value.toLocaleString()}</div>
    </div>
  );
};

export default AuditLogsPage;
