// Compat layer: Semi Design Icons → Lucide React icons
import * as React from 'react';
import {
  AlertTriangle,
  Bell,
  Bookmark,
  CalendarClock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Code,
  Columns3,
  Component,
  X,
  CircleDollarSign,
  Copy,
  CreditCard,
  Trash2,
  Download,
  Pencil,
  ExternalLink,
  EyeOff,
  Eye,
  File,
  Filter,
  Gift,
  Github,
  Globe,
  HelpCircle,
  BarChart3,
  Info,
  Key,
  Layers,
  Link,
  Lock,
  LogOut,
  Mail,
  Map,
  Menu,
  Minus,
  MoreHorizontal,
  ArrowLeftRight,
  Play,
  Plus,
  PlusCircle,
  MapPin,
  Activity,
  RefreshCw,
  Save,
  Search,
  Send,
  Server,
  Settings,
  Shield,
  Timer,
  Type,
  ChevronDownSquare,
  User,
  UserPlus,
  Users,
  UserCog,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to wrap lucide icons with Semi-compatible API (size, className, style, onClick, etc.)
const wrapIcon = (LucideIcon, displayName) => {
  const Wrapped = React.forwardRef(({ size = 16, className, style, onClick, ...rest }, ref) => (
    <LucideIcon
      ref={ref}
      size={typeof size === 'string' ? (size === 'small' ? 12 : size === 'large' ? 20 : 16) : size}
      className={cn('inline-block', className)}
      style={style}
      onClick={onClick}
      {...rest}
    />
  ));
  Wrapped.displayName = displayName;
  return Wrapped;
};

export const IconAlertTriangle = wrapIcon(AlertTriangle, 'IconAlertTriangle');
export const IconBell = wrapIcon(Bell, 'IconBell');
export const IconCheckCircleStroked = wrapIcon(CheckCircle, 'IconCheckCircleStroked');
export const IconChevronDown = wrapIcon(ChevronDown, 'IconChevronDown');
export const IconChevronUp = wrapIcon(ChevronUp, 'IconChevronUp');
export const IconClose = wrapIcon(X, 'IconClose');
export const IconCoinMoneyStroked = wrapIcon(CircleDollarSign, 'IconCoinMoneyStroked');
export const IconCopy = wrapIcon(Copy, 'IconCopy');
export const IconCreditCard = wrapIcon(CreditCard, 'IconCreditCard');
export const IconDelete = wrapIcon(Trash2, 'IconDelete');
export const IconDownload = wrapIcon(Download, 'IconDownload');
export const IconEdit = wrapIcon(Pencil, 'IconEdit');
export const IconExternalOpen = wrapIcon(ExternalLink, 'IconExternalOpen');
export const IconEyeClosed = wrapIcon(EyeOff, 'IconEyeClosed');
export const IconEyeOpened = wrapIcon(Eye, 'IconEyeOpened');
export const IconFile = wrapIcon(File, 'IconFile');
export const IconFilter = wrapIcon(Filter, 'IconFilter');
export const IconGift = wrapIcon(Gift, 'IconGift');
export const IconHelpCircle = wrapIcon(HelpCircle, 'IconHelpCircle');
export const IconInfoCircle = wrapIcon(Info, 'IconInfoCircle');
export const IconKey = wrapIcon(Key, 'IconKey');
export const IconLayers = wrapIcon(Layers, 'IconLayers');
export const IconLink = wrapIcon(Link, 'IconLink');
export const IconLock = wrapIcon(Lock, 'IconLock');
export const IconMail = wrapIcon(Mail, 'IconMail');
export const IconMenu = wrapIcon(Menu, 'IconMenu');
export const IconMinus = wrapIcon(Minus, 'IconMinus');
export const IconMore = wrapIcon(MoreHorizontal, 'IconMore');
export const IconPlus = wrapIcon(Plus, 'IconPlus');
export const IconPlusCircle = wrapIcon(PlusCircle, 'IconPlusCircle');
export const IconRefresh = wrapIcon(RefreshCw, 'IconRefresh');
export const IconSave = wrapIcon(Save, 'IconSave');
export const IconSearch = wrapIcon(Search, 'IconSearch');
export const IconUser = wrapIcon(User, 'IconUser');
export const IconUserAdd = wrapIcon(UserPlus, 'IconUserAdd');
export const IconBolt = wrapIcon(Zap, 'IconBolt');
export const IconBookmark = wrapIcon(Bookmark, 'IconBookmark');
export const IconCalendarClock = wrapIcon(CalendarClock, 'IconCalendarClock');
export const IconCode = wrapIcon(Code, 'IconCode');
export const IconExit = wrapIcon(LogOut, 'IconExit');
export const IconGithubLogo = wrapIcon(Github, 'IconGithubLogo');
export const IconGlobe = wrapIcon(Globe, 'IconGlobe');
export const IconHistogram = wrapIcon(BarChart3, 'IconHistogram');
export const IconMap = wrapIcon(Map, 'IconMap');
export const IconMoneyExchangeStroked = wrapIcon(ArrowLeftRight, 'IconMoneyExchangeStroked');
export const IconPlay = wrapIcon(Play, 'IconPlay');
export const IconPosition = wrapIcon(MapPin, 'IconPosition');
export const IconPulse = wrapIcon(Activity, 'IconPulse');
export const IconSaveStroked = wrapIcon(Save, 'IconSaveStroked');
export const IconSend = wrapIcon(Send, 'IconSend');
export const IconServer = wrapIcon(Server, 'IconServer');
export const IconSetting = wrapIcon(Settings, 'IconSetting');
export const IconShield = wrapIcon(Shield, 'IconShield');
export const IconStopwatchStroked = wrapIcon(Timer, 'IconStopwatchStroked');
export const IconTextStroked = wrapIcon(Type, 'IconTextStroked');
export const IconTreeTriangleDown = wrapIcon(ChevronDown, 'IconTreeTriangleDown');
export const IconTypograph = wrapIcon(Type, 'IconTypograph');
export const IconUserGroup = wrapIcon(Users, 'IconUserGroup');
export const IconUserSetting = wrapIcon(UserCog, 'IconUserSetting');
