/*
 * LobeHub dynamic icon resolver — separated from render.jsx to avoid
 * `import * as LobeIcons` polluting the main bundle via tree-shaking bypass.
 * Only pages that actually need dynamic icon lookup (Models, Pricing) import this.
 */
import * as LobeIcons from '@lobehub/icons';
import { Avatar } from '@douyinfe/semi-ui';

/**
 * 根据名称获取 LobeHub 图标
 * @param {string} iconName - 图标名称，支持点号链式如 'OpenAI.Avatar.type={platform}'
 * @param {number} size - 图标大小，默认为 14
 * @returns {JSX.Element}
 */
export function getLobeHubIcon(iconName, size = 14) {
  if (typeof iconName === 'string') iconName = iconName.trim();
  if (!iconName) {
    return <Avatar size='extra-extra-small'>?</Avatar>;
  }

  const segments = String(iconName).split('.');
  const baseKey = segments[0];
  const BaseIcon = LobeIcons[baseKey];

  let IconComponent = undefined;
  let propStartIndex = 1;

  if (BaseIcon && segments.length > 1 && BaseIcon[segments[1]]) {
    IconComponent = BaseIcon[segments[1]];
    propStartIndex = 2;
  } else {
    IconComponent = LobeIcons[baseKey];
    propStartIndex = 1;
  }

  if (
    !IconComponent ||
    (typeof IconComponent !== 'function' && typeof IconComponent !== 'object')
  ) {
    const firstLetter = String(iconName).charAt(0).toUpperCase();
    return <Avatar size='extra-extra-small'>{firstLetter}</Avatar>;
  }

  const props = {};

  const parseValue = (raw) => {
    if (raw == null) return true;
    let v = String(raw).trim();
    if (v.startsWith('{') && v.endsWith('}')) {
      v = v.slice(1, -1).trim();
    }
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      return v.slice(1, -1);
    }
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v !== '' && Number.isFinite(Number(v))) return Number(v);
    return v;
  };

  for (let i = propStartIndex; i < segments.length; i++) {
    const seg = segments[i];
    const eqIndex = seg.indexOf('=');
    if (eqIndex === -1) {
      props[seg] = true;
    } else {
      props[seg.slice(0, eqIndex)] = parseValue(seg.slice(eqIndex + 1));
    }
  }

  props.size = size;

  return <IconComponent {...props} />;
}
