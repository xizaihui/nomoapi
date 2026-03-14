// Compat barrel: re-exports all Semi Design compat components
// This module is aliased from '@douyinfe/semi-ui' via vite.config.js

// --- Fully migrated to shadcn/ui ---
export { Button } from './Button';
export { Input, TextArea } from './Input';
export { InputNumber } from './InputNumber';
export { Select } from './Select';
export { Modal } from './Modal';
export { Toast, Notification } from './Toast';
export { Typography } from './Typography';
export { Card } from './Card';
export { Avatar } from './Avatar';
export { Tag } from './Tag';
export { Badge } from './Badge';
export { Banner } from './Banner';
export { Spin } from './Spin';
export { Empty } from './Empty';
export { Space } from './Space';
export { Row, Col } from './Layout';
export { Dropdown } from './Dropdown';
export { Checkbox } from './Checkbox';
export { Radio, RadioGroup } from './Radio';
export { Switch } from './Switch';
export { Skeleton } from './Skeleton';
export { Tooltip } from './Tooltip';
export { Popover } from './Popover';
export { Popconfirm } from './Popconfirm';
export { Progress } from './Progress';
export { Divider } from './Divider';
export { Descriptions } from './Descriptions';
export { Pagination } from './Pagination';
export { SideSheet } from './SideSheet';
export { Steps } from './Steps';
export { Tabs, TabPane } from './Tabs';

// --- Not yet migrated: pass through from real Semi ---
// These are low-usage components that still need compat wrappers.
// As each gets migrated, move it above.
export {
  Chat,
  Collapse,
  Form,
  Image,
  ImagePreview,
  Layout,
  LocaleProvider,
  Nav,
  Slider,
  Table,
  Timeline,
  Icon,
} from '@douyinfe/semi-ui__real';
