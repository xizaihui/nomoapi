import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Tag, Empty, Select, Input, Modal, Tooltip, Tabs, TabPane, Spin, Form } from '@douyinfe/semi-ui';
import { IconSearch } from '@/components/compat/icons';
import { RefreshCw, Plus, Trash2, Download, Upload, Save, Eye, GitCompare, Zap, RotateCcw, ChevronDown, ChevronUp, Copy, Archive } from 'lucide-react';
import { API, showError, showSuccess, showWarning } from '../../helpers';
import { useTranslation } from 'react-i18next';

// ==================== 上游渠道管理 ====================
function UpstreamCard({ upstream, index, onUpdate, onDelete, onLoadVendors }) {
  const [expanded, setExpanded] = useState(true);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [groups, setGroups] = useState([]);

  const handleLoadVendors = async () => {
    if (!upstream.url) {
      showError('请先填写上游地址');
      return;
    }
    setVendorLoading(true);
    try {
      const res = await API.get(`/api/pricing_sync/fetch?url=${encodeURIComponent(upstream.url)}`);
      if (res.data.success) {
        const v = res.data.vendors || [];
        const gr = res.data.group_ratio || {};
        setVendors(v);
        setGroups(Object.keys(gr).map(k => ({ name: k, ratio: gr[k] })));
        showSuccess(`加载成功: ${v.length} 个供应商`);
      } else {
        showError(res.data.message);
      }
    } catch (e) {
      showError(e.message);
    } finally {
      setVendorLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-lg mb-3 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span className="font-medium text-sm">{upstream.name || `上游 #${index + 1}`}</span>
          {upstream.url && <span className="text-xs text-muted-foreground">{upstream.url}</span>}
        </div>
        <Button type="danger" theme="borderless" size="small" icon={<Trash2 size={14} />} onClick={(e) => { e.stopPropagation(); onDelete(index); }} />
      </div>
      {expanded && (
        <div className="px-4 py-3 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">名称</label>
              <Input size="small" value={upstream.name} placeholder="如: gpt2share" onChange={v => onUpdate(index, 'name', v)} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">上游地址</label>
              <Input size="small" value={upstream.url} placeholder="https://api.example.com" onChange={v => onUpdate(index, 'url', v)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">供应商过滤</label>
              <Select size="small" style={{ width: '100%' }} value={upstream.vendor_id} placeholder="全部供应商" onChange={v => onUpdate(index, 'vendor_id', v != null ? Number(v) : null)} showClear>
                {vendors.map(v => <Select.Option key={v.id} value={v.id}>{v.name} ({v.id})</Select.Option>)}
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">分组过滤</label>
              <Select size="small" style={{ width: '100%' }} value={upstream.group} placeholder="全部分组" onChange={v => onUpdate(index, 'group', v || '')} showClear>
                {groups.map(g => <Select.Option key={g.name} value={g.name}>{g.name} (x{g.ratio})</Select.Option>)}
              </Select>
            </div>
            <div className="flex items-end">
              <Button size="small" theme="light" loading={vendorLoading} icon={<Download size={14} />} onClick={handleLoadVendors}>加载列表</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 分组倍率管理 ====================
function GroupRatioEditor({ groupRatios, onChange }) {
  const entries = Object.entries(groupRatios || {});

  const handleAdd = () => {
    const name = prompt('分组名称:');
    if (!name) return;
    const ratio = parseFloat(prompt('倍率:', '1')) || 1;
    onChange({ ...groupRatios, [name]: ratio });
  };

  const handleDelete = (key) => {
    const next = { ...groupRatios };
    delete next[key];
    onChange(next);
  };

  const handleUpdate = (key, value) => {
    onChange({ ...groupRatios, [key]: parseFloat(value) || 1 });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {entries.map(([name, ratio]) => (
          <div key={name} className="flex items-center border border-border rounded-md overflow-hidden bg-background">
            <span className="px-2 py-1 text-xs text-muted-foreground bg-muted/50 border-r border-border">{name}</span>
            <input
              type="number"
              step="0.01"
              value={ratio}
              onChange={e => handleUpdate(name, e.target.value)}
              className="w-14 px-2 py-1 text-xs text-center border-0 bg-transparent outline-none"
            />
            <span className="px-1.5 py-1 cursor-pointer text-muted-foreground hover:text-destructive border-l border-border text-xs" onClick={() => handleDelete(name)}>✕</span>
          </div>
        ))}
      </div>
      <Button size="small" theme="light" icon={<Plus size={14} />} onClick={handleAdd}>添加分组</Button>
    </div>
  );
}

// ==================== 主组件 ====================
export default function UpstreamPricingSyncSetting() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // 配置
  const [upstreams, setUpstreams] = useState([]);
  const [groupRatios, setGroupRatios] = useState({});

  // 预览 & 对比
  const [selectedUpstreamIdx, setSelectedUpstreamIdx] = useState(0);
  const [previewModels, setPreviewModels] = useState([]);
  const [diffData, setDiffData] = useState([]);
  const [diffStats, setDiffStats] = useState({ new: 0, changed: 0, unchanged: 0 });
  const [previewLoading, setPreviewLoading] = useState(false);
  const [diffLoading, setDiffLoading] = useState(false);

  // 备份
  const [backups, setBackups] = useState([]);
  const [backupModalVisible, setBackupModalVisible] = useState(false);

  // 搜索
  const [searchKeyword, setSearchKeyword] = useState('');
  const [diffSearchKeyword, setDiffSearchKeyword] = useState('');

  // 同步日志
  const [syncLogs, setSyncLogs] = useState([]);

  // 活动 Tab
  const [activeTab, setActiveTab] = useState('preview');

  // 加载配置
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/pricing_sync/config');
      if (res.data.success) {
        const cfg = res.data.data;
        setUpstreams(cfg.upstreams || []);
        setGroupRatios(cfg.group_ratios || {});
      }
    } catch (e) {
      showError('加载配置失败: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // 保存配置
  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await API.post('/api/pricing_sync/config', { upstreams, group_ratios: groupRatios });
      if (res.data.success) {
        showSuccess('配置已保存');
      } else {
        showError(res.data.message);
      }
    } catch (e) {
      showError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // 上游管理
  const addUpstream = () => {
    setUpstreams([...upstreams, { name: '', url: '', vendor_id: null, group: '' }]);
  };

  const updateUpstream = (idx, field, value) => {
    const next = [...upstreams];
    next[idx] = { ...next[idx], [field]: value };
    setUpstreams(next);
  };

  const deleteUpstream = (idx) => {
    setUpstreams(upstreams.filter((_, i) => i !== idx));
  };

  // 预览
  const handlePreview = async () => {
    const upstream = upstreams[selectedUpstreamIdx];
    if (!upstream?.url) { showError('请先配置上游渠道'); return; }
    setPreviewLoading(true);
    try {
      const res = await API.post('/api/pricing_sync/preview', {
        url: upstream.url,
        vendor_id: upstream.vendor_id,
        group: upstream.group,
      });
      if (res.data.success) {
        setPreviewModels(res.data.models || []);
        showSuccess(`预览完成: ${res.data.total} 个模型`);
      } else {
        showError(res.data.message);
      }
    } catch (e) {
      showError(e.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  // 对比
  const handleDiff = async () => {
    console.log('handleDiff called, selectedUpstreamIdx:', selectedUpstreamIdx, 'upstreams:', upstreams);
    const upstream = upstreams[selectedUpstreamIdx];
    if (!upstream?.url) { showError('请先配置上游渠道地址'); return; }
    setDiffLoading(true);
    setActiveTab('diff');
    try {
      console.log('Sending diff request:', { url: upstream.url, vendor_id: upstream.vendor_id, group: upstream.group });
      const res = await API.post('/api/pricing_sync/diff', {
        url: upstream.url,
        vendor_id: upstream.vendor_id,
        group: upstream.group,
      });
      console.log('Diff response:', res.data);
      if (res.data.success) {
        setDiffData(res.data.data || []);
        setDiffStats({ new: res.data.new || 0, changed: res.data.changed || 0, unchanged: res.data.unchanged || 0 });
        showSuccess(`对比完成: ${res.data.new || 0} 新增, ${res.data.changed || 0} 变更, ${res.data.unchanged || 0} 无变化`);
      } else {
        showError(res.data.message);
      }
    } catch (e) {
      console.error('Diff error:', e);
      showError('对比失败: ' + e.message);
    } finally {
      setDiffLoading(false);
    }
  };

  // 同步
  const handleSync = async () => {
    const upstream = upstreams[selectedUpstreamIdx];
    if (!upstream?.url) { showError('请先配置上游渠道'); return; }

    Modal.confirm({
      title: '确认同步',
      content: `确认从「${upstream.name || '#' + (selectedUpstreamIdx + 1)}」同步模型和价格？\n同步前会自动备份现有配置。`,
      onOk: async () => {
        setSyncing(true);
        setActiveTab('log');
        const now = new Date().toLocaleTimeString();
        setSyncLogs(prev => [...prev, { time: now, msg: '🚀 开始同步...', type: 'info' }]);
        try {
          const res = await API.post('/api/pricing_sync/sync', {
            url: upstream.url,
            vendor_id: upstream.vendor_id,
            group: upstream.group,
            group_ratios: groupRatios,
            upstream_name: upstream.name,
          });
          const t2 = new Date().toLocaleTimeString();
          if (res.data.success) {
            setSyncLogs(prev => [
              ...prev,
              { time: t2, msg: `✅ ${res.data.message}`, type: 'success' },
              ...(res.data.details || []).map(d => ({
                time: t2,
                msg: d,
                type: d.startsWith('✅') ? 'success' : d.startsWith('❌') ? 'error' : 'info'
              })),
            ]);
            showSuccess(res.data.message);
          } else {
            setSyncLogs(prev => [...prev, { time: t2, msg: `❌ ${res.data.message}`, type: 'error' }]);
            showError(res.data.message);
          }
        } catch (e) {
          setSyncLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `❌ ${e.message}`, type: 'error' }]);
          showError(e.message);
        } finally {
          setSyncing(false);
        }
      },
    });
  };

  // 备份
  const loadBackups = async () => {
    try {
      const res = await API.get('/api/pricing_sync/backups');
      if (res.data.success) {
        setBackups(res.data.data || []);
      }
    } catch (e) {
      showError(e.message);
    }
  };

  const handleRestore = async (index) => {
    Modal.confirm({
      title: '确认恢复',
      content: `确定要恢复此备份？当前配置将被覆盖。`,
      onOk: async () => {
        try {
          const res = await API.post('/api/pricing_sync/restore', { index });
          if (res.data.success) {
            showSuccess(res.data.message);
            setBackupModalVisible(false);
          } else {
            showError(res.data.message);
          }
        } catch (e) {
          showError(e.message);
        }
      },
    });
  };

  // 复制模型名称
  const copyModelNames = () => {
    console.log('copyModelNames called, previewModels:', previewModels);
    if (!previewModels || previewModels.length === 0) {
      showError('没有可复制的模型');
      return;
    }
    const names = previewModels.map(m => m.model_name).join(',');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(names).then(() => {
        showSuccess(`已复制 ${previewModels.length} 个模型名称`);
      }).catch((err) => {
        console.log('clipboard write failed:', err);
        fallbackCopy(names);
      });
    } else {
      fallbackCopy(names);
    }
  };

  // fallback 复制方法
  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showSuccess(`已复制 ${previewModels.length} 个模型名称`);
    } catch (e) {
      showError('复制失败，请手动复制');
    }
    document.body.removeChild(textarea);
  };

  // 过滤
  const filteredPreview = previewModels.filter(m => !searchKeyword || m.model_name.toLowerCase().includes(searchKeyword.toLowerCase()));
  const filteredDiff = diffData.filter(m => !diffSearchKeyword || m.model_name.toLowerCase().includes(diffSearchKeyword.toLowerCase()));

  // 预览表格列
  const previewColumns = [
    {
      title: '模型',
      dataIndex: 'model_name',
      render: v => <span className="font-mono text-xs text-primary">{v}</span>,
    },
    { title: '供应商', dataIndex: 'vendor_id', width: 80, render: v => v || '-' },
    {
      title: '输入倍率',
      dataIndex: 'model_ratio',
      width: 100,
      render: v => <span className="font-mono text-xs">{v}</span>,
    },
    {
      title: '补全倍率',
      dataIndex: 'completion_ratio',
      width: 100,
      render: v => <span className="font-mono text-xs">{v}</span>,
    },
    {
      title: '类型',
      dataIndex: 'quota_type',
      width: 80,
      render: (v, record) => v === 1 ? <Tag color="blue" size="small">固定 ${record.model_price}</Tag> : <Tag size="small">倍率</Tag>,
    },
  ];

  // 对比表格列
  const diffColumns = [
    {
      title: '模型',
      dataIndex: 'model_name',
      render: v => <span className="font-mono text-xs text-primary">{v}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: v => {
        if (v === 'new') return <Tag color="green" size="small">新增</Tag>;
        if (v === 'changed') return <Tag color="orange" size="small">变更</Tag>;
        return <Tag color="blue" size="small">无变化</Tag>;
      },
    },
    {
      title: '输入倍率',
      width: 160,
      render: (_, r) => {
        if (r.quota_type === 1) {
          if (r.status === 'changed') return <span className="font-mono text-xs"><span className="line-through text-destructive">${r.old_price}</span> → <span className="font-semibold text-primary">${r.new_price}</span></span>;
          return <span className="font-mono text-xs">${r.new_price || '-'}</span>;
        }
        if (r.status === 'changed') return <span className="font-mono text-xs"><span className="line-through text-destructive">{r.old_ratio}</span> → <span className="font-semibold text-primary">{r.new_ratio}</span></span>;
        return <span className="font-mono text-xs">{r.new_ratio ?? r.old_ratio ?? '-'}</span>;
      },
    },
    {
      title: '补全倍率',
      width: 160,
      render: (_, r) => {
        if (r.status === 'changed' && r.old_completion !== r.new_completion) return <span className="font-mono text-xs"><span className="line-through text-destructive">{r.old_completion}</span> → <span className="font-semibold text-primary">{r.new_completion}</span></span>;
        return <span className="font-mono text-xs">{r.new_completion ?? '-'}</span>;
      },
    },
  ];

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />;

  return (
    <div className="space-y-5">
      {/* 上游渠道配置 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">上游渠道</h3>
          <div className="flex gap-2">
            <Button size="small" theme="light" icon={<Plus size={14} />} onClick={addUpstream}>添加渠道</Button>
            <Button size="small" theme="solid" icon={<Save size={14} />} loading={saving} onClick={saveConfig}>保存配置</Button>
          </div>
        </div>
        {upstreams.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8 border border-dashed border-border rounded-lg">
            暂无上游渠道，点击「添加渠道」开始配置
          </div>
        ) : (
          upstreams.map((u, i) => (
            <UpstreamCard key={i} upstream={u} index={i} onUpdate={updateUpstream} onDelete={deleteUpstream} />
          ))
        )}
      </div>

      {/* 分组倍率 */}
      <div>
        <h3 className="text-sm font-semibold mb-3">自定义分组倍率</h3>
        <div className="border border-border rounded-lg p-4">
          <GroupRatioEditor groupRatios={groupRatios} onChange={setGroupRatios} />
        </div>
      </div>

      {/* 同步操作区 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">同步管理</h3>
          <div className="flex gap-2 items-center">
            <Select size="small" style={{ width: 180 }} value={selectedUpstreamIdx} onChange={setSelectedUpstreamIdx}>
              {upstreams.map((u, i) => <Select.Option key={i} value={i}>{u.name || `上游 #${i + 1}`}</Select.Option>)}
            </Select>
            <Button size="small" theme="light" icon={<Eye size={14} />} loading={previewLoading} onClick={handlePreview}>预览</Button>
            <Button size="small" theme="light" icon={<GitCompare size={14} />} loading={diffLoading} onClick={handleDiff}>对比</Button>
            <Button size="small" theme="solid" icon={<Zap size={14} />} loading={syncing} onClick={handleSync}>同步</Button>
            <Button size="small" theme="borderless" icon={<Archive size={14} />} onClick={() => { loadBackups(); setBackupModalVisible(true); }}>备份</Button>
          </div>
        </div>

        {/* 统计卡片 */}
        {(previewModels.length > 0 || diffData.length > 0) && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="border border-border rounded-lg p-3 text-center">
              <div className="text-2xl font-semibold">{previewModels.length || diffData.length}</div>
              <div className="text-xs text-muted-foreground">匹配模型</div>
            </div>
            <div className="border border-border rounded-lg p-3 text-center">
              <div className="text-2xl font-semibold text-primary">{diffStats.new}</div>
              <div className="text-xs text-muted-foreground">新增</div>
            </div>
            <div className="border border-border rounded-lg p-3 text-center">
              <div className="text-2xl font-semibold" style={{ color: 'var(--semi-color-warning)' }}>{diffStats.changed}</div>
              <div className="text-xs text-muted-foreground">变更</div>
            </div>
            <div className="border border-border rounded-lg p-3 text-center">
              <div className="text-2xl font-semibold" style={{ color: 'var(--semi-color-info)' }}>{diffStats.unchanged}</div>
              <div className="text-xs text-muted-foreground">无变化</div>
            </div>
          </div>
        )}

        {/* Tabs: 预览 / 对比 / 日志 */}
        <Tabs type="line" activeKey={activeTab} onChange={(key) => {
          setActiveTab(key);
          // 点击对比预览 tab 时，如果没有数据，自动触发对比
          if (key === 'diff' && diffData.length === 0 && !diffLoading) {
            handleDiff();
          }
        }}>
          <TabPane tab="模型列表" itemKey="preview">
            {previewModels.length > 0 && (
              <>
                <div className="flex gap-2 mb-3">
                  <Input prefix={<IconSearch />} size="small" placeholder="搜索模型..." value={searchKeyword} onChange={setSearchKeyword} style={{ width: 240 }} />
                  <Button size="small" theme="borderless" icon={<Copy size={14} />} onClick={copyModelNames}>复制全部模型名</Button>
                </div>
                <Table columns={previewColumns} dataSource={filteredPreview} pagination={{ pageSize: 15 }} size="small" rowKey="model_name" />
              </>
            )}
            {previewModels.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-10">选择上游渠道后点击「预览」</div>
            )}
          </TabPane>
          <TabPane tab="对比预览" itemKey="diff">
            {diffData.length > 0 && (
              <>
                <div className="mb-3">
                  <Input prefix={<IconSearch />} size="small" placeholder="搜索模型..." value={diffSearchKeyword} onChange={setDiffSearchKeyword} style={{ width: 240 }} />
                </div>
                <Table columns={diffColumns} dataSource={filteredDiff} pagination={{ pageSize: 15 }} size="small" rowKey="model_name" />
              </>
            )}
            {diffData.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-10">点击「对比」查看同步前后变化</div>
            )}
          </TabPane>
          <TabPane tab="同步日志" itemKey="log">
            <div className="bg-[#1a1a2e] rounded-lg p-4 max-h-80 overflow-y-auto font-mono text-xs leading-7">
              {syncLogs.length === 0 && <div className="text-[#60a5fa]"><span className="text-[#6e6e80] mr-2">--:--</span>等待同步...</div>}
              {syncLogs.map((log, i) => (
                <div key={i} className={log.type === 'success' ? 'text-[#4ade80]' : log.type === 'error' ? 'text-[#f87171]' : 'text-[#60a5fa]'}>
                  <span className="text-[#6e6e80] mr-2">{log.time}</span>{log.msg}
                </div>
              ))}
            </div>
          </TabPane>
        </Tabs>
      </div>

      {/* 备份 Modal */}
      <Modal title="备份记录" visible={backupModalVisible} footer={null} onCancel={() => setBackupModalVisible(false)} width={600}>
        {backups.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-6">暂无备份</div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {backups.map((b, i) => (
              <div key={i} className="flex items-center justify-between border border-border rounded-md p-3">
                <div>
                  <div className="text-sm font-medium">{b.upstream_name || '手动备份'}</div>
                  <div className="text-xs text-muted-foreground">{new Date(b.timestamp).toLocaleString()}</div>
                </div>
                <Button size="small" theme="light" icon={<RotateCcw size={14} />} onClick={() => handleRestore(i)}>恢复</Button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
