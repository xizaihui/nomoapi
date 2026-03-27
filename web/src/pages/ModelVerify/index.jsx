import React, { useState, useEffect, useCallback } from 'react';
import { Select, Button, Typography, Tag, Spin, Progress, Tooltip } from '@douyinfe/semi-ui';
import {
  ShieldCheck, ShieldAlert, ShieldX, Play, Server, Brain, Terminal, FileSignature,
  Wrench, CheckCircle2, XCircle, AlertTriangle, Info, RotateCcw, Sparkles
} from 'lucide-react';
import { API, showError } from '../../helpers';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

// ==================== 检测维度配置 ====================
const CHECK_CONFIG = {
  is_claude: {
    icon: <Brain size={16} />,
    passColor: 'text-green-600',
    failColor: 'text-red-500',
  },
  not_reverse: {
    icon: <Terminal size={16} />,
    passColor: 'text-green-600',
    failColor: 'text-orange-500',
  },
  thinking: {
    icon: <Sparkles size={16} />,
    passColor: 'text-blue-500',
    failColor: 'text-muted-foreground',
  },
  signature: {
    icon: <FileSignature size={16} />,
    passColor: 'text-green-600',
    failColor: 'text-muted-foreground',
  },
  tools: {
    icon: <Wrench size={16} />,
    passColor: 'text-green-600',
    failColor: 'text-muted-foreground',
  },
};

// ==================== 徽章配置 ====================
const BADGE_CONFIG = {
  '官方正版': { color: 'green', icon: <ShieldCheck size={20} />, bg: 'bg-green-500/10', border: 'border-green-500/30' },
  '高度可信': { color: 'blue', icon: <ShieldCheck size={20} />, bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  '基本可信': { color: 'cyan', icon: <ShieldAlert size={20} />, bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  '疑似逆向': { color: 'orange', icon: <ShieldAlert size={20} />, bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  '不可信': { color: 'red', icon: <ShieldX size={20} />, bg: 'bg-red-500/10', border: 'border-red-500/30' },
  '检测失败': { color: 'grey', icon: <ShieldX size={20} />, bg: 'bg-muted/30', border: 'border-border' },
};

// ==================== 主组件 ====================
export default function ModelVerify() {
  const { t } = useTranslation();

  // 状态
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4-5-20250929');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Claude 模型列表
  const claudeModels = [
    'claude-sonnet-4-5-20250929',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ];

  // 初始化
  useEffect(() => {
    const init = async () => {
      try {
        // 检查管理员权限
        const userRes = await API.get('/api/user/self');
        if (userRes.data?.success) {
          setIsAdmin(userRes.data.data.role >= 10);
        }

        // 获取渠道列表（管理员）
        const channelRes = await API.get('/api/channel/?p=0&page_size=100');
        if (channelRes.data?.success) {
          // 过滤 Anthropic 类型渠道
          const anthropicChannels = channelRes.data.data.filter(ch =>
            ch.type === 3 || // Anthropic
            ch.models?.toLowerCase().includes('claude')
          );
          setChannels(anthropicChannels);
        }
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        setInitLoading(false);
      }
    };
    init();
  }, []);

  // 执行鉴真
  const runVerify = useCallback(async () => {
    if (!selectedChannel) {
      showError('请选择渠道');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await API.post('/api/model/verify', {
        channel_id: parseInt(selectedChannel),
        model: selectedModel,
      });

      if (res.data) {
        setResult(res.data);
      }
    } catch (e) {
      showError(e.message || '检测失败');
      setResult({ success: false, error: e.message, badge: '检测失败' });
    } finally {
      setLoading(false);
    }
  }, [selectedChannel, selectedModel]);

  // 重置
  const reset = useCallback(() => {
    setResult(null);
  }, []);

  if (initLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto mt-[60px] px-4 py-12">
        <div className="text-center space-y-4">
          <ShieldAlert size={48} className="mx-auto text-muted-foreground" />
          <h2 className="text-lg font-semibold">需要管理员权限</h2>
          <p className="text-sm text-muted-foreground">模型鉴真功能仅对管理员开放</p>
        </div>
      </div>
    );
  }

  const badgeConfig = result?.badge ? BADGE_CONFIG[result.badge] || BADGE_CONFIG['检测失败'] : null;

  return (
    <div className="max-w-3xl mx-auto mt-[60px] px-4 pb-8 space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck size={24} className="text-primary" />
          <div>
            <h1 className="text-lg font-semibold">模型鉴真</h1>
            <p className="text-xs text-muted-foreground">检测 Claude 模型真伪，识别逆向渠道特征</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="small" theme="borderless" icon={<RotateCcw size={14} />} onClick={reset} disabled={loading || !result}>
            重置
          </Button>
        </div>
      </div>

      {/* 配置区 */}
      <div className="border border-border rounded-lg p-4 bg-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
              <Server size={12} /> 选择渠道
            </label>
            <Select
              size="default"
              style={{ width: '100%' }}
              value={selectedChannel}
              onChange={setSelectedChannel}
              placeholder="选择要检测的渠道"
              filter
              showClear
            >
              {channels.map(ch => (
                <Select.Option key={ch.id} value={String(ch.id)}>
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{ch.id}</span>
                    <span>{ch.name}</span>
                    {ch.type === 3 && <Tag size="small" color="purple">Anthropic</Tag>}
                  </span>
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
              <Brain size={12} /> 检测模型
            </label>
            <Select
              size="default"
              style={{ width: '100%' }}
              value={selectedModel}
              onChange={setSelectedModel}
              filter
              allowCreate
            >
              {claudeModels.map(m => (
                <Select.Option key={m} value={m}>{m}</Select.Option>
              ))}
            </Select>
          </div>
        </div>

        <Button
          theme="solid"
          type="primary"
          icon={<Play size={16} />}
          loading={loading}
          disabled={!selectedChannel}
          onClick={runVerify}
          style={{ width: '100%' }}
        >
          {loading ? '检测中...' : '开始鉴真'}
        </Button>
      </div>

      {/* 结果展示 */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* 总分卡片 */}
          <div className={`border rounded-lg p-6 ${badgeConfig?.bg} ${badgeConfig?.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${badgeConfig?.bg}`}>
                  {badgeConfig?.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{result.badge}</span>
                    <Tag color={badgeConfig?.color} size="large">{result.score}分</Tag>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">检测耗时</p>
                <p className="text-lg font-mono">{result.duration_ms}ms</p>
              </div>
            </div>

            {/* 进度条 */}
            <div className="mt-4">
              <Progress
                percent={result.score}
                showInfo={false}
                stroke={badgeConfig?.color === 'green' ? '#22c55e' :
                        badgeConfig?.color === 'blue' ? '#3b82f6' :
                        badgeConfig?.color === 'cyan' ? '#06b6d4' :
                        badgeConfig?.color === 'orange' ? '#f97316' :
                        badgeConfig?.color === 'red' ? '#ef4444' : '#6b7280'}
                style={{ height: 8 }}
              />
            </div>
          </div>

          {/* 检测项详情 */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 border-b border-border">
              <span className="font-medium text-sm">检测详情</span>
            </div>
            <div className="divide-y divide-border">
              {result.checks?.map((check, idx) => {
                const config = CHECK_CONFIG[check.id] || {};
                return (
                  <div key={idx} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={check.pass ? config.passColor : config.failColor}>
                        {config.icon}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{check.label}</p>
                        {check.detail && (
                          <p className="text-xs text-muted-foreground mt-0.5">{check.detail}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">权重 {check.weight}%</span>
                      {check.pass ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : (
                        <XCircle size={18} className="text-red-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 模型回答 */}
          {result.raw_answer && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
                <span className="font-medium text-sm">模型自述</span>
                <Tag size="small">{result.model}</Tag>
              </div>
              <div className="p-4">
                <p className="text-sm whitespace-pre-wrap">{result.raw_answer}</p>
              </div>
            </div>
          )}

          {/* Thinking 内容 */}
          {result.thinking && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                <Sparkles size={14} className="text-blue-500" />
                <span className="font-medium text-sm">Thinking 内容</span>
              </div>
              <div className="p-4 bg-blue-500/5">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                  {result.thinking.length > 500 ? result.thinking.slice(0, 500) + '...' : result.thinking}
                </p>
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {result.error && (
            <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/5">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle size={16} />
                <span className="font-medium">检测错误</span>
              </div>
              <p className="text-sm mt-2 text-red-400">{result.error}</p>
            </div>
          )}
        </div>
      )}

      {/* 说明 */}
      <div className="border border-border rounded-lg p-4 bg-muted/20 text-xs text-muted-foreground space-y-2">
        <p className="font-medium text-foreground text-sm flex items-center gap-2">
          <Info size={14} /> 检测说明
        </p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li><strong>是 Claude 模型</strong>（70%）：通过模型自我认知和响应特征判断</li>
          <li><strong>非逆向渠道</strong>（20%）：检测是否来自 IDE 插件等逆向来源</li>
          <li><strong>Thinking 支持</strong>（3%）：检测是否支持 Claude 的思考链功能</li>
          <li><strong>响应签名</strong>（3%）：验证响应格式是否符合 Anthropic 官方规范</li>
          <li><strong>工具调用能力</strong>（4%）：测试 Function Calling / Tool Use 功能</li>
        </ul>
        <p className="mt-3 text-muted-foreground">
          注意：此检测仅供参考，无法 100% 确定模型来源。高分不代表一定是官方 API，低分也可能是配置问题。
        </p>
      </div>
    </div>
  );
}
