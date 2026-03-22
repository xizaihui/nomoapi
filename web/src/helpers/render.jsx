/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import i18next from 'i18next';
import { Modal, Tag, Typography, Avatar } from '@douyinfe/semi-ui';
import { copy, showSuccess } from './utils';
import { MOBILE_BREAKPOINT } from '../hooks/common/useIsMobile';
import { visit } from 'unist-util-visit';

import {
  LayoutDashboard,
  TerminalSquare,
  MessageSquare,
  Key,
  BarChart3,
  Image as ImageIcon,
  CheckSquare,
  CreditCard,
  Layers,
  Gift,
  User,
  Settings,
  CircleUser,
  Package,
  Server,
  CalendarClock,
  FileSearch,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import {
  SiAtlassian,
  SiAuth0,
  SiAuthentik,
  SiBitbucket,
  SiDiscord,
  SiDropbox,
  SiFacebook,
  SiGitea,
  SiGithub,
  SiGitlab,
  SiGoogle,
  SiKeycloak,
  SiLinkedin,
  SiNextcloud,
  SiNotion,
  SiOkta,
  SiOpenid,
  SiReddit,
  SiSlack,
  SiTelegram,
  SiTwitch,
  SiWechat,
  SiX,
} from 'react-icons/si';

// 获取侧边栏Lucide图标组件
export function getLucideIcon(key, selected = false) {
  const size = 16;
  const strokeWidth = 2;
  const SELECTED_COLOR = 'hsl(var(--primary))';
  const iconColor = selected ? SELECTED_COLOR : 'currentColor';
  const commonProps = {
    size,
    strokeWidth,
    className: `transition-colors duration-200 ${selected ? 'transition-transform duration-200 scale-105' : ''}`,
  };

  // 根据不同的key返回不同的图标
  switch (key) {
    case 'detail':
      return <LayoutDashboard {...commonProps} color={iconColor} />;
    case 'chat':
      return <MessageSquare {...commonProps} color={iconColor} />;
    case 'token':
      return <Key {...commonProps} color={iconColor} />;
    case 'log':
      return <BarChart3 {...commonProps} color={iconColor} />;
    case 'midjourney':
      return <ImageIcon {...commonProps} color={iconColor} />;
    case 'task':
      return <CheckSquare {...commonProps} color={iconColor} />;
    case 'topup':
      return <CreditCard {...commonProps} color={iconColor} />;
    case 'channel':
      return <Layers {...commonProps} color={iconColor} />;
    case 'redemption':
      return <Gift {...commonProps} color={iconColor} />;
    case 'user':
    case 'personal':
      return <User {...commonProps} color={iconColor} />;
    case 'models':
      return <Package {...commonProps} color={iconColor} />;
    case 'deployment':
      return <Server {...commonProps} color={iconColor} />;
    case 'subscription':
      return <CalendarClock {...commonProps} color={iconColor} />;
    case 'setting':
      return <Settings {...commonProps} color={iconColor} />;
    case 'audit-logs':
      return <FileSearch {...commonProps} color={iconColor} />;
    case 'audit-rules':
      return <ShieldCheck {...commonProps} color={iconColor} />;
    case 'audit-retention':
      return <Timer {...commonProps} color={iconColor} />;
    default:
      return <CircleUser {...commonProps} color={iconColor} />;
  }
}

// 获取模型分类


/**
 * 根据渠道类型返回对应的厂商图标
 * @param {number} channelType - 渠道类型值
 * @returns {JSX.Element|null} - 对应的厂商图标组件
 */


// Re-export for backward compatibility via barrel (lazy).


const oauthProviderIconMap = {
  github: SiGithub,
  gitlab: SiGitlab,
  gitea: SiGitea,
  google: SiGoogle,
  discord: SiDiscord,
  facebook: SiFacebook,
  linkedin: SiLinkedin,
  x: SiX,
  twitter: SiX,
  slack: SiSlack,
  telegram: SiTelegram,
  wechat: SiWechat,
  keycloak: SiKeycloak,
  nextcloud: SiNextcloud,
  authentik: SiAuthentik,
  openid: SiOpenid,
  okta: SiOkta,
  auth0: SiAuth0,
  atlassian: SiAtlassian,
  bitbucket: SiBitbucket,
  notion: SiNotion,
  twitch: SiTwitch,
  reddit: SiReddit,
  dropbox: SiDropbox,
};

function isHttpUrl(value) {
  return /^https?:\/\//i.test(value || '');
}

function isSimpleEmoji(value) {
  if (!value) return false;
  const trimmed = String(value).trim();
  return trimmed.length > 0 && trimmed.length <= 4 && !isHttpUrl(trimmed);
}

function normalizeOAuthIconKey(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^ri:/, '')
    .replace(/^react-icons:/, '')
    .replace(/^si:/, '');
}

/**
 * Render custom OAuth provider icon with react-icons or URL/emoji fallback.
 * Supported formats:
 * - react-icons simple key: github / gitlab / google / keycloak
 * - prefixed key: ri:github / si:github
 * - full URL image: https://example.com/logo.png
 * - emoji: 🐱
 */
export function getOAuthProviderIcon(iconName, size = 20) {
  const raw = String(iconName || '').trim();
  const iconSize = Number(size) > 0 ? Number(size) : 20;

  if (!raw) {
    return <Layers size={iconSize} color='hsl(var(--muted-foreground))' />;
  }

  if (isHttpUrl(raw)) {
    return (
      <img
        src={raw}
        alt='provider icon'
        width={iconSize}
        height={iconSize}
        style={{ borderRadius: 4, objectFit: 'cover' }}
      />
    );
  }

  if (isSimpleEmoji(raw)) {
    return (
      <span
        style={{
          width: iconSize,
          height: iconSize,
          lineHeight: `${iconSize}px`,
          textAlign: 'center',
          display: 'inline-block',
          fontSize: Math.max(Math.floor(iconSize * 0.8), 14),
        }}
      >
        {raw}
      </span>
    );
  }

  const key = normalizeOAuthIconKey(raw);
  const IconComp = oauthProviderIconMap[key];
  if (IconComp) {
    return <IconComp size={iconSize} />;
  }

  return <Avatar size='extra-extra-small'>{raw.charAt(0).toUpperCase()}</Avatar>;
}

// 颜色列表
const colors = [
  'amber',
  'blue',
  'cyan',
  'green',
  'grey',
  'indigo',
  'light-blue',
  'lime',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'violet',
  'yellow',
];

// 基础10色色板 (N ≤ 10)
const baseColors = [
  '#2b2b3b', '#3d3d55', '#52526b', '#6e6e80', '#8e8ea0',
  '#7a7a95', '#a3a3b8', '#b5b5c8', '#c5c5d2', '#5a5a78',
];

// 扩展20色色板 (10 < N ≤ 20)
const extendedColors = [
  '#1e1e30',
  '#d8d8e5',
  '#3d3d55',
  '#c5c5d2',
  '#6e6e80',
  '#b5b5c8',
  '#52526b',
  '#a3a3b8',
  '#2b2b3b',
  '#8e8ea0',
  '#5a5a78',
  '#eaeaf2',
  '#7a7a95',
  '#d0d0e0',
  '#35355a',
  '#8585a0',
  '#4a4a65',
  '#b8b8cc',
  '#65658a',
  '#e0e0ec',
];

// 模型颜色映射
export const modelColorMap = {
  'dall-e': '#65658a',
  'dall-e-3': '#52526b',
  'gpt-3.5-turbo': '#8e8ea0',
  'gpt-3.5-turbo-0613': '#7a7a95',
  'gpt-3.5-turbo-1106': '#8585a0',
  'gpt-3.5-turbo-16k': '#a3a3b8',
  'gpt-3.5-turbo-16k-0613': '#b5b5c8',
  'gpt-3.5-turbo-instruct': '#c5c5d2',
  'gpt-4': '#3d3d55',
  'gpt-4-0613': '#4a4a65',
  'gpt-4-1106-preview': '#35355a',
  'gpt-4-0125-preview': '#2b2b3b',
  'gpt-4-turbo-preview': '#30304a',
  'gpt-4-32k': '#5a5a78',
  'gpt-4-32k-0613': '#52526b',
  'gpt-4-all': '#1e1e30',
  'gpt-4-gizmo-*': '#20203a',
  'gpt-4-vision-preview': '#15152a',
  'text-ada-001': '#d8d8e5',
  'text-babbage-001': '#d0d0e0',
  'text-curie-001': '#b8b8cc',
  'text-davinci-003': '#a3a3b8',
  'text-davinci-edit-001': '#8e8ea0',
  'text-embedding-ada-002': '#e0e0ec',
  'text-embedding-v1': '#eaeaf2',
  'text-moderation-latest': '#c5c5d2',
  'text-moderation-stable': '#b5b5c8',
  'tts-1': '#6e6e80',
  'tts-1-1106': '#75758a',
  'tts-1-hd': '#7a7a95',
  'tts-1-hd-1106': '#8585a0',
  'whisper-1': '#ededf5',
  'claude-3-opus-20240229': '#2b2b3b',
  'claude-3-sonnet-20240229': '#52526b',
  'claude-3-haiku-20240307': '#7a7a95',
};

export function modelToColor(modelName) {
  // 1. 如果模型在预定义的 modelColorMap 中，使用预定义颜色
  if (modelColorMap[modelName]) {
    return modelColorMap[modelName];
  }

  // 2. 生成一个稳定的数字作为索引
  let hash = 0;
  for (let i = 0; i < modelName.length; i++) {
    hash = (hash << 5) - hash + modelName.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  hash = Math.abs(hash);

  // 3. 根据模型名称长度选择不同的色板
  const colorPalette = modelName.length > 10 ? extendedColors : baseColors;

  // 4. 使用hash值选择颜色
  const index = hash % colorPalette.length;
  return colorPalette[index];
}

export function stringToColor(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  let i = sum % colors.length;
  return colors[i];
}


export function renderText(text, limit) {
  if (text.length > limit) {
    return text.slice(0, limit - 3) + '...';
  }
  return text;
}

/**
 * Render group tags based on the input group string
 * @param {string} group - The input group string
 * @returns {JSX.Element} - The rendered group tags
 */
export function renderGroup(group) {
  if (group === '') {
    return (
      <Tag key='default' color='white' shape='circle'>
        {i18next.t('用户分组')}
      </Tag>
    );
  }

  const tagColors = {
    vip: 'yellow',
    pro: 'yellow',
    svip: 'red',
    premium: 'red',
  };

  const groups = group.split(',').sort();

  return (
    <span key={group}>
      {groups.map((group) => (
        <Tag
          color={tagColors[group] || stringToColor(group)}
          key={group}
          shape='circle'
          onClick={async (event) => {
            event.stopPropagation();
            if (await copy(group)) {
              showSuccess(i18next.t('已复制：') + group);
            } else {
              Modal.error({
                title: i18next.t('无法复制到剪贴板，请手动复制'),
                content: group,
              });
            }
          }}
        >
          {group}
        </Tag>
      ))}
    </span>
  );
}

export function renderRatio(ratio) {
  let color = 'green';
  if (ratio > 5) {
    color = 'red';
  } else if (ratio > 3) {
    color = 'orange';
  } else if (ratio > 1) {
    color = 'blue';
  }
  return (
    <Tag color={color}>
      {ratio}x {i18next.t('倍率')}
    </Tag>
  );
}

const measureTextWidth = (
  text,
  style = {
    fontSize: '14px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  containerWidth,
) => {
  const span = document.createElement('span');

  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'nowrap';
  span.style.fontSize = style.fontSize;
  span.style.fontFamily = style.fontFamily;

  span.textContent = text;

  document.body.appendChild(span);
  const width = span.offsetWidth;

  document.body.removeChild(span);

  return width;
};

export function truncateText(text, maxWidth = 200) {
  const isMobileScreen = window.matchMedia(
    `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
  ).matches;
  if (!isMobileScreen) {
    return text;
  }
  if (!text) return text;

  try {
    // Handle percentage-based maxWidth
    let actualMaxWidth = maxWidth;
    if (typeof maxWidth === 'string' && maxWidth.endsWith('%')) {
      const percentage = parseFloat(maxWidth) / 100;
      // Use window width as fallback container width
      actualMaxWidth = window.innerWidth * percentage;
    }

    const width = measureTextWidth(text);
    if (width <= actualMaxWidth) return text;

    let left = 0;
    let right = text.length;
    let result = text;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const truncated = text.slice(0, mid) + '...';
      const currentWidth = measureTextWidth(truncated);

      if (currentWidth <= actualMaxWidth) {
        result = truncated;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result;
  } catch (error) {
    console.warn(
      'Text measurement failed, falling back to character count',
      error,
    );
    if (text.length > 20) {
      return text.slice(0, 17) + '...';
    }
    return text;
  }
}

export const renderGroupOption = (item) => {
  const {
    disabled,
    selected,
    label,
    value,
    focused,
    className,
    style,
    onMouseEnter,
    onClick,
    empty,
    emptyContent,
    ...rest
  } = item;

  const baseStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: focused ? 'hsl(var(--muted))' : 'transparent',
    opacity: disabled ? 0.5 : 1,
    ...(selected && {
      backgroundColor: 'hsl(var(--primary) / 0.1)',
    }),
    '&:hover': {
      backgroundColor: !disabled && 'hsl(var(--secondary))',
    },
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleMouseEnter = (e) => {
    if (!disabled && onMouseEnter) {
      onMouseEnter(e);
    }
  };

  return (
    <div
      style={baseStyle}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Typography.Text strong type={disabled ? 'tertiary' : undefined}>
          {value}
        </Typography.Text>
        <Typography.Text type='secondary' size='small'>
          {label}
        </Typography.Text>
      </div>
      {item.ratio && renderRatio(item.ratio)}
    </div>
  );
};

export function renderNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 10000) {
    return (num / 1000).toFixed(1) + 'k';
  } else {
    return num;
  }
}

export function renderQuotaNumberWithDigit(num, digits = 2) {
  if (typeof num !== 'number' || isNaN(num)) {
    return 0;
  }
  const quotaDisplayType = localStorage.getItem('quota_display_type') || 'USD';
  num = num.toFixed(digits);
  if (quotaDisplayType === 'CNY') {
    return '¥' + num;
  } else if (quotaDisplayType === 'USD') {
    return '$' + num;
  } else if (quotaDisplayType === 'CUSTOM') {
    const statusStr = localStorage.getItem('status');
    let symbol = '¤';
    try {
      if (statusStr) {
        const s = JSON.parse(statusStr);
        symbol = s?.custom_currency_symbol || symbol;
      }
    } catch (e) {}
    return symbol + num;
  } else {
    return num;
  }
}

export function renderNumberWithPoint(num) {
  if (num === undefined) return '';
  num = num.toFixed(2);
  if (num >= 100000) {
    // Convert number to string to manipulate it
    let numStr = num.toString();
    // Find the position of the decimal point
    let decimalPointIndex = numStr.indexOf('.');

    let wholePart = numStr;
    let decimalPart = '';

    // If there is a decimal point, split the number into whole and decimal parts
    if (decimalPointIndex !== -1) {
      wholePart = numStr.slice(0, decimalPointIndex);
      decimalPart = numStr.slice(decimalPointIndex);
    }

    // Take the first two and last two digits of the whole number part
    let shortenedWholePart = wholePart.slice(0, 2) + '..' + wholePart.slice(-2);

    // Return the formatted number
    return shortenedWholePart + decimalPart;
  }

  // If the number is less than 100,000, return it unmodified
  return num;
}

export function getQuotaPerUnit() {
  let quotaPerUnit = localStorage.getItem('quota_per_unit');
  quotaPerUnit = parseFloat(quotaPerUnit);
  return quotaPerUnit;
}

export function renderUnitWithQuota(quota) {
  let quotaPerUnit = localStorage.getItem('quota_per_unit');
  quotaPerUnit = parseFloat(quotaPerUnit);
  quota = parseFloat(quota);
  return quotaPerUnit * quota;
}

export function getQuotaWithUnit(quota, digits = 6) {
  let quotaPerUnit = localStorage.getItem('quota_per_unit');
  quotaPerUnit = parseFloat(quotaPerUnit);
  return (quota / quotaPerUnit).toFixed(digits);
}

export function renderQuotaWithAmount(amount) {
  const quotaDisplayType = localStorage.getItem('quota_display_type') || 'USD';
  if (quotaDisplayType === 'TOKENS') {
    return renderNumber(renderUnitWithQuota(amount));
  }
  if (quotaDisplayType === 'CNY') {
    return '¥' + amount;
  } else if (quotaDisplayType === 'CUSTOM') {
    const statusStr = localStorage.getItem('status');
    let symbol = '¤';
    try {
      if (statusStr) {
        const s = JSON.parse(statusStr);
        symbol = s?.custom_currency_symbol || symbol;
      }
    } catch (e) {}
    return symbol + amount;
  }
  return '$' + amount;
}

/**
 * 获取当前货币配置信息
 * @returns {Object} - { symbol, rate, type }
 */
export function getCurrencyConfig() {
  const quotaDisplayType = localStorage.getItem('quota_display_type') || 'USD';
  const statusStr = localStorage.getItem('status');

  let symbol = '$';
  let rate = 1;

  if (quotaDisplayType === 'CNY') {
    symbol = '¥';
    try {
      if (statusStr) {
        const s = JSON.parse(statusStr);
        rate = s?.usd_exchange_rate || 7;
      }
    } catch (e) {}
  } else if (quotaDisplayType === 'CUSTOM') {
    try {
      if (statusStr) {
        const s = JSON.parse(statusStr);
        symbol = s?.custom_currency_symbol || '¤';
        rate = s?.custom_currency_exchange_rate || 1;
      }
    } catch (e) {}
  }

  return { symbol, rate, type: quotaDisplayType };
}

/**
 * 将美元金额转换为当前选择的货币
 * @param {number} usdAmount - 美元金额
 * @param {number} digits - 小数位数
 * @returns {string} - 格式化后的货币字符串
 */
export function convertUSDToCurrency(usdAmount, digits = 2) {
  const { symbol, rate } = getCurrencyConfig();
  const convertedAmount = usdAmount * rate;
  return symbol + convertedAmount.toFixed(digits);
}

export function renderQuota(quota, digits = 2) {
  let quotaPerUnit = localStorage.getItem('quota_per_unit');
  const quotaDisplayType = localStorage.getItem('quota_display_type') || 'USD';
  quotaPerUnit = parseFloat(quotaPerUnit);
  if (quotaDisplayType === 'TOKENS') {
    return renderNumber(quota);
  }
  const resultUSD = quota / quotaPerUnit;
  let symbol = '$';
  let value = resultUSD;
  if (quotaDisplayType === 'CNY') {
    const statusStr = localStorage.getItem('status');
    let usdRate = 1;
    try {
      if (statusStr) {
        const s = JSON.parse(statusStr);
        usdRate = s?.usd_exchange_rate || 1;
      }
    } catch (e) {}
    value = resultUSD * usdRate;
    symbol = '¥';
  } else if (quotaDisplayType === 'CUSTOM') {
    const statusStr = localStorage.getItem('status');
    let symbolCustom = '¤';
    let rate = 1;
    try {
      if (statusStr) {
        const s = JSON.parse(statusStr);
        symbolCustom = s?.custom_currency_symbol || symbolCustom;
        rate = s?.custom_currency_exchange_rate || rate;
      }
    } catch (e) {}
    value = resultUSD * rate;
    symbol = symbolCustom;
  }
  const fixedResult = value.toFixed(digits);
  if (parseFloat(fixedResult) === 0 && quota > 0 && value > 0) {
    const minValue = Math.pow(10, -digits);
    return symbol + minValue.toFixed(digits);
  }
  return symbol + fixedResult;
}

function isValidGroupRatio(ratio) {
  return Number.isFinite(ratio) && ratio !== -1;
}

/**
 * Helper function to get effective ratio and label
 * @param {number} groupRatio - The default group ratio
 * @param {number} user_group_ratio - The user-specific group ratio
 * @returns {Object} - Object containing { ratio, label, useUserGroupRatio }
 */
function getEffectiveRatio(groupRatio, user_group_ratio) {
  const useUserGroupRatio = isValidGroupRatio(user_group_ratio);
  const ratioLabel = useUserGroupRatio
    ? i18next.t('专属倍率')
    : i18next.t('分组倍率');
  const effectiveRatio = useUserGroupRatio ? user_group_ratio : groupRatio;

  return {
    ratio: effectiveRatio,
    label: ratioLabel,
    useUserGroupRatio: useUserGroupRatio,
  };
}

function getQuotaDisplayType() {
  return localStorage.getItem('quota_display_type') || 'USD';
}

function resolveBillingDisplayMode(displayMode, modelPrice = -1) {
  if (modelPrice !== -1) {
    return 'price';
  }
  if (getQuotaDisplayType() === 'TOKENS') {
    return 'ratio';
  }
  return displayMode === 'ratio' ? 'ratio' : 'price';
}

function isPriceDisplayMode(displayMode, modelPrice = -1) {
  return resolveBillingDisplayMode(displayMode, modelPrice) === 'price';
}

function shouldUseRatioBillingProcess(modelPrice = -1) {
  return modelPrice === -1 && getQuotaDisplayType() === 'TOKENS';
}

function formatCompactDisplayPrice(usdAmount, digits = 6) {
  const { symbol, rate } = getCurrencyConfig();
  const amount = Number((usdAmount * rate).toFixed(digits));
  return `${symbol}${amount}`;
}

function appendPricePart(parts, condition, key, vars) {
  if (!condition) {
    return;
  }
  parts.push(i18next.t(key, vars));
}

function joinBillingSummary(parts) {
  return parts.filter(Boolean).join('，');
}

function getGroupRatioText(groupRatio, user_group_ratio) {
  const { ratio, label } = getEffectiveRatio(groupRatio, user_group_ratio);
  return i18next.t('{{ratioType}} {{ratio}}', {
    ratioType: label,
    ratio,
  });
}

function formatRatioValue(value, digits = 6) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return 0;
  }
  return Number(num.toFixed(digits));
}

function renderDisplayAmountFromUsd(usdAmount, digits = 6) {
  return renderQuotaWithAmount(Number(Number(usdAmount || 0).toFixed(digits)));
}

// Shared core for simple price rendering (used by OpenAI-like and Claude-like variants)
function renderPriceSimpleCore({
  modelRatio,
  modelPrice = -1,
  groupRatio,
  user_group_ratio,
  cacheTokens = 0,
  cacheRatio = 1.0,
  cacheCreationTokens = 0,
  cacheCreationRatio = 1.0,
  cacheCreationTokens5m = 0,
  cacheCreationRatio5m = 1.0,
  cacheCreationTokens1h = 0,
  cacheCreationRatio1h = 1.0,
  image = false,
  imageRatio = 1.0,
  isSystemPromptOverride = false,
  displayMode = 'price',
}) {
  const { ratio: effectiveGroupRatio, label: ratioLabel } = getEffectiveRatio(
    groupRatio,
    user_group_ratio,
  );
  const finalGroupRatio = effectiveGroupRatio;

  const { symbol, rate } = getCurrencyConfig();
  if (modelPrice !== -1) {
    if (isPriceDisplayMode(displayMode, modelPrice)) {
      return joinBillingSummary([
        i18next.t('模型价格：{{symbol}}{{price}} / 次', {
          symbol: symbol,
          price: (modelPrice * rate).toFixed(6),
        }),
        getGroupRatioText(groupRatio, user_group_ratio),
      ]);
    }
    const displayPrice = (modelPrice * rate).toFixed(6);
    return i18next.t('价格：{{symbol}}{{price}} * {{ratioType}}：{{ratio}}', {
      symbol: symbol,
      price: displayPrice,
      ratioType: ratioLabel,
      ratio: finalGroupRatio,
    });
  }

  const hasSplitCacheCreation =
    cacheCreationTokens5m > 0 || cacheCreationTokens1h > 0;

  const shouldShowLegacyCacheCreation =
    !hasSplitCacheCreation && cacheCreationTokens !== 0;

  const shouldShowCache = cacheTokens !== 0;
  const shouldShowCacheCreation5m =
    hasSplitCacheCreation && cacheCreationTokens5m > 0;
  const shouldShowCacheCreation1h =
    hasSplitCacheCreation && cacheCreationTokens1h > 0;

  if (isPriceDisplayMode(displayMode, modelPrice)) {
    const parts = [];
    if (modelPrice !== -1) {
      parts.push(
        i18next.t('按次 {{price}} / 次', {
          price: formatCompactDisplayPrice(modelPrice),
        }),
      );
      parts.push(getGroupRatioText(groupRatio, user_group_ratio));
      return joinBillingSummary(parts);
    }

    parts.push(
      i18next.t('输入 {{price}} / 1M tokens', {
        price: formatCompactDisplayPrice(modelRatio * 2.0),
      }),
    );

    if (shouldShowCache) {
      parts.push(
        i18next.t('缓存读取 {{price}}', {
          price: formatCompactDisplayPrice(modelRatio * 2.0 * cacheRatio),
        }),
      );
    }

    if (hasSplitCacheCreation && shouldShowCacheCreation5m) {
      parts.push(
        i18next.t('5m缓存创建 {{price}}', {
          price: formatCompactDisplayPrice(modelRatio * 2.0 * cacheCreationRatio5m),
        }),
      );
    }
    if (hasSplitCacheCreation && shouldShowCacheCreation1h) {
      parts.push(
        i18next.t('1h缓存创建 {{price}}', {
          price: formatCompactDisplayPrice(modelRatio * 2.0 * cacheCreationRatio1h),
        }),
      );
    }
    if (!hasSplitCacheCreation && shouldShowLegacyCacheCreation) {
      parts.push(
        i18next.t('缓存创建 {{price}}', {
          price: formatCompactDisplayPrice(modelRatio * 2.0 * cacheCreationRatio),
        }),
      );
    }

    if (image) {
      parts.push(
        i18next.t('图片输入 {{price}}', {
          price: formatCompactDisplayPrice(modelRatio * 2.0 * imageRatio),
        }),
      );
    }

    parts.push(getGroupRatioText(groupRatio, user_group_ratio));

    let result = joinBillingSummary(parts);
    if (isSystemPromptOverride) {
      result += '\n\r' + i18next.t('系统提示覆盖');
    }
    return result;
  }

  const parts = [];
  // base: model ratio
  parts.push(i18next.t('模型: {{ratio}}'));

  // cache part (label differs when with image)
  if (shouldShowCache) {
    parts.push(i18next.t('缓存: {{cacheRatio}}'));
  }

  if (hasSplitCacheCreation) {
    if (shouldShowCacheCreation5m && shouldShowCacheCreation1h) {
      parts.push(
        i18next.t(
          '缓存创建: 5m {{cacheCreationRatio5m}} / 1h {{cacheCreationRatio1h}}',
        ),
      );
    } else if (shouldShowCacheCreation5m) {
      parts.push(i18next.t('缓存创建: 5m {{cacheCreationRatio5m}}'));
    } else if (shouldShowCacheCreation1h) {
      parts.push(i18next.t('缓存创建: 1h {{cacheCreationRatio1h}}'));
    }
  } else if (shouldShowLegacyCacheCreation) {
    parts.push(i18next.t('缓存创建: {{cacheCreationRatio}}'));
  }

  // image part
  if (image) {
    parts.push(i18next.t('图片输入: {{imageRatio}}'));
  }

  parts.push(`{{ratioType}}: {{groupRatio}}`);

  let result = i18next.t(parts.join(' * '), {
    ratio: modelRatio,
    ratioType: ratioLabel,
    groupRatio: finalGroupRatio,
    cacheRatio: cacheRatio,
    cacheCreationRatio: cacheCreationRatio,
    cacheCreationRatio5m: cacheCreationRatio5m,
    cacheCreationRatio1h: cacheCreationRatio1h,
    imageRatio: imageRatio,
  });

  if (isSystemPromptOverride) {
    result += '\n\r' + i18next.t('系统提示覆盖');
  }

  return result;
}

export function renderModelPrice(
  inputTokens,
  completionTokens,
  modelRatio,
  modelPrice = -1,
  completionRatio,
  groupRatio,
  user_group_ratio,
  cacheTokens = 0,
  cacheRatio = 1.0,
  image = false,
  imageRatio = 1.0,
  imageOutputTokens = 0,
  webSearch = false,
  webSearchCallCount = 0,
  webSearchPrice = 0,
  fileSearch = false,
  fileSearchCallCount = 0,
  fileSearchPrice = 0,
  audioInputSeperatePrice = false,
  audioInputTokens = 0,
  audioInputPrice = 0,
  imageGenerationCall = false,
  imageGenerationCallPrice = 0,
  displayMode = 'price',
) {
  const { ratio: effectiveGroupRatio, label: ratioLabel } = getEffectiveRatio(
    groupRatio,
    user_group_ratio,
  );
  groupRatio = effectiveGroupRatio;

  const { symbol, rate } = getCurrencyConfig();

  if (!shouldUseRatioBillingProcess(modelPrice)) {
    if (modelPrice !== -1) {
      return (
        <>
          <article>
            <p>
              {i18next.t('模型价格：{{symbol}}{{price}} / 次', {
                symbol,
                price: (modelPrice * rate).toFixed(6),
              })}
            </p>
            <p>
              {i18next.t(
                '模型价格 {{symbol}}{{price}} / 次 * {{ratioType}} {{ratio}} = {{symbol}}{{total}}',
                {
                  symbol,
                  price: (modelPrice * rate).toFixed(6),
                  ratioType: ratioLabel,
                  ratio: groupRatio,
                  total: (modelPrice * groupRatio * rate).toFixed(6),
                },
              )}
            </p>
            <p>{i18next.t('仅供参考，以实际扣费为准')}</p>
          </article>
        </>
      );
    }

    if (completionRatio === undefined) {
      completionRatio = 0;
    }
    const inputRatioPrice = modelRatio * 2.0;
    const completionRatioPrice = modelRatio * 2.0 * completionRatio;
    const cacheRatioPrice = modelRatio * 2.0 * cacheRatio;
    const imageRatioPrice = modelRatio * 2.0 * imageRatio;
    let effectiveInputTokens =
      inputTokens - cacheTokens + cacheTokens * cacheRatio;
    if (image && imageOutputTokens > 0) {
      effectiveInputTokens =
        inputTokens - imageOutputTokens + imageOutputTokens * imageRatio;
    }
    if (audioInputTokens > 0) {
      effectiveInputTokens -= audioInputTokens;
    }
    const price =
      (effectiveInputTokens / 1000000) * inputRatioPrice * groupRatio +
      (audioInputTokens / 1000000) * audioInputPrice * groupRatio +
      (completionTokens / 1000000) * completionRatioPrice * groupRatio +
      (webSearchCallCount / 1000) * webSearchPrice * groupRatio +
      (fileSearchCallCount / 1000) * fileSearchPrice * groupRatio +
      imageGenerationCallPrice * groupRatio;

    return (
      <>
        <article>
          <p>
            {i18next.t('输入价格：{{symbol}}{{price}} / 1M tokens{{audioPrice}}', {
              symbol,
              price: (inputRatioPrice * rate).toFixed(6),
              audioPrice: audioInputSeperatePrice
                ? `，${i18next.t('音频输入价格')} ${symbol}${(audioInputPrice * rate).toFixed(6)} / 1M tokens`
                : '',
            })}
          </p>
          <p>
            {i18next.t('补全价格：{{symbol}}{{total}} / 1M tokens', {
              symbol,
              total: (completionRatioPrice * rate).toFixed(6),
            })}
          </p>
          {cacheTokens > 0 && (
            <p>
              {i18next.t('缓存读取价格：{{symbol}}{{total}} / 1M tokens', {
                symbol,
                total: (inputRatioPrice * cacheRatio * rate).toFixed(6),
              })}
            </p>
          )}
          {image && imageOutputTokens > 0 && (
            <p>
              {i18next.t('图片输入价格：{{symbol}}{{total}} / 1M tokens', {
                symbol,
                total: (imageRatioPrice * rate).toFixed(6),
              })}
            </p>
          )}
          {webSearch && webSearchCallCount > 0 && (
            <p>
              {i18next.t('Web搜索价格：{{symbol}}{{price}} / 1K 次', {
                symbol,
                price: (webSearchPrice * rate).toFixed(6),
              })}
            </p>
          )}
          {fileSearch && fileSearchCallCount > 0 && (
            <p>
              {i18next.t('文件搜索价格：{{symbol}}{{price}} / 1K 次', {
                symbol,
                price: (fileSearchPrice * rate).toFixed(6),
              })}
            </p>
          )}
          {imageGenerationCall && imageGenerationCallPrice > 0 && (
            <p>
              {i18next.t('图片生成调用：{{symbol}}{{price}} / 1次', {
                symbol,
                price: (imageGenerationCallPrice * rate).toFixed(6),
              })}
            </p>
          )}
          <p>
            {(() => {
              let inputDesc = '';
              if (image && imageOutputTokens > 0) {
                inputDesc = i18next.t(
                  '(输入 {{nonImageInput}} tokens + 图片输入 {{imageInput}} tokens / 1M tokens * {{symbol}}{{price}}',
                  {
                    nonImageInput: inputTokens - imageOutputTokens,
                    imageInput: imageOutputTokens,
                    symbol: symbol,
                    price: (inputRatioPrice * rate).toFixed(6),
                  },
                );
              } else if (cacheTokens > 0) {
                inputDesc = i18next.t(
                  '(输入 {{nonCacheInput}} tokens / 1M tokens * {{symbol}}{{price}} + 缓存 {{cacheInput}} tokens / 1M tokens * {{symbol}}{{cachePrice}}',
                  {
                    nonCacheInput: inputTokens - cacheTokens,
                    cacheInput: cacheTokens,
                    symbol: symbol,
                    price: (inputRatioPrice * rate).toFixed(6),
                    cachePrice: (cacheRatioPrice * rate).toFixed(6),
                  },
                );
              } else if (audioInputSeperatePrice && audioInputTokens > 0) {
                inputDesc = i18next.t(
                  '(输入 {{nonAudioInput}} tokens / 1M tokens * {{symbol}}{{price}} + 音频输入 {{audioInput}} tokens / 1M tokens * {{symbol}}{{audioPrice}}',
                  {
                    nonAudioInput: inputTokens - audioInputTokens,
                    audioInput: audioInputTokens,
                    symbol: symbol,
                    price: (inputRatioPrice * rate).toFixed(6),
                    audioPrice: (audioInputPrice * rate).toFixed(6),
                  },
                );
              } else {
                inputDesc = i18next.t(
                  '(输入 {{input}} tokens / 1M tokens * {{symbol}}{{price}}',
                  {
                    input: inputTokens,
                    symbol: symbol,
                    price: (inputRatioPrice * rate).toFixed(6),
                  },
                );
              }

              const outputDesc = i18next.t(
                '输出 {{completion}} tokens / 1M tokens * {{symbol}}{{compPrice}}) * {{ratioType}} {{ratio}}',
                {
                  completion: completionTokens,
                  symbol: symbol,
                  compPrice: (completionRatioPrice * rate).toFixed(6),
                  ratio: groupRatio,
                  ratioType: ratioLabel,
                },
              );

              const extraServices = [
                webSearch && webSearchCallCount > 0
                  ? i18next.t(
                      ' + Web搜索 {{count}}次 / 1K 次 * {{symbol}}{{price}} * {{ratioType}} {{ratio}}',
                      {
                        count: webSearchCallCount,
                        symbol: symbol,
                        price: (webSearchPrice * rate).toFixed(6),
                        ratio: groupRatio,
                        ratioType: ratioLabel,
                      },
                    )
                  : '',
                fileSearch && fileSearchCallCount > 0
                  ? i18next.t(
                      ' + 文件搜索 {{count}}次 / 1K 次 * {{symbol}}{{price}} * {{ratioType}} {{ratio}}',
                      {
                        count: fileSearchCallCount,
                        symbol: symbol,
                        price: (fileSearchPrice * rate).toFixed(6),
                        ratio: groupRatio,
                        ratioType: ratioLabel,
                      },
                    )
                  : '',
                imageGenerationCall && imageGenerationCallPrice > 0
                  ? i18next.t(
                      ' + 图片生成调用 {{symbol}}{{price}} / 1次 * {{ratioType}} {{ratio}}',
                      {
                        symbol: symbol,
                        price: (imageGenerationCallPrice * rate).toFixed(6),
                        ratio: groupRatio,
                        ratioType: ratioLabel,
                      },
                    )
                  : '',
              ].join('');

              return i18next.t(
                '{{inputDesc}} + {{outputDesc}}{{extraServices}} = {{symbol}}{{total}}',
                {
                  inputDesc,
                  outputDesc,
                  extraServices,
                  symbol,
                  total: (price * rate).toFixed(6),
                },
              );
            })()}
          </p>
          <p>{i18next.t('仅供参考，以实际扣费为准')}</p>
        </article>
      </>
    );
  }

  if (modelPrice !== -1) {
    const displayPrice = (modelPrice * rate).toFixed(6);
    const displayTotal = (modelPrice * groupRatio * rate).toFixed(6);
    return i18next.t(
      '模型价格：{{symbol}}{{price}} * {{ratioType}}：{{ratio}} = {{symbol}}{{total}}',
      {
        symbol: symbol,
        price: displayPrice,
        ratio: groupRatio,
        total: displayTotal,
        ratioType: ratioLabel,
      },
    );
  }

  if (completionRatio === undefined) {
    completionRatio = 0;
  }

  const modelRatioValue = formatRatioValue(modelRatio);
  const completionRatioValue = formatRatioValue(completionRatio);
  const cacheRatioValue = formatRatioValue(cacheRatio);
  const imageRatioValue = formatRatioValue(imageRatio);
  const inputRatioPrice = modelRatio * 2.0;
  const completionRatioPrice = modelRatio * 2.0 * completionRatioValue;
  const audioRatioValue =
    audioInputSeperatePrice && audioInputPrice > 0
      ? formatRatioValue(audioInputPrice / inputRatioPrice)
      : null;

  const textInputTokens = Math.max(inputTokens - cacheTokens - audioInputTokens, 0);
  const imageInputTokens = image && imageOutputTokens > 0 ? imageOutputTokens : 0;
  const cacheInputTokens = cacheTokens;

  const textInputAmount =
    (textInputTokens / 1000000) * inputRatioPrice * groupRatio;
  const cacheInputAmount =
    (cacheInputTokens / 1000000) *
    inputRatioPrice *
    cacheRatioValue *
    groupRatio;
  const imageInputAmount =
    (imageInputTokens / 1000000) *
    inputRatioPrice *
    imageRatioValue *
    groupRatio;
  const audioInputAmount =
    (audioInputTokens / 1000000) * audioInputPrice * groupRatio;
  const completionAmount =
    (completionTokens / 1000000) * completionRatioPrice * groupRatio;
  const webSearchAmount = (webSearchCallCount / 1000) * webSearchPrice * groupRatio;
  const fileSearchAmount =
    (fileSearchCallCount / 1000) * fileSearchPrice * groupRatio;
  const imageGenerationAmount = imageGenerationCallPrice * groupRatio;

  const totalAmount =
    textInputAmount +
    cacheInputAmount +
    imageInputAmount +
    audioInputAmount +
    completionAmount +
    webSearchAmount +
    fileSearchAmount +
    imageGenerationAmount;

  return (
    <>
      <article>
        <p>
          {[
            i18next.t('模型倍率 {{modelRatio}}', {
              modelRatio: modelRatioValue,
            }),
            i18next.t('补全倍率 {{completionRatio}}', {
              completionRatio: completionRatioValue,
            }),
            cacheInputTokens > 0
              ? i18next.t('缓存倍率 {{cacheRatio}}', {
                  cacheRatio: cacheRatioValue,
                })
              : null,
            imageInputTokens > 0
              ? i18next.t('图片倍率 {{imageRatio}}', {
                  imageRatio: imageRatioValue,
                })
              : null,
            audioRatioValue !== null
              ? i18next.t('音频倍率 {{audioRatio}}', {
                  audioRatio: audioRatioValue,
                })
              : null,
            i18next.t('{{ratioType}} {{ratio}}', {
              ratioType: ratioLabel,
              ratio: groupRatio,
            }),
          ]
            .filter(Boolean)
            .join('，')}
        </p>
        {textInputTokens > 0 && (
          <p>
            {i18next.t(
              '普通输入：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * {{ratioType}} {{ratio}} = {{amount}}',
              {
                tokens: textInputTokens,
                modelRatio: modelRatioValue,
                ratioType: ratioLabel,
                ratio: groupRatio,
                amount: renderDisplayAmountFromUsd(textInputAmount),
              },
            )}
          </p>
        )}
        {cacheInputTokens > 0 && (
          <p>
            {i18next.t(
              '缓存输入：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * 缓存倍率 {{cacheRatio}} * {{ratioType}} {{ratio}} = {{amount}}',
              {
                tokens: cacheInputTokens,
                modelRatio: modelRatioValue,
                cacheRatio: cacheRatioValue,
                ratioType: ratioLabel,
                ratio: groupRatio,
                amount: renderDisplayAmountFromUsd(cacheInputAmount),
              },
            )}
          </p>
        )}
        {imageInputTokens > 0 && (
          <p>
            {i18next.t(
              '图片输入：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * 图片倍率 {{imageRatio}} * {{ratioType}} {{ratio}} = {{amount}}',
              {
                tokens: imageInputTokens,
                modelRatio: modelRatioValue,
                imageRatio: imageRatioValue,
                ratioType: ratioLabel,
                ratio: groupRatio,
                amount: renderDisplayAmountFromUsd(imageInputAmount),
              },
            )}
          </p>
        )}
        {audioInputTokens > 0 && audioRatioValue !== null && (
          <p>
            {i18next.t(
              '音频输入：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * 音频倍率 {{audioRatio}} * {{ratioType}} {{ratio}} = {{amount}}',
              {
                tokens: audioInputTokens,
                modelRatio: modelRatioValue,
                audioRatio: audioRatioValue,
                ratioType: ratioLabel,
                ratio: groupRatio,
                amount: renderDisplayAmountFromUsd(audioInputAmount),
              },
            )}
          </p>
        )}
        <p>
          {i18next.t(
            '输出：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * 补全倍率 {{completionRatio}} * {{ratioType}} {{ratio}} = {{amount}}',
            {
              tokens: completionTokens,
              modelRatio: modelRatioValue,
              completionRatio: completionRatioValue,
              ratioType: ratioLabel,
              ratio: groupRatio,
              amount: renderDisplayAmountFromUsd(completionAmount),
            },
          )}
        </p>
        {webSearch && webSearchCallCount > 0 && (
          <p>
            {i18next.t(
              'Web 搜索：{{count}} / 1K * 单价 {{price}} * {{ratioType}} {{ratio}} = {{amount}}',
              {
                count: webSearchCallCount,
                price: renderDisplayAmountFromUsd(webSearchPrice),
                ratioType: ratioLabel,
                ratio: groupRatio,
                amount: renderDisplayAmountFromUsd(webSearchAmount),
              },
            )}
          </p>
        )}
        {fileSearch && fileSearchCallCount > 0 && (
          <p>
            {i18next.t(
              '文件搜索：{{count}} / 1K * 单价 {{price}} * {{ratioType}} {{ratio}} = {{amount}}',
              {
                count: fileSearchCallCount,
                price: renderDisplayAmountFromUsd(fileSearchPrice),
                ratioType: ratioLabel,
                ratio: groupRatio,
                amount: renderDisplayAmountFromUsd(fileSearchAmount),
              },
            )}
          </p>
        )}
        {imageGenerationCall && imageGenerationCallPrice > 0 && (
          <p>
            {i18next.t(
              '图片生成：1 次 * 单价 {{price}} * {{ratioType}} {{ratio}} = {{amount}}',
              {
                price: renderDisplayAmountFromUsd(imageGenerationCallPrice),
                ratioType: ratioLabel,
                ratio: groupRatio,
                amount: renderDisplayAmountFromUsd(imageGenerationAmount),
              },
            )}
          </p>
        )}
        <p>
          {i18next.t('合计：{{total}}', {
            total: renderDisplayAmountFromUsd(totalAmount),
          })}
        </p>
        <p>{i18next.t('仅供参考，以实际扣费为准')}</p>
      </article>
    </>
  );
}

export function renderLogContent(
  modelRatio,
  completionRatio,
  modelPrice = -1,
  groupRatio,
  user_group_ratio,
  cacheRatio = 1.0,
  image = false,
  imageRatio = 1.0,
  webSearch = false,
  webSearchCallCount = 0,
  fileSearch = false,
  fileSearchCallCount = 0,
  displayMode = 'price',
) {
  const {
    ratio,
    label: ratioLabel,
    useUserGroupRatio: useUserGroupRatio,
  } = getEffectiveRatio(groupRatio, user_group_ratio);

  // 获取货币配置
  const { symbol, rate } = getCurrencyConfig();

  if (isPriceDisplayMode(displayMode, modelPrice)) {
    if (modelPrice !== -1) {
      return joinBillingSummary([
        i18next.t('模型价格 {{symbol}}{{price}} / 次', {
          symbol,
          price: (modelPrice * rate).toFixed(6),
        }),
        getGroupRatioText(groupRatio, user_group_ratio),
      ]);
    }

    const parts = [
      i18next.t('输入价格 {{symbol}}{{price}} / 1M tokens', {
        symbol,
        price: (modelRatio * 2.0 * rate).toFixed(6),
      }),
      i18next.t('补全价格 {{symbol}}{{price}} / 1M tokens', {
        symbol,
        price: (modelRatio * 2.0 * completionRatio * rate).toFixed(6),
      }),
    ];
    appendPricePart(parts, cacheRatio !== 1.0, '缓存读取价格 {{symbol}}{{price}} / 1M tokens', {
      symbol,
      price: (modelRatio * 2.0 * cacheRatio * rate).toFixed(6),
    });
    appendPricePart(parts, image, '图片输入价格 {{symbol}}{{price}} / 1M tokens', {
      symbol,
      price: (modelRatio * 2.0 * imageRatio * rate).toFixed(6),
    });
    appendPricePart(parts, webSearch, 'Web 搜索调用 {{webSearchCallCount}} 次', {
      webSearchCallCount,
    });
    appendPricePart(parts, fileSearch, '文件搜索调用 {{fileSearchCallCount}} 次', {
      fileSearchCallCount,
    });
    parts.push(getGroupRatioText(groupRatio, user_group_ratio));
    return joinBillingSummary(parts);
  }

  if (modelPrice !== -1) {
    return i18next.t('模型价格 {{symbol}}{{price}}，{{ratioType}} {{ratio}}', {
      symbol: symbol,
      price: (modelPrice * rate).toFixed(6),
      ratioType: ratioLabel,
      ratio,
    });
  } else {
    if (image) {
      return i18next.t(
        '模型倍率 {{modelRatio}}，缓存倍率 {{cacheRatio}}，输出倍率 {{completionRatio}}，图片输入倍率 {{imageRatio}}，{{ratioType}} {{ratio}}',
        {
          modelRatio: modelRatio,
          cacheRatio: cacheRatio,
          completionRatio: completionRatio,
          imageRatio: imageRatio,
          ratioType: ratioLabel,
          ratio,
        },
      );
    } else if (webSearch) {
      return i18next.t(
        '模型倍率 {{modelRatio}}，缓存倍率 {{cacheRatio}}，输出倍率 {{completionRatio}}，{{ratioType}} {{ratio}}，Web 搜索调用 {{webSearchCallCount}} 次',
        {
          modelRatio: modelRatio,
          cacheRatio: cacheRatio,
          completionRatio: completionRatio,
          ratioType: ratioLabel,
          ratio,
          webSearchCallCount,
        },
      );
    } else {
      return i18next.t(
        '模型倍率 {{modelRatio}}，缓存倍率 {{cacheRatio}}，输出倍率 {{completionRatio}}，{{ratioType}} {{ratio}}',
        {
          modelRatio: modelRatio,
          cacheRatio: cacheRatio,
          completionRatio: completionRatio,
          ratioType: ratioLabel,
          ratio,
        },
      );
    }
  }
}

export function renderModelPriceSimple(
  modelRatio,
  modelPrice = -1,
  groupRatio,
  user_group_ratio,
  cacheTokens = 0,
  cacheRatio = 1.0,
  cacheCreationTokens = 0,
  cacheCreationRatio = 1.0,
  cacheCreationTokens5m = 0,
  cacheCreationRatio5m = 1.0,
  cacheCreationTokens1h = 0,
  cacheCreationRatio1h = 1.0,
  image = false,
  imageRatio = 1.0,
  isSystemPromptOverride = false,
  provider = 'openai',
  displayMode = 'price',
) {
  return renderPriceSimpleCore({
    modelRatio,
    modelPrice,
    groupRatio,
    user_group_ratio,
    cacheTokens,
    cacheRatio,
    cacheCreationTokens,
    cacheCreationRatio,
    cacheCreationTokens5m,
    cacheCreationRatio5m,
    cacheCreationTokens1h,
    cacheCreationRatio1h,
    image,
    imageRatio,
    isSystemPromptOverride,
    displayMode,
  });
}

export function renderAudioModelPrice(
  inputTokens,
  completionTokens,
  modelRatio,
  modelPrice = -1,
  completionRatio,
  audioInputTokens,
  audioCompletionTokens,
  audioRatio,
  audioCompletionRatio,
  groupRatio,
  user_group_ratio,
  cacheTokens = 0,
  cacheRatio = 1.0,
  displayMode = 'price',
) {
  const { ratio: effectiveGroupRatio, label: ratioLabel } = getEffectiveRatio(
    groupRatio,
    user_group_ratio,
  );
  groupRatio = effectiveGroupRatio;

  // 获取货币配置
  const { symbol, rate } = getCurrencyConfig();

  if (!shouldUseRatioBillingProcess(modelPrice)) {
    if (modelPrice !== -1) {
      return (
        <>
          <article>
            <p>
              {i18next.t('模型价格：{{symbol}}{{price}} / 次', {
                symbol,
                price: (modelPrice * rate).toFixed(6),
              })}
            </p>
            <p>
              {i18next.t(
                '模型价格 {{symbol}}{{price}} / 次 * {{ratioType}} {{ratio}} = {{symbol}}{{total}}',
                {
                  symbol,
                  price: (modelPrice * rate).toFixed(6),
                  ratioType: ratioLabel,
                  ratio: groupRatio,
                  total: (modelPrice * groupRatio * rate).toFixed(6),
                },
              )}
            </p>
            <p>{i18next.t('仅供参考，以实际扣费为准')}</p>
          </article>
        </>
      );
    }

    if (completionRatio === undefined) {
      completionRatio = 0;
    }
    audioRatio = parseFloat(audioRatio).toFixed(6);
    const inputRatioPrice = modelRatio * 2.0;
    const completionRatioPrice = modelRatio * 2.0 * completionRatio;
    const textPrice =
      ((inputTokens - cacheTokens + cacheTokens * cacheRatio) / 1000000) *
        inputRatioPrice *
        groupRatio +
      (completionTokens / 1000000) * completionRatioPrice * groupRatio;
    const audioPrice =
      (audioInputTokens / 1000000) * inputRatioPrice * audioRatio * groupRatio +
      (audioCompletionTokens / 1000000) *
        inputRatioPrice *
        audioRatio *
        audioCompletionRatio *
        groupRatio;
    const totalPrice = textPrice + audioPrice;

    return (
      <>
        <article>
          <p>
            {i18next.t('输入价格：{{symbol}}{{price}} / 1M tokens', {
              symbol,
              price: (inputRatioPrice * rate).toFixed(6),
            })}
          </p>
          <p>
            {i18next.t('补全价格：{{symbol}}{{price}} / 1M tokens', {
              symbol,
              price: (completionRatioPrice * rate).toFixed(6),
            })}
          </p>
          {cacheTokens > 0 && (
            <p>
              {i18next.t('缓存读取价格：{{symbol}}{{price}} / 1M tokens', {
                symbol,
                price: (inputRatioPrice * cacheRatio * rate).toFixed(6),
              })}
            </p>
          )}
          <p>
            {i18next.t('音频输入价格：{{symbol}}{{price}} / 1M tokens', {
              symbol,
              price: (inputRatioPrice * audioRatio * rate).toFixed(6),
            })}
          </p>
          <p>
            {i18next.t('音频补全价格：{{symbol}}{{price}} / 1M tokens', {
              symbol,
              price: (
                inputRatioPrice *
                audioRatio *
                audioCompletionRatio *
                rate
              ).toFixed(6),
            })}
          </p>
          <p>
            {i18next.t(
              '文字提示 {{input}} tokens / 1M tokens * {{symbol}}{{textInputPrice}} + 文字补全 {{completion}} tokens / 1M tokens * {{symbol}}{{textCompPrice}} + 音频提示 {{audioInput}} tokens / 1M tokens * {{symbol}}{{audioInputPrice}} + 音频补全 {{audioCompletion}} tokens / 1M tokens * {{symbol}}{{audioCompPrice}} * {{ratioType}} {{ratio}} = {{symbol}}{{total}}',
              {
                input: inputTokens,
                completion: completionTokens,
                audioInput: audioInputTokens,
                audioCompletion: audioCompletionTokens,
                textInputPrice: (inputRatioPrice * rate).toFixed(6),
                textCompPrice: (completionRatioPrice * rate).toFixed(6),
                audioInputPrice: (audioRatio * inputRatioPrice * rate).toFixed(6),
                audioCompPrice: (
                  audioRatio *
                  audioCompletionRatio *
                  inputRatioPrice *
                  rate
                ).toFixed(6),
                ratioType: ratioLabel,
                ratio: groupRatio,
                symbol,
                total: (totalPrice * rate).toFixed(6),
              },
            )}
          </p>
          <p>{i18next.t('仅供参考，以实际扣费为准')}</p>
        </article>
      </>
    );
  }

  // 1 ratio = $0.002 / 1K tokens
  if (modelPrice !== -1) {
    return i18next.t(
      '模型价格：{{symbol}}{{price}} * {{ratioType}}：{{ratio}} = {{symbol}}{{total}}',
      {
        symbol: symbol,
        price: (modelPrice * rate).toFixed(6),
        ratio: groupRatio,
        total: (modelPrice * groupRatio * rate).toFixed(6),
        ratioType: ratioLabel,
      },
    );
  }

  if (completionRatio === undefined) {
    completionRatio = 0;
  }

  const modelRatioValue = formatRatioValue(modelRatio);
  const completionRatioValue = formatRatioValue(completionRatio);
  const cacheRatioValue = formatRatioValue(cacheRatio);
  const audioRatioValue = formatRatioValue(audioRatio);
  const audioCompletionRatioValue = formatRatioValue(audioCompletionRatio);

  const inputRatioPrice = modelRatio * 2.0;
  const completionRatioPrice = modelRatio * 2.0 * completionRatioValue;

  const effectiveInputTokens =
    inputTokens - cacheTokens + cacheTokens * cacheRatioValue;

  const textPrice =
    (effectiveInputTokens / 1000000) * inputRatioPrice * groupRatio +
    (completionTokens / 1000000) * completionRatioPrice * groupRatio;
  const audioPrice =
    (audioInputTokens / 1000000) * inputRatioPrice * audioRatioValue * groupRatio +
    (audioCompletionTokens / 1000000) *
      inputRatioPrice *
      audioRatioValue *
      audioCompletionRatioValue *
      groupRatio;
  const totalPrice = textPrice + audioPrice;

  return (
    <>
      <article>
        <p>
          {i18next.t(
            '模型倍率 {{modelRatio}}，补全倍率 {{completionRatio}}，音频倍率 {{audioRatio}}，音频补全倍率 {{audioCompletionRatio}}，{{cachePart}}{{ratioType}} {{ratio}}',
            {
              modelRatio: modelRatioValue,
              completionRatio: completionRatioValue,
              audioRatio: audioRatioValue,
              audioCompletionRatio: audioCompletionRatioValue,
              cachePart:
                cacheTokens > 0
                  ? `${i18next.t('缓存倍率')} ${cacheRatioValue}，`
                  : '',
              ratioType: ratioLabel,
              ratio: groupRatio,
            },
          )}
        </p>
        <p>
          {i18next.t(
            '普通输入：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * {{ratioType}} {{ratio}} = {{amount}}',
            {
              tokens: Math.max(inputTokens - cacheTokens, 0),
              modelRatio: modelRatioValue,
              ratioType: ratioLabel,
              ratio: groupRatio,
              amount: renderDisplayAmountFromUsd(
                ((Math.max(inputTokens - cacheTokens, 0) / 1000000) *
                  inputRatioPrice *
                  groupRatio),
              ),
            },
          )}
        </p>
        {cacheTokens > 0 && (
          <p>
            {i18next.t(
              '缓存输入：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * 缓存倍率 {{cacheRatio}} * {{ratioType}} {{ratio}} = {{amount}}',
              {
                tokens: cacheTokens,
                modelRatio: modelRatioValue,
                cacheRatio: cacheRatioValue,
                ratioType: ratioLabel,
                ratio: groupRatio,
                amount: renderDisplayAmountFromUsd(
                  ((cacheTokens / 1000000) *
                    inputRatioPrice *
                    cacheRatioValue *
                    groupRatio),
                ),
              },
            )}
          </p>
        )}
        <p>
          {i18next.t(
            '文字输出：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * 补全倍率 {{completionRatio}} * {{ratioType}} {{ratio}} = {{amount}}',
            {
              tokens: completionTokens,
              modelRatio: modelRatioValue,
              completionRatio: completionRatioValue,
              ratioType: ratioLabel,
              ratio: groupRatio,
              amount: renderDisplayAmountFromUsd(
                ((completionTokens / 1000000) *
                  inputRatioPrice *
                  completionRatioValue *
                  groupRatio),
              ),
            },
          )}
        </p>
        <p>
          {i18next.t(
            '音频输入：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * 音频倍率 {{audioRatio}} * {{ratioType}} {{ratio}} = {{amount}}',
            {
              tokens: audioInputTokens,
              modelRatio: modelRatioValue,
              audioRatio: audioRatioValue,
              ratioType: ratioLabel,
              ratio: groupRatio,
              amount: renderDisplayAmountFromUsd(
                ((audioInputTokens / 1000000) *
                  inputRatioPrice *
                  audioRatioValue *
                  groupRatio),
              ),
            },
          )}
        </p>
        <p>
          {i18next.t(
            '音频输出：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * 音频倍率 {{audioRatio}} * 音频补全倍率 {{audioCompletionRatio}} * {{ratioType}} {{ratio}} = {{amount}}',
            {
              tokens: audioCompletionTokens,
              modelRatio: modelRatioValue,
              audioRatio: audioRatioValue,
              audioCompletionRatio: audioCompletionRatioValue,
              ratioType: ratioLabel,
              ratio: groupRatio,
              amount: renderDisplayAmountFromUsd(
                ((audioCompletionTokens / 1000000) *
                  inputRatioPrice *
                  audioRatioValue *
                  audioCompletionRatioValue *
                  groupRatio),
              ),
            },
          )}
        </p>
        <p>
          {i18next.t(
            '合计：文字部分 {{textTotal}} + 音频部分 {{audioTotal}} = {{total}}',
            {
              textTotal: renderDisplayAmountFromUsd(textPrice),
              audioTotal: renderDisplayAmountFromUsd(audioPrice),
              total: renderDisplayAmountFromUsd(totalPrice),
            },
          )}
        </p>
        <p>{i18next.t('仅供参考，以实际扣费为准')}</p>
      </article>
    </>
  );
}

export function renderQuotaWithPrompt(quota, digits) {
  const quotaDisplayType = localStorage.getItem('quota_display_type') || 'USD';
  if (quotaDisplayType !== 'TOKENS') {
    return i18next.t('等价金额：') + renderQuota(quota, digits);
  }
  return '';
}

export function renderClaudeModelPrice(
  inputTokens,
  completionTokens,
  modelRatio,
  modelPrice = -1,
  completionRatio,
  groupRatio,
  user_group_ratio,
  cacheTokens = 0,
  cacheRatio = 1.0,
  cacheCreationTokens = 0,
  cacheCreationRatio = 1.0,
  cacheCreationTokens5m = 0,
  cacheCreationRatio5m = 1.0,
  cacheCreationTokens1h = 0,
  cacheCreationRatio1h = 1.0,
  displayMode = 'price',
) {
  const { ratio: effectiveGroupRatio, label: ratioLabel } = getEffectiveRatio(
    groupRatio,
    user_group_ratio,
  );
  groupRatio = effectiveGroupRatio;

  // 获取货币配置
  const { symbol, rate } = getCurrencyConfig();

  if (!shouldUseRatioBillingProcess(modelPrice)) {
    if (modelPrice !== -1) {
      return (
        <>
          <article>
            <p>
              {i18next.t('模型价格：{{symbol}}{{price}} / 次', {
                symbol,
                price: (modelPrice * rate).toFixed(6),
              })}
            </p>
            <p>
              {i18next.t(
                '模型价格 {{symbol}}{{price}} / 次 * {{ratioType}} {{ratio}} = {{symbol}}{{total}}',
                {
                  symbol,
                  price: (modelPrice * rate).toFixed(6),
                  ratioType: ratioLabel,
                  ratio: groupRatio,
                  total: (modelPrice * groupRatio * rate).toFixed(6),
                },
              )}
            </p>
            <p>{i18next.t('仅供参考，以实际扣费为准')}</p>
          </article>
        </>
      );
    }

    if (completionRatio === undefined) {
      completionRatio = 0;
    }

    const inputRatioPrice = modelRatio * 2.0;
    const completionRatioPrice = modelRatio * 2.0 * completionRatio;
    const cacheRatioPrice = modelRatio * 2.0 * cacheRatio;
    const cacheCreationRatioPrice = modelRatio * 2.0 * cacheCreationRatio;
    const cacheCreationRatioPrice5m = modelRatio * 2.0 * cacheCreationRatio5m;
    const cacheCreationRatioPrice1h = modelRatio * 2.0 * cacheCreationRatio1h;
    const hasSplitCacheCreation =
      cacheCreationTokens5m > 0 || cacheCreationTokens1h > 0;
    const legacyCacheCreationTokens = hasSplitCacheCreation
      ? 0
      : cacheCreationTokens;
    const effectiveInputTokens =
      inputTokens +
      cacheTokens * cacheRatio +
      legacyCacheCreationTokens * cacheCreationRatio +
      cacheCreationTokens5m * cacheCreationRatio5m +
      cacheCreationTokens1h * cacheCreationRatio1h;
    const price =
      (effectiveInputTokens / 1000000) * inputRatioPrice * groupRatio +
      (completionTokens / 1000000) * completionRatioPrice * groupRatio;
    const inputUnitPrice = inputRatioPrice * rate;
    const completionUnitPrice = completionRatioPrice * rate;
    const cacheUnitPrice = cacheRatioPrice * rate;
    const cacheCreationUnitPrice = cacheCreationRatioPrice * rate;
    const cacheCreationUnitPrice5m = cacheCreationRatioPrice5m * rate;
    const cacheCreationUnitPrice1h = cacheCreationRatioPrice1h * rate;
    const cacheCreationUnitPriceTotal =
      cacheCreationUnitPrice5m + cacheCreationUnitPrice1h;
    const shouldShowCache = cacheTokens > 0;
    const shouldShowLegacyCacheCreation =
      !hasSplitCacheCreation && cacheCreationTokens > 0;
    const shouldShowCacheCreation5m =
      hasSplitCacheCreation && cacheCreationTokens5m > 0;
    const shouldShowCacheCreation1h =
      hasSplitCacheCreation && cacheCreationTokens1h > 0;

    const breakdownSegments = [
      i18next.t('提示 {{input}} tokens / 1M tokens * {{symbol}}{{price}}', {
        input: inputTokens,
        symbol,
        price: inputUnitPrice.toFixed(6),
      }),
    ];

    if (shouldShowCache) {
      breakdownSegments.push(
        i18next.t('缓存 {{tokens}} tokens / 1M tokens * {{symbol}}{{price}}', {
          tokens: cacheTokens,
          symbol,
          price: cacheUnitPrice.toFixed(6),
        }),
      );
    }

    if (shouldShowLegacyCacheCreation) {
      breakdownSegments.push(
        i18next.t('缓存创建 {{tokens}} tokens / 1M tokens * {{symbol}}{{price}}', {
          tokens: cacheCreationTokens,
          symbol,
          price: cacheCreationUnitPrice.toFixed(6),
        }),
      );
    }

    if (shouldShowCacheCreation5m) {
      breakdownSegments.push(
        i18next.t('5m缓存创建 {{tokens}} tokens / 1M tokens * {{symbol}}{{price}}', {
          tokens: cacheCreationTokens5m,
          symbol,
          price: cacheCreationUnitPrice5m.toFixed(6),
        }),
      );
    }

    if (shouldShowCacheCreation1h) {
      breakdownSegments.push(
        i18next.t('1h缓存创建 {{tokens}} tokens / 1M tokens * {{symbol}}{{price}}', {
          tokens: cacheCreationTokens1h,
          symbol,
          price: cacheCreationUnitPrice1h.toFixed(6),
        }),
      );
    }

    breakdownSegments.push(
      i18next.t(
        '补全 {{completion}} tokens / 1M tokens * {{symbol}}{{price}}',
        {
          completion: completionTokens,
          symbol,
          price: completionUnitPrice.toFixed(6),
        },
      ),
    );

    const breakdownText = breakdownSegments.join(' + ');

    return (
      <>
        <article>
          <p>
            {i18next.t('输入价格：{{symbol}}{{price}} / 1M tokens', {
              symbol,
              price: (inputRatioPrice * rate).toFixed(6),
            })}
          </p>
          <p>
            {i18next.t('补全价格：{{symbol}}{{price}} / 1M tokens', {
              symbol,
              price: (completionRatioPrice * rate).toFixed(6),
            })}
          </p>
          {cacheTokens > 0 && (
            <p>
              {i18next.t('缓存读取价格：{{symbol}}{{price}} / 1M tokens', {
                symbol,
                price: (cacheRatioPrice * rate).toFixed(6),
              })}
            </p>
          )}
          {!hasSplitCacheCreation && cacheCreationTokens > 0 && (
            <p>
              {i18next.t('缓存创建价格：{{symbol}}{{price}} / 1M tokens', {
                symbol,
                price: (cacheCreationRatioPrice * rate).toFixed(6),
              })}
            </p>
          )}
          {hasSplitCacheCreation && cacheCreationTokens5m > 0 && (
            <p>
              {i18next.t('5m缓存创建价格：{{symbol}}{{price}} / 1M tokens', {
                symbol,
                price: (cacheCreationRatioPrice5m * rate).toFixed(6),
              })}
            </p>
          )}
          {hasSplitCacheCreation && cacheCreationTokens1h > 0 && (
            <p>
              {i18next.t('1h缓存创建价格：{{symbol}}{{price}} / 1M tokens', {
                symbol,
                price: (cacheCreationRatioPrice1h * rate).toFixed(6),
              })}
            </p>
          )}
          <p>
            {i18next.t(
              '{{breakdown}} * {{ratioType}} {{ratio}} = {{symbol}}{{total}}',
              {
                breakdown: breakdownText,
                ratioType: ratioLabel,
                ratio: groupRatio,
                symbol,
                total: (price * rate).toFixed(6),
              },
            )}
          </p>
          <p>{i18next.t('仅供参考，以实际扣费为准')}</p>
        </article>
      </>
    );
  }

  if (modelPrice !== -1) {
    return i18next.t(
      '模型价格：{{symbol}}{{price}} * {{ratioType}}：{{ratio}} = {{symbol}}{{total}}',
      {
        symbol: symbol,
        price: (modelPrice * rate).toFixed(6),
        ratioType: ratioLabel,
        ratio: groupRatio,
        total: (modelPrice * groupRatio * rate).toFixed(6),
      },
    );
  }

  if (completionRatio === undefined) {
    completionRatio = 0;
  }

  const modelRatioValue = formatRatioValue(modelRatio);
  const completionRatioValue = formatRatioValue(completionRatio);
  const cacheRatioValue = formatRatioValue(cacheRatio);
  const cacheCreationRatioValue = formatRatioValue(cacheCreationRatio);
  const cacheCreationRatio5mValue = formatRatioValue(cacheCreationRatio5m);
  const cacheCreationRatio1hValue = formatRatioValue(cacheCreationRatio1h);

  const inputRatioPrice = modelRatio * 2.0;
  const completionRatioPrice = modelRatio * 2.0 * completionRatioValue;

  const hasSplitCacheCreation =
    cacheCreationTokens5m > 0 || cacheCreationTokens1h > 0;
  const shouldShowCache = cacheTokens > 0;
  const shouldShowLegacyCacheCreation =
    !hasSplitCacheCreation && cacheCreationTokens > 0;
  const shouldShowCacheCreation5m =
    hasSplitCacheCreation && cacheCreationTokens5m > 0;
  const shouldShowCacheCreation1h =
    hasSplitCacheCreation && cacheCreationTokens1h > 0;

  const legacyCacheCreationTokens = hasSplitCacheCreation ? 0 : cacheCreationTokens;
  const effectiveInputTokens =
    inputTokens +
    cacheTokens * cacheRatioValue +
    legacyCacheCreationTokens * cacheCreationRatioValue +
    cacheCreationTokens5m * cacheCreationRatio5mValue +
    cacheCreationTokens1h * cacheCreationRatio1hValue;

  const totalAmount =
    (effectiveInputTokens / 1000000) * inputRatioPrice * groupRatio +
    (completionTokens / 1000000) * completionRatioPrice * groupRatio;

  return (
    <>
      <article>
        <p>
          {i18next.t(
            '模型倍率 {{modelRatio}}，输出倍率 {{completionRatio}}，缓存倍率 {{cacheRatio}}，{{ratioType}} {{ratio}}',
            {
              modelRatio: modelRatioValue,
              completionRatio: completionRatioValue,
              cacheRatio: cacheRatioValue,
              ratioType: ratioLabel,
              ratio: groupRatio,
            },
          )}
        </p>
        <p>
          {hasSplitCacheCreation
            ? i18next.t(
                '缓存创建倍率 5m {{cacheCreationRatio5m}} / 1h {{cacheCreationRatio1h}}',
                {
                  cacheCreationRatio5m: cacheCreationRatio5mValue,
                  cacheCreationRatio1h: cacheCreationRatio1hValue,
                },
              )
            : i18next.t('缓存创建倍率 {{cacheCreationRatio}}', {
                cacheCreationRatio: cacheCreationRatioValue,
              })}
        </p>
        <p>
          {i18next.t(
            '普通输入：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * {{ratioType}} {{ratio}} = {{amount}}',
            {
              tokens: inputTokens,
              modelRatio: modelRatioValue,
              ratioType: ratioLabel,
              ratio: groupRatio,
              amount: renderDisplayAmountFromUsd(
                ((inputTokens / 1000000) * inputRatioPrice * groupRatio),
              ),
            },
          )}
        </p>
        {shouldShowCache && (
          <p>
            {i18next.t(
              '缓存读取：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * 缓存倍率 {{cacheRatio}} * {{ratioType}} {{ratio}} = {{amount}}',
              {
                tokens: cacheTokens,
                modelRatio: modelRatioValue,
                cacheRatio: cacheRatioValue,
                ratioType: ratioLabel,
                ratio: groupRatio,
                amount: renderDisplayAmountFromUsd(
                  ((cacheTokens / 1000000) *
                    inputRatioPrice *
                    cacheRatioValue *
                    groupRatio),
                ),
              },
            )}
          </p>
        )}
        {shouldShowLegacyCacheCreation && (
          <p>
            {i18next.t(
              '缓存创建：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * 缓存创建倍率 {{cacheCreationRatio}} * {{ratioType}} {{ratio}} = {{amount}}',
              {
                tokens: cacheCreationTokens,
                modelRatio: modelRatioValue,
                cacheCreationRatio: cacheCreationRatioValue,
                ratioType: ratioLabel,
                ratio: groupRatio,
                amount: renderDisplayAmountFromUsd(
                  ((cacheCreationTokens / 1000000) *
                    inputRatioPrice *
                    cacheCreationRatioValue *
                    groupRatio),
                ),
              },
            )}
          </p>
        )}
        {shouldShowCacheCreation5m && (
          <p>
            {i18next.t(
              '5m缓存创建：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * 5m缓存创建倍率 {{cacheCreationRatio5m}} * {{ratioType}} {{ratio}} = {{amount}}',
              {
                tokens: cacheCreationTokens5m,
                modelRatio: modelRatioValue,
                cacheCreationRatio5m: cacheCreationRatio5mValue,
                ratioType: ratioLabel,
                ratio: groupRatio,
                amount: renderDisplayAmountFromUsd(
                  ((cacheCreationTokens5m / 1000000) *
                    inputRatioPrice *
                    cacheCreationRatio5mValue *
                    groupRatio),
                ),
              },
            )}
          </p>
        )}
        {shouldShowCacheCreation1h && (
          <p>
            {i18next.t(
              '1h缓存创建：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * 1h缓存创建倍率 {{cacheCreationRatio1h}} * {{ratioType}} {{ratio}} = {{amount}}',
              {
                tokens: cacheCreationTokens1h,
                modelRatio: modelRatioValue,
                cacheCreationRatio1h: cacheCreationRatio1hValue,
                ratioType: ratioLabel,
                ratio: groupRatio,
                amount: renderDisplayAmountFromUsd(
                  ((cacheCreationTokens1h / 1000000) *
                    inputRatioPrice *
                    cacheCreationRatio1hValue *
                    groupRatio),
                ),
              },
            )}
          </p>
        )}
        <p>
          {i18next.t('补全 {{completion}} tokens * 输出倍率 {{completionRatio}}', {
            completion: completionTokens,
            completionRatio: completionRatioValue,
          })}
        </p>
        <p>
          {i18next.t(
            '输出：{{tokens}} / 1M * 模型倍率 {{modelRatio}} * 输出倍率 {{completionRatio}} * {{ratioType}} {{ratio}} = {{amount}}',
            {
              tokens: completionTokens,
              modelRatio: modelRatioValue,
              completionRatio: completionRatioValue,
              ratioType: ratioLabel,
              ratio: groupRatio,
              amount: renderDisplayAmountFromUsd(
                ((completionTokens / 1000000) *
                  inputRatioPrice *
                  completionRatioValue *
                  groupRatio),
              ),
            },
          )}
        </p>
        <p>
          {i18next.t('合计：{{total}}', {
            total: renderDisplayAmountFromUsd(totalAmount),
            },
          )}
        </p>
        <p>{i18next.t('仅供参考，以实际扣费为准')}</p>
      </article>
    </>
  );
}

export function renderClaudeLogContent(
  modelRatio,
  completionRatio,
  modelPrice = -1,
  groupRatio,
  user_group_ratio,
  cacheRatio = 1.0,
  cacheCreationRatio = 1.0,
  cacheCreationTokens5m = 0,
  cacheCreationRatio5m = 1.0,
  cacheCreationTokens1h = 0,
  cacheCreationRatio1h = 1.0,
  displayMode = 'price',
) {
  const { ratio: effectiveGroupRatio, label: ratioLabel } = getEffectiveRatio(
    groupRatio,
    user_group_ratio,
  );
  groupRatio = effectiveGroupRatio;

  // 获取货币配置
  const { symbol, rate } = getCurrencyConfig();

  if (isPriceDisplayMode(displayMode, modelPrice)) {
    if (modelPrice !== -1) {
      return joinBillingSummary([
        i18next.t('模型价格 {{symbol}}{{price}} / 次', {
          symbol,
          price: (modelPrice * rate).toFixed(6),
        }),
        getGroupRatioText(groupRatio, user_group_ratio),
      ]);
    }

    const parts = [
      i18next.t('输入价格 {{symbol}}{{price}} / 1M tokens', {
        symbol,
        price: (modelRatio * 2.0 * rate).toFixed(6),
      }),
      i18next.t('补全价格 {{symbol}}{{price}} / 1M tokens', {
        symbol,
        price: (modelRatio * 2.0 * completionRatio * rate).toFixed(6),
      }),
      i18next.t('缓存读取价格 {{symbol}}{{price}} / 1M tokens', {
        symbol,
        price: (modelRatio * 2.0 * cacheRatio * rate).toFixed(6),
      }),
    ];
    const hasSplitCacheCreation =
      cacheCreationTokens5m > 0 || cacheCreationTokens1h > 0;
    appendPricePart(
      parts,
      hasSplitCacheCreation && cacheCreationTokens5m > 0,
      '5m缓存创建价格 {{symbol}}{{price}} / 1M tokens',
      {
        symbol,
        price: (modelRatio * 2.0 * cacheCreationRatio5m * rate).toFixed(6),
      },
    );
    appendPricePart(
      parts,
      hasSplitCacheCreation && cacheCreationTokens1h > 0,
      '1h缓存创建价格 {{symbol}}{{price}} / 1M tokens',
      {
        symbol,
        price: (modelRatio * 2.0 * cacheCreationRatio1h * rate).toFixed(6),
      },
    );
    appendPricePart(
      parts,
      !hasSplitCacheCreation,
      '缓存创建价格 {{symbol}}{{price}} / 1M tokens',
      {
        symbol,
        price: (modelRatio * 2.0 * cacheCreationRatio * rate).toFixed(6),
      },
    );
    parts.push(getGroupRatioText(groupRatio, user_group_ratio));
    return joinBillingSummary(parts);
  }

  if (modelPrice !== -1) {
    return i18next.t('模型价格 {{symbol}}{{price}}，{{ratioType}} {{ratio}}', {
      symbol: symbol,
      price: (modelPrice * rate).toFixed(6),
      ratioType: ratioLabel,
      ratio: groupRatio,
    });
  } else {
    const hasSplitCacheCreation =
      cacheCreationTokens5m > 0 || cacheCreationTokens1h > 0;
    const shouldShowCacheCreation5m =
      hasSplitCacheCreation && cacheCreationTokens5m > 0;
    const shouldShowCacheCreation1h =
      hasSplitCacheCreation && cacheCreationTokens1h > 0;

    let cacheCreationPart = null;
    if (hasSplitCacheCreation) {
      if (shouldShowCacheCreation5m && shouldShowCacheCreation1h) {
        cacheCreationPart = i18next.t(
          '缓存创建倍率 5m {{cacheCreationRatio5m}} / 1h {{cacheCreationRatio1h}}',
          {
            cacheCreationRatio5m,
            cacheCreationRatio1h,
          },
        );
      } else if (shouldShowCacheCreation5m) {
        cacheCreationPart = i18next.t(
          '缓存创建倍率 5m {{cacheCreationRatio5m}}',
          {
            cacheCreationRatio5m,
          },
        );
      } else if (shouldShowCacheCreation1h) {
        cacheCreationPart = i18next.t(
          '缓存创建倍率 1h {{cacheCreationRatio1h}}',
          {
            cacheCreationRatio1h,
          },
        );
      }
    }

    if (!cacheCreationPart) {
      cacheCreationPart = i18next.t('缓存创建倍率 {{cacheCreationRatio}}', {
        cacheCreationRatio,
      });
    }

    const parts = [
      i18next.t('模型倍率 {{modelRatio}}', { modelRatio }),
      i18next.t('输出倍率 {{completionRatio}}', { completionRatio }),
      i18next.t('缓存倍率 {{cacheRatio}}', { cacheRatio }),
      cacheCreationPart,
      i18next.t('{{ratioType}} {{ratio}}', {
        ratioType: ratioLabel,
        ratio: groupRatio,
      }),
    ];

    return parts.join('，');
  }
}

// 已统一至 renderModelPriceSimple，若仍有遗留引用，请改为传入 provider='claude'

/**
 * rehype 插件：将段落等文本节点拆分为逐词 <span>，并添加淡入动画 class。
 * 仅在流式渲染阶段使用，避免已渲染文字重复动画。
 */
export function rehypeSplitWordsIntoSpans(options = {}) {
  const { previousContentLength = 0 } = options;

  return (tree) => {
    let currentCharCount = 0; // 当前已处理的字符数

    visit(tree, 'element', (node) => {
      if (
        ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'strong'].includes(
          node.tagName,
        ) &&
        node.children
      ) {
        const newChildren = [];
        node.children.forEach((child) => {
          if (child.type === 'text') {
            try {
              // 使用 Intl.Segmenter 精准拆分中英文及标点
              const segmenter = new Intl.Segmenter('zh', {
                granularity: 'word',
              });
              const segments = segmenter.segment(child.value);

              Array.from(segments)
                .map((seg) => seg.segment)
                .filter(Boolean)
                .forEach((word) => {
                  const wordStartPos = currentCharCount;
                  const wordEndPos = currentCharCount + word.length;

                  // 判断这个词是否是新增的（在 previousContentLength 之后）
                  const isNewContent = wordStartPos >= previousContentLength;

                  newChildren.push({
                    type: 'element',
                    tagName: 'span',
                    properties: {
                      className: isNewContent ? ['animate-fade-in'] : [],
                    },
                    children: [{ type: 'text', value: word }],
                  });

                  currentCharCount = wordEndPos;
                });
            } catch (_) {
              // Fallback：如果浏览器不支持 Segmenter
              const textStartPos = currentCharCount;
              const isNewContent = textStartPos >= previousContentLength;

              if (isNewContent) {
                // 新内容，添加动画
                newChildren.push({
                  type: 'element',
                  tagName: 'span',
                  properties: {
                    className: ['animate-fade-in'],
                  },
                  children: [{ type: 'text', value: child.value }],
                });
              } else {
                // 旧内容，不添加动画
                newChildren.push(child);
              }

              currentCharCount += child.value.length;
            }
          } else {
            newChildren.push(child);
          }
        });
        node.children = newChildren;
      }
    });
  };
}
