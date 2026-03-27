import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Select, Button, Typography, Tag, Spin, Tooltip, Collapse, Banner } from '@douyinfe/semi-ui';
import {
  FlaskConical, Play, CheckCircle2, XCircle, AlertTriangle, Copy, ChevronDown, ChevronUp,
  MessageSquare, Wrench, Code2, ArrowRight, Zap, Terminal, Monitor, Puzzle, RotateCcw,
  Server
} from 'lucide-react';
import { API, showError, showSuccess } from '../../helpers';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

// ==================== 测试场景定义 ====================

const TEST_SCENARIOS = {
  // 基础测试
  basic_chat: {
    id: 'basic_chat',
    name: '基础对话',
    desc: '验证模型是否支持标准聊天接口',
    icon: <MessageSquare size={15} />,
    category: 'basic',
    formats: ['openai', 'anthropic'],
  },
  function_calling: {
    id: 'function_calling',
    name: 'Function Calling',
    desc: '验证是否支持工具调用（Tool Use）',
    icon: <Wrench size={15} />,
    category: 'basic',
    formats: ['openai', 'anthropic'],
  },
  streaming: {
    id: 'streaming',
    name: 'Streaming 流式输出',
    desc: '验证是否支持 SSE 流式响应',
    icon: <Zap size={15} />,
    category: 'basic',
    formats: ['openai', 'anthropic'],
  },

  // 工具兼容性测试
  claude_code: {
    id: 'claude_code',
    name: 'Claude Code',
    desc: 'Anthropic 官方 CLI — Streaming + Tool Use',
    icon: <Terminal size={15} />,
    category: 'tools',
    formats: ['anthropic'],
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    desc: 'AI 代码编辑器 — OpenAI 格式 + Function Calling + Streaming',
    icon: <Monitor size={15} />,
    category: 'tools',
    formats: ['openai'],
  },
  cline: {
    id: 'cline',
    name: 'Cline / Continue',
    desc: 'VS Code 插件 — Anthropic 格式 + Tool Use + Streaming',
    icon: <Puzzle size={15} />,
    category: 'tools',
    formats: ['anthropic'],
  },
};

// ==================== 请求构建 ====================

function buildRequest(scenarioId, model, baseUrl, apiKey, format, channelId) {
  const isAnthropic = format === 'anthropic';
  // 渠道指定：通过 token 后缀 -channelId 传递（管理员特性）
  let effectiveApiKey = apiKey;
  if (channelId) {
    // 格式: sk-xxxxx-123 (token-channelId)
    effectiveApiKey = `${apiKey}-${channelId}`;
  }

  const headers = isAnthropic
    ? { 'Content-Type': 'application/json', 'x-api-key': effectiveApiKey, 'anthropic-version': '2023-06-01' }
    : { 'Content-Type': 'application/json', 'Authorization': `Bearer ${effectiveApiKey}` };

  const endpoint = isAnthropic ? '/v1/messages' : '/v1/chat/completions';

  switch (scenarioId) {
    case 'basic_chat':
      return {
        url: `${baseUrl}${endpoint}`,
        method: 'POST',
        headers,
        body: isAnthropic
          ? { model, max_tokens: 100, messages: [{ role: 'user', content: '请用一句话介绍你自己' }] }
          : { model, max_tokens: 100, messages: [{ role: 'user', content: '请用一句话介绍你自己' }] },
      };

    case 'function_calling':
      return {
        url: `${baseUrl}${endpoint}`,
        method: 'POST',
        headers,
        body: isAnthropic
          ? {
            model, max_tokens: 1024,
            tools: [{
              name: 'get_weather',
              description: 'Get the current weather in a given location',
              input_schema: {
                type: 'object',
                properties: {
                  location: { type: 'string', description: 'The city, e.g. Tokyo, Japan' },
                  unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
                },
                required: ['location'],
              },
            }],
            messages: [{ role: 'user', content: 'What is the weather like in Tokyo today?' }],
          }
          : {
            model, max_tokens: 500,
            tools: [{
              type: 'function',
              function: {
                name: 'get_weather',
                description: 'Get the current weather in a given location',
                parameters: {
                  type: 'object',
                  properties: {
                    location: { type: 'string', description: 'The city, e.g. Tokyo, Japan' },
                  },
                  required: ['location'],
                },
              },
            }],
            messages: [{ role: 'user', content: 'What is the weather like in Tokyo today?' }],
          },
      };

    case 'streaming':
      return {
        url: `${baseUrl}${endpoint}`,
        method: 'POST',
        headers,
        body: isAnthropic
          ? { model, max_tokens: 100, stream: true, messages: [{ role: 'user', content: 'Count from 1 to 5' }] }
          : { model, max_tokens: 100, stream: true, messages: [{ role: 'user', content: 'Count from 1 to 5' }] },
        isStream: true,
      };

    case 'claude_code':
      return {
        url: `${baseUrl}/v1/messages`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': effectiveApiKey, 'anthropic-version': '2023-06-01' },
        body: {
          model, max_tokens: 1024, stream: true,
          system: 'You are a coding assistant. Use the provided tools to help the user.',
          tools: [
            {
              name: 'execute_command',
              description: 'Execute a shell command',
              input_schema: {
                type: 'object',
                properties: { command: { type: 'string', description: 'The shell command to execute' } },
                required: ['command'],
              },
            },
            {
              name: 'read_file',
              description: 'Read the contents of a file',
              input_schema: {
                type: 'object',
                properties: { path: { type: 'string', description: 'The file path to read' } },
                required: ['path'],
              },
            },
          ],
          messages: [{ role: 'user', content: 'List the files in the current directory' }],
        },
        isStream: true,
      };

    case 'cursor':
      return {
        url: `${baseUrl}/v1/chat/completions`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${effectiveApiKey}` },
        body: {
          model, max_tokens: 500, stream: true,
          messages: [
            { role: 'system', content: 'You are a helpful coding assistant.' },
            { role: 'user', content: 'What is the weather in Tokyo?' },
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'get_weather',
              description: 'Get weather for a location',
              parameters: {
                type: 'object',
                properties: { location: { type: 'string' } },
                required: ['location'],
              },
            },
          }],
        },
        isStream: true,
      };

    case 'cline':
      return {
        url: `${baseUrl}/v1/messages`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': effectiveApiKey, 'anthropic-version': '2023-06-01' },
        body: {
          model, max_tokens: 1024, stream: true,
          system: 'You are Cline, a highly skilled software engineer.',
          tools: [
            {
              name: 'read_file',
              description: 'Read file contents at the given path',
              input_schema: {
                type: 'object',
                properties: { path: { type: 'string', description: 'File path' } },
                required: ['path'],
              },
            },
            {
              name: 'write_to_file',
              description: 'Write content to a file',
              input_schema: {
                type: 'object',
                properties: {
                  path: { type: 'string', description: 'File path' },
                  content: { type: 'string', description: 'File content' },
                },
                required: ['path', 'content'],
              },
            },
          ],
          messages: [{ role: 'user', content: 'Read the file at ./package.json' }],
        },
        isStream: true,
      };

    default:
      return null;
  }
}

function generateCurlCommand(request) {
  const headers = Object.entries(request.headers)
    .map(([k, v]) => `  -H "${k}: ${v}"`)
    .join(' \\\n');
  const body = JSON.stringify(request.body, null, 2);
  return `curl -X POST ${request.url} \\\n${headers} \\\n  -d '${body}'`;
}

// ==================== 响应分析 ====================

function analyzeResponse(scenarioId, data, isStream, streamData) {
  if (isStream && streamData) {
    return analyzeStreamResponse(scenarioId, streamData);
  }

  if (!data) return { success: false, analysis: '❌ 无响应数据' };
  if (data.error) {
    return { success: false, analysis: `❌ 错误: ${data.error.message || JSON.stringify(data.error)}` };
  }

  switch (scenarioId) {
    case 'basic_chat':
      return analyzeBasicChat(data);
    case 'function_calling':
    case 'claude_code':
    case 'cursor':
    case 'cline':
      return analyzeToolUse(data, scenarioId);
    case 'streaming':
      return { success: false, analysis: '❌ streaming 测试应该走流式处理' };
    default:
      return { success: true, analysis: '✅ 请求成功' };
  }
}

function analyzeBasicChat(data) {
  // Anthropic
  if (data.content && Array.isArray(data.content)) {
    const texts = data.content.filter(b => b.type === 'text');
    if (texts.length > 0) return { success: true, analysis: `✅ 对话正常 — 返回 ${texts.length} 个文本块` };
  }
  // OpenAI
  if (data.choices?.length > 0 && data.choices[0]?.message?.content) {
    return { success: true, analysis: '✅ 对话正常 — 模型已响应' };
  }
  return { success: false, analysis: '❌ 响应格式异常' };
}

function analyzeToolUse(data, scenarioId) {
  const toolLabel = {
    function_calling: 'Function Calling',
    claude_code: 'Claude Code 工具调用',
    cursor: 'Cursor Function Calling',
    cline: 'Cline 工具调用',
  }[scenarioId] || 'Tool Use';

  // Anthropic tool_use
  if (data.content && Array.isArray(data.content)) {
    const toolBlocks = data.content.filter(b => b.type === 'tool_use');
    if (toolBlocks.length > 0) {
      const names = toolBlocks.map(b => b.name).join(', ');
      return { success: true, analysis: `✅ ${toolLabel}正常 — 调用了: ${names}` };
    }
    const texts = data.content.filter(b => b.type === 'text');
    if (texts.length > 0) {
      return { success: false, analysis: `⚠️ 返回文本但未调用工具 — ${toolLabel}可能不被支持` };
    }
  }
  // OpenAI tool_calls
  if (data.choices?.length > 0) {
    const msg = data.choices[0]?.message;
    if (msg?.tool_calls?.length > 0) {
      const names = msg.tool_calls.map(t => t.function?.name).join(', ');
      return { success: true, analysis: `✅ ${toolLabel}正常 — 调用了: ${names}` };
    }
    if (msg?.content) {
      return { success: false, analysis: `⚠️ 返回文本但未调用工具 — ${toolLabel}可能不被支持` };
    }
  }
  return { success: false, analysis: `❌ ${toolLabel} — 响应格式异常` };
}

function analyzeStreamResponse(scenarioId, streamData) {
  const { chunks, events, hasToolUse, toolNames, textContent, error } = streamData;

  if (error) {
    return { success: false, analysis: `❌ 流式错误: ${error}` };
  }

  if (chunks === 0) {
    return { success: false, analysis: '❌ 未收到任何流式数据' };
  }

  const needsToolUse = ['function_calling', 'claude_code', 'cursor', 'cline'].includes(scenarioId);

  if (needsToolUse) {
    if (hasToolUse) {
      const names = toolNames.length > 0 ? ` — 调用了: ${toolNames.join(', ')}` : '';
      return { success: true, analysis: `✅ Streaming + Tool Use 正常 — 收到 ${chunks} 个数据块${names}` };
    }
    if (textContent) {
      return { success: false, analysis: `⚠️ Streaming 正常但未调用工具 — 收到 ${chunks} 个数据块，模型返回了文本` };
    }
    return { success: false, analysis: `❌ Streaming 异常 — 收到 ${chunks} 个数据块但无有效内容` };
  }

  // 纯 streaming 测试
  if (textContent || chunks > 2) {
    return { success: true, analysis: `✅ Streaming 正常 — 收到 ${chunks} 个数据块` };
  }
  return { success: false, analysis: `❌ Streaming 异常 — 仅收到 ${chunks} 个数据块` };
}

// ==================== 执行引擎 ====================

async function executeRequest(request) {
  if (request.isStream) {
    return executeStreamRequest(request);
  }
  const start = Date.now();
  try {
    const resp = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(request.body),
    });
    const data = await resp.json();
    return { data, duration: Date.now() - start, httpStatus: resp.status, isStream: false };
  } catch (e) {
    return { data: { error: { message: e.message } }, duration: Date.now() - start, httpStatus: 0, isStream: false };
  }
}

async function executeStreamRequest(request) {
  const start = Date.now();
  const streamData = { chunks: 0, events: [], hasToolUse: false, toolNames: [], textContent: '', error: null };

  try {
    const resp = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(request.body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      try {
        const errJson = JSON.parse(errText);
        return {
          data: errJson,
          duration: Date.now() - start,
          httpStatus: resp.status,
          isStream: true,
          streamData: { ...streamData, error: errJson?.error?.message || errText },
        };
      } catch {
        return {
          data: { error: { message: errText } },
          duration: Date.now() - start,
          httpStatus: resp.status,
          isStream: true,
          streamData: { ...streamData, error: errText },
        };
      }
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const allEvents = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const dataStr = line.slice(6).trim();
        if (dataStr === '[DONE]') continue;
        try {
          const event = JSON.parse(dataStr);
          allEvents.push(event);
          streamData.chunks++;

          // Anthropic content_block_start with tool_use
          if (event.type === 'content_block_start' && event.content_block?.type === 'tool_use') {
            streamData.hasToolUse = true;
            if (event.content_block.name) streamData.toolNames.push(event.content_block.name);
          }
          // Anthropic content_block_delta text
          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            streamData.textContent += event.delta.text || '';
          }
          // OpenAI delta tool_calls
          if (event.choices?.[0]?.delta?.tool_calls) {
            streamData.hasToolUse = true;
            for (const tc of event.choices[0].delta.tool_calls) {
              if (tc.function?.name) streamData.toolNames.push(tc.function.name);
            }
          }
          // OpenAI delta content
          if (event.choices?.[0]?.delta?.content) {
            streamData.textContent += event.choices[0].delta.content;
          }
        } catch {}
      }
    }

    streamData.events = allEvents;
    // De-dup tool names
    streamData.toolNames = [...new Set(streamData.toolNames)];

    return {
      data: { _stream: true, chunks: streamData.chunks, events_sample: allEvents.slice(0, 3), text_preview: streamData.textContent.slice(0, 200) },
      duration: Date.now() - start,
      httpStatus: resp.status,
      isStream: true,
      streamData,
    };
  } catch (e) {
    return {
      data: { error: { message: e.message } },
      duration: Date.now() - start,
      httpStatus: 0,
      isStream: true,
      streamData: { ...streamData, error: e.message },
    };
  }
}

// ==================== 结果卡片 ====================

function TestCard({ scenario, result, loading, onRun }) {
  const [showRequest, setShowRequest] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const curlCmd = result?.request ? generateCurlCommand(result.request) : '';
  const status = loading ? 'running' : result?.analysis ? (result.success ? 'pass' : 'fail') : 'idle';

  const statusConfig = {
    idle: { bg: 'bg-muted/30', border: 'border-border', icon: null },
    running: { bg: 'bg-muted/30', border: 'border-primary/30', icon: <Spin size="small" /> },
    pass: { bg: 'bg-primary/5', border: 'border-primary/30', icon: <CheckCircle2 size={16} className="text-green-600" /> },
    fail: { bg: 'bg-destructive/5', border: 'border-destructive/30', icon: <XCircle size={16} className="text-destructive" /> },
  }[status];

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text).then(() => showSuccess('已复制'));
  };

  return (
    <div className={`border ${statusConfig.border} rounded-lg overflow-hidden transition-colors`}>
      {/* 标题行 */}
      <div className={`flex items-center justify-between px-4 py-3 ${statusConfig.bg}`}>
        <div className="flex items-center gap-2.5">
          <span className="text-primary">{scenario.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{scenario.name}</span>
              {statusConfig.icon}
              {status === 'pass' && <Tag color="green" size="small">通过</Tag>}
              {status === 'fail' && !loading && <Tag color="red" size="small">失败</Tag>}
            </div>
            <span className="text-xs text-muted-foreground">{scenario.desc}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result && <span className="text-xs text-muted-foreground">{result.duration}ms</span>}
          <Button
            size="small"
            theme={status === 'idle' ? 'solid' : 'light'}
            icon={loading ? null : <Play size={12} />}
            loading={loading}
            onClick={onRun}
            style={{ height: 28 }}
          >
            {loading ? '测试中' : result ? '重测' : '测试'}
          </Button>
        </div>
      </div>

      {/* 分析结果 */}
      {result?.analysis && (
        <div className={`mx-4 mt-3 mb-1 p-2.5 rounded-md border text-sm ${
          result.success
            ? 'bg-primary/5 border-primary/20 text-primary'
            : 'bg-destructive/5 border-destructive/20 text-destructive'
        }`}>
          {result.analysis}
        </div>
      )}

      {/* 请求 & 响应折叠 */}
      {result && (
        <div className="px-4 pb-3 pt-2 space-y-1.5">
          {/* cURL */}
          <div>
            <div
              className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-muted/20 rounded px-1 transition-colors"
              onClick={() => setShowRequest(!showRequest)}
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Code2 size={12} />
                <span>请求代码 (cURL)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="text-muted-foreground hover:text-foreground p-0.5" onClick={(e) => { e.stopPropagation(); copyToClipboard(curlCmd); }}>
                  <Copy size={11} />
                </button>
                {showRequest ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </div>
            </div>
            {showRequest && (
              <pre className="bg-[#1a1a2e] text-[#e2e8f0] rounded-md p-3 text-xs overflow-x-auto leading-5 whitespace-pre-wrap break-all mt-1">
                {curlCmd}
              </pre>
            )}
          </div>

          {/* Response */}
          <div>
            <div
              className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-muted/20 rounded px-1 transition-colors"
              onClick={() => setShowResponse(!showResponse)}
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ArrowRight size={12} />
                <span>响应数据</span>
                <Tag size="small" color={result.httpStatus < 400 ? 'green' : 'red'}>{result.httpStatus || '?'}</Tag>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="text-muted-foreground hover:text-foreground p-0.5" onClick={(e) => { e.stopPropagation(); copyToClipboard(JSON.stringify(result.data, null, 2)); }}>
                  <Copy size={11} />
                </button>
                {showResponse ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </div>
            </div>
            {showResponse && (
              <pre className="bg-[#1a1a2e] text-[#e2e8f0] rounded-md p-3 text-xs overflow-x-auto leading-5 max-h-48 overflow-y-auto whitespace-pre-wrap break-all mt-1">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 汇总卡片 ====================

function SummaryCard({ results }) {
  const entries = Object.entries(results).filter(([, v]) => v?.analysis);
  if (entries.length === 0) return null;

  const passed = entries.filter(([, v]) => v.success).length;
  const failed = entries.length - passed;

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-sm">测试汇总</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-green-600 font-medium">{passed} 通过</span>
          {failed > 0 && <span className="text-destructive font-medium">{failed} 失败</span>}
          <span className="text-muted-foreground">/ {entries.length} 项</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {entries.map(([id, r]) => {
          const scenario = TEST_SCENARIOS[id];
          if (!scenario) return null;
          return (
            <div key={id} className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs ${
              r.success ? 'bg-primary/5 text-primary' : 'bg-destructive/5 text-destructive'
            }`}>
              {r.success ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              <span className="font-medium">{scenario.name}</span>
              <span className="text-muted-foreground ml-auto">{r.duration}ms</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 默认 URL ====================

function getDefaultBaseUrl() {
  return window.location.origin;
}

// ==================== 主组件 ====================

export default function Playground() {
  const { t } = useTranslation();

  // 配置
  const [baseUrl, setBaseUrl] = useState(getDefaultBaseUrl());
  const [tokenKeys, setTokenKeys] = useState([]); // [{key, name, id}]
  const [selectedToken, setSelectedToken] = useState('');
  const [allModels, setAllModels] = useState([]); // 全量模型列表
  const [selectedModel, setSelectedModel] = useState('');
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [apiFormat, setApiFormat] = useState('openai');

  // 测试状态
  const [results, setResults] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [initLoading, setInitLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 渠道选择后过滤模型
  const models = useMemo(() => {
    if (!selectedChannel || !isAdmin) return allModels;
    const ch = channels.find(c => String(c.id) === String(selectedChannel));
    if (!ch || !ch.models) return allModels;
    // 渠道的 models 字段是逗号分隔的字符串
    const channelModels = ch.models.split(',').map(m => m.trim()).filter(Boolean);
    return channelModels.length > 0 ? channelModels : allModels;
  }, [selectedChannel, channels, allModels, isAdmin]);

  // 渠道切换时，如果当前选中的模型不在新列表中，自动清空或切换
  useEffect(() => {
    if (selectedModel && models.length > 0 && !models.includes(selectedModel)) {
      setSelectedModel('');
    }
  }, [models, selectedModel]);

  // 初始化
  useEffect(() => {
    const init = async () => {
      setInitLoading(true);
      try {
        // 令牌 — 加载列表 + 真实 key
        try {
          const tokenRes = await API.get('/api/token/?p=1&size=20');
          const { success, data } = tokenRes.data;
          if (success) {
            const tokenItems = Array.isArray(data) ? data : data.items || [];
            const activeTokens = tokenItems.filter(t => t.status === 1);
            // 并行获取真实 key
            const keyResults = await Promise.allSettled(
              activeTokens.map(async (t) => {
                const res = await API.post(`/api/token/${t.id}/key`);
                const key = res.data?.data?.key;
                if (!key) return null;
                const fullKey = key.startsWith('sk-') ? key : 'sk-' + key;
                return { key: fullKey, name: t.name || `Token #${t.id}`, id: t.id };
              })
            );
            const tokens = keyResults
              .filter(r => r.status === 'fulfilled' && r.value)
              .map(r => r.value);
            setTokenKeys(tokens);
            if (tokens.length > 0) setSelectedToken(tokens[0].key);
          }
        } catch {}

        // 模型列表 — 用户可用模型（模型广场）
        try {
          const modelsRes = await API.get('/api/user/models');
          if (modelsRes.data.success && modelsRes.data.data) {
            const raw = modelsRes.data.data;
            const arr = Array.isArray(raw) ? raw : (raw.items || []);
            const modelList = arr.map(m => typeof m === 'string' ? m : m.id || m.name).filter(Boolean);
            setAllModels(modelList);
          }
        } catch {
          try {
            const res = await API.get('/api/pricing');
            if (res.data.success && res.data.data) {
              const raw = res.data.data;
              const arr = Array.isArray(raw) ? raw : (raw.items || []);
              const modelList = arr.map(m => m.model_name || m.model).filter(Boolean);
              setAllModels([...new Set(modelList)].sort());
            }
          } catch {}
        }

        // 渠道列表 (admin only — 非管理员请求会 403)
        try {
          const channelRes = await API.get('/api/channel/?p=0&page_size=200');
          if (channelRes.data.success && channelRes.data.data) {
            const channelData = channelRes.data.data;
            const list = Array.isArray(channelData) ? channelData : (channelData.items || []);
            setChannels(list);
            setIsAdmin(true);
          }
        } catch {
          // 非管理员，渠道选择不显示
        }
      } catch (e) {
        showError('初始化失败: ' + e.message);
      } finally {
        setInitLoading(false);
      }
    };
    init();
  }, []);

  // 自动检测 API 格式
  useEffect(() => {
    if (!selectedModel) return;
    const m = selectedModel.toLowerCase();
    if (m.includes('claude') || m.includes('anthropic')) {
      setApiFormat('anthropic');
    } else {
      setApiFormat('openai');
    }
  }, [selectedModel]);

  // 过滤出当前格式可用的测试
  const availableScenarios = useMemo(() => {
    return Object.values(TEST_SCENARIOS).filter(s => s.formats.includes(apiFormat));
  }, [apiFormat]);

  const basicScenarios = useMemo(() => availableScenarios.filter(s => s.category === 'basic'), [availableScenarios]);
  const toolScenarios = useMemo(() => availableScenarios.filter(s => s.category === 'tools'), [availableScenarios]);

  // 执行单个测试
  const runTest = useCallback(async (scenarioId) => {
    if (!selectedModel || !selectedToken) {
      showError('请先选择模型和令牌');
      return;
    }
    const scenario = TEST_SCENARIOS[scenarioId];
    if (!scenario) return;

    // 工具测试有固定格式
    const format = scenario.formats.length === 1 ? scenario.formats[0] : apiFormat;
    const request = buildRequest(scenarioId, selectedModel, baseUrl, selectedToken, format, selectedChannel);
    if (!request) return;

    setLoadingMap(prev => ({ ...prev, [scenarioId]: true }));
    setResults(prev => ({ ...prev, [scenarioId]: null }));

    try {
      const resp = await executeRequest(request);
      const analysis = analyzeResponse(scenarioId, resp.data, resp.isStream, resp.streamData);
      setResults(prev => ({
        ...prev,
        [scenarioId]: { ...resp, ...analysis, request },
      }));
    } finally {
      setLoadingMap(prev => ({ ...prev, [scenarioId]: false }));
    }
  }, [selectedModel, selectedToken, baseUrl, apiFormat, selectedChannel]);

  // 批量测试
  const runAllBasic = useCallback(() => {
    basicScenarios.forEach(s => runTest(s.id));
  }, [basicScenarios, runTest]);

  const runAllTools = useCallback(() => {
    toolScenarios.forEach(s => runTest(s.id));
  }, [toolScenarios, runTest]);

  const runAll = useCallback(() => {
    availableScenarios.forEach(s => runTest(s.id));
  }, [availableScenarios, runTest]);

  const resetAll = useCallback(() => {
    setResults({});
    setLoadingMap({});
  }, []);

  const isAnyLoading = Object.values(loadingMap).some(Boolean);

  if (initLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-[60px] px-2 pb-8 space-y-5">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical size={24} className="text-primary" />
          <div>
            <h1 className="text-lg font-semibold">功能测试</h1>
            <p className="text-xs text-muted-foreground">检测模型 API 兼容性 — 基础对话、Tool Use、Streaming 及主流工具支持</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="small" theme="borderless" icon={<RotateCcw size={14} />} onClick={resetAll} disabled={isAnyLoading}>
            重置
          </Button>
          <Button size="small" theme="solid" icon={<Play size={14} />} onClick={runAll} loading={isAnyLoading} disabled={!selectedModel || !selectedToken}>
            全部测试
          </Button>
        </div>
      </div>

      {/* 配置区 */}
      <div className="border border-border rounded-lg p-4 bg-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">API 地址</label>
            <Select size="small" style={{ width: '100%' }} value={baseUrl} onChange={setBaseUrl} filter allowCreate>
              <Select.Option value={getDefaultBaseUrl()}>{getDefaultBaseUrl()}</Select.Option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">令牌 (API Key)</label>
            <Select size="small" style={{ width: '100%' }} value={selectedToken} onChange={setSelectedToken} placeholder="选择令牌" filter>
              {tokenKeys.map((t, i) => (
                <Select.Option key={i} value={t.key}>
                  {t.name}{' '}
                  <span className="text-muted-foreground">
                    ({t.key.length > 16 ? `${t.key.substring(0, 6)}...${t.key.substring(t.key.length - 4)}` : t.key})
                  </span>
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
        <div className={`grid gap-3 ${isAdmin ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">模型</label>
            <Select size="small" style={{ width: '100%' }} value={selectedModel} onChange={setSelectedModel} placeholder="选择模型" filter showClear>
              {models.map(m => <Select.Option key={m} value={m}>{m}</Select.Option>)}
            </Select>
          </div>
          {isAdmin && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                <span className="flex items-center gap-1"><Server size={11} />指定渠道 <Tag size="small" color="blue">管理员</Tag></span>
              </label>
              <Select
                size="small"
                style={{ width: '100%' }}
                value={selectedChannel}
                onChange={(v) => { setSelectedChannel(v); setResults({}); }}
                placeholder="不指定（自动路由）"
                filter
                showClear
              >
                {channels.map(ch => (
                  <Select.Option key={ch.id} value={String(ch.id)}>
                    #{ch.id} {ch.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">API 格式</label>
            <Select size="small" style={{ width: '100%' }} value={apiFormat} onChange={(v) => { setApiFormat(v); setResults({}); }}>
              <Select.Option value="openai">OpenAI (Chat Completions)</Select.Option>
              <Select.Option value="anthropic">Anthropic (Messages)</Select.Option>
            </Select>
          </div>
        </div>
      </div>

      {/* 汇总 */}
      <SummaryCard results={results} />

      {/* 基础测试 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">基础功能</span>
            <span className="text-xs text-muted-foreground">— 对话、工具调用、流式输出</span>
          </div>
          <Button size="small" theme="light" onClick={runAllBasic} disabled={!selectedModel || !selectedToken || isAnyLoading}>
            测试全部
          </Button>
        </div>
        <div className="space-y-3">
          {basicScenarios.map(s => (
            <TestCard
              key={s.id}
              scenario={s}
              result={results[s.id]}
              loading={loadingMap[s.id]}
              onRun={() => runTest(s.id)}
            />
          ))}
        </div>
      </div>

      {/* 工具兼容性测试 */}
      {toolScenarios.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">工具兼容性</span>
              <span className="text-xs text-muted-foreground">— 模拟真实工具请求格式</span>
            </div>
            <Button size="small" theme="light" onClick={runAllTools} disabled={!selectedModel || !selectedToken || isAnyLoading}>
              测试全部
            </Button>
          </div>
          <div className="space-y-3">
            {toolScenarios.map(s => (
              <TestCard
                key={s.id}
                scenario={s}
                result={results[s.id]}
                loading={loadingMap[s.id]}
                onRun={() => runTest(s.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 说明 */}
      <div className="border border-border rounded-lg p-4 bg-muted/20 text-xs text-muted-foreground space-y-2">
        <p className="font-medium text-foreground text-xs">测试说明</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>基础对话</strong>：标准聊天请求，验证模型可用性</li>
          <li><strong>Function Calling</strong>：发送 tools 参数，验证模型能否返回 tool_use / tool_calls</li>
          <li><strong>Streaming</strong>：开启 stream=true，验证 SSE 流式响应</li>
          <li><strong>Claude Code</strong>：模拟 Anthropic CLI 场景 — system prompt + 多工具 + 流式</li>
          <li><strong>Cursor</strong>：模拟 AI 编辑器 — OpenAI 格式 + function calling + 流式</li>
          <li><strong>Cline / Continue</strong>：模拟 VS Code 插件 — Anthropic 格式 + 文件操作工具 + 流式</li>
          <li>所有测试消耗少量额度，请求代码可一键复制用于本地验证</li>
          {isAdmin && <li><strong>指定渠道</strong>（管理员）：通过令牌后缀指定特定渠道 ID 进行测试</li>}
        </ul>
      </div>
    </div>
  );
}
