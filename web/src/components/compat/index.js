// Compat barrel: re-exports all Semi Design compat components
// This module is aliased from '@douyinfe/semi-ui' via vite.config.js

export { Button } from './Button';
export { Input, TextArea } from './Input';
export { Select } from './Select';
export { Modal } from './Modal';
export { Toast, Notification } from './Toast';

// --- Pass-through stubs for components not yet migrated ---
// These re-export from the real Semi package during transition.
// As each component gets a compat wrapper, move it above.

// To enable gradual migration, we re-export everything else from real semi
// The alias in vite only kicks in for this file, so we use a direct path
export {
  Avatar,
  Badge,
  Banner,
  Card,
  Chat,
  Checkbox,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Dropdown,
  Empty,
  Form,
  Image,
  ImagePreview,
  InputNumber,
  Layout,
  LocaleProvider,
  Nav,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  Radio,
  RadioGroup,
  Row,
  SideSheet,
  Skeleton,
  Slider,
  Space,
  Spin,
  Steps,
  Switch,
  TabPane,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
  Icon,
} from '@douyinfe/semi-ui__real';
