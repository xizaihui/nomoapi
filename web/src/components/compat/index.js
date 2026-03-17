// Compat barrel: re-exports all Semi Design compat components
// This module is aliased from '@douyinfe/semi-ui' via vite.config.js

// --- Fully migrated to shadcn/ui ---
export { Button } from './Button';
export { Input, TextArea } from './Input';
export { InputNumber } from './InputNumber';
export { InputGroup } from './InputGroup';
export { Select } from './Select';
export { Modal } from './Modal';
export { Toast, Notification } from './Toast';
export { Typography } from './Typography';
export { Card } from './Card';
export { Avatar } from './Avatar';
export { AvatarGroup } from './AvatarGroup';
export { Tag } from './Tag';
export { TagInput } from './TagInput';
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
export { Collapsible } from './Collapsible';
export { Highlight } from './Highlight';
export { SplitButtonGroup } from './SplitButtonGroup';
export { List } from './List';
export { ScrollList, ScrollItem } from './ScrollList';

// --- Complex components: pass through from real Semi ---
export { DatePicker } from './DatePicker';
export { Calendar } from './Calendar';
export { Layout } from './SemiLayout';
export { Nav } from './Nav';
export { Icon } from './Icon';
export { Collapse } from './Collapse';
export { Slider } from './Slider';
export { Timeline } from './Timeline';
export { Image, ImagePreview } from './Image';
export { LocaleProvider } from './LocaleProvider';
// Chat: re-export from real Semi (only used by Playground ChatArea)
export { Chat } from '@douyinfe/semi-ui__real';
export { Form } from './Form';
export { Table } from './Table';
