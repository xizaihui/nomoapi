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

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLucideIcon } from '../../helpers/render';
import { ChevronLeft } from 'lucide-react';
import { useSidebarCollapsed } from '../../hooks/common/useSidebarCollapsed';
import { useSidebar } from '../../hooks/common/useSidebar';
import { useMinimumLoadingTime } from '../../hooks/common/useMinimumLoadingTime';
import { isAdmin, isRoot, showError } from '../../helpers';
import { fetchAuditStatus } from '../../features/audit/api';
import SkeletonWrapper from './components/SkeletonWrapper';

import { Divider, Button } from '@douyinfe/semi-ui';

const routerMap = {
  home: '/',
  channel: '/console/channel',
  token: '/console/token',
  redemption: '/console/redemption',
  topup: '/console/topup',
  user: '/console/user',
  subscription: '/console/subscription',
  log: '/console/log',
  midjourney: '/console/midjourney',
  setting: '/console/setting',
  about: '/about',
  detail: '/console',
  pricing: '/pricing',
  task: '/console/task',
  models: '/console/models',
  deployment: '/console/deployment',
  personal: '/console/personal',
  // 审计模块（独立，不影响上游）
  'audit-logs': '/console/audit-logs',
  'audit-rules': '/console/audit-rules',
};

const SiderBar = ({ onNavigate = () => {} }) => {
  const { t } = useTranslation();
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const {
    isModuleVisible,
    hasSectionVisibleModules,
    loading: sidebarLoading,
  } = useSidebar();

  const showSkeleton = useMinimumLoadingTime(sidebarLoading, 200);

  const [selectedKeys, setSelectedKeys] = useState(['home']);
  const [chatItems, setChatItems] = useState([]);
  const [openedKeys, setOpenedKeys] = useState([]);
  const location = useLocation();
  const [routerMapState, setRouterMapState] = useState(routerMap);
  const [auditEnabled, setAuditEnabled] = useState(false);

  // 检查审计权限
  useEffect(() => {
    fetchAuditStatus().then((res) => {
      if (res?.success) setAuditEnabled(res.data?.audit_enabled || res.data?.is_admin);
    }).catch(() => {});
  }, []);

  const workspaceItems = useMemo(() => {
    const items = [
      {
        text: t('概况预览'),
        itemKey: 'detail',
        to: '/detail',
        className:
          localStorage.getItem('enable_data_export') === 'true'
            ? ''
            : 'tableHiddle',
      },
      {
        text: t('令牌管理'),
        itemKey: 'token',
        to: '/token',
      },
      {
        text: t('日志详情'),
        itemKey: 'log',
        to: '/log',
      },
      {
        text: t('绘图日志'),
        itemKey: 'midjourney',
        to: '/midjourney',
        className:
          localStorage.getItem('enable_drawing') === 'true'
            ? ''
            : 'tableHiddle',
      },
      {
        text: t('任务日志'),
        itemKey: 'task',
        to: '/task',
        className:
          localStorage.getItem('enable_task') === 'true' ? '' : 'tableHiddle',
      },
    ];

    // 根据配置过滤项目
    const filteredItems = items.filter((item) => {
      const configVisible = isModuleVisible('console', item.itemKey);
      return configVisible;
    });

    return filteredItems;
  }, [
    localStorage.getItem('enable_data_export'),
    localStorage.getItem('enable_drawing'),
    localStorage.getItem('enable_task'),
    t,
    isModuleVisible,
  ]);

  const financeItems = useMemo(() => {
    const items = [
      {
        text: t('钱包管理'),
        itemKey: 'topup',
        to: '/topup',
      },
      {
        text: t('个人设置'),
        itemKey: 'personal',
        to: '/personal',
      },
    ];

    // 根据配置过滤项目
    const filteredItems = items.filter((item) => {
      const configVisible = isModuleVisible('personal', item.itemKey);
      return configVisible;
    });

    return filteredItems;
  }, [t, isModuleVisible]);

  const adminItems = useMemo(() => {
    const items = [
      {
        text: t('渠道管理'),
        itemKey: 'channel',
        to: '/channel',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('订阅管理'),
        itemKey: 'subscription',
        to: '/subscription',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('模型管理'),
        itemKey: 'models',
        to: '/console/models',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('模型部署'),
        itemKey: 'deployment',
        to: '/deployment',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('兑换码管理'),
        itemKey: 'redemption',
        to: '/redemption',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('用户管理'),
        itemKey: 'user',
        to: '/user',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('系统设置'),
        itemKey: 'setting',
        to: '/setting',
        className: isRoot() ? '' : 'tableHiddle',
      },
    ];

    // 根据配置过滤项目
    const filteredItems = items.filter((item) => {
      const configVisible = isModuleVisible('admin', item.itemKey);
      return configVisible;
    });

    return filteredItems;
  }, [isAdmin(), isRoot(), t, isModuleVisible]);

  const chatMenuItems = useMemo(() => {
    const items = [
      {
        text: t('聊天'),
        itemKey: 'chat',
        items: chatItems,
      },
    ];

    // 根据配置过滤项目
    const filteredItems = items.filter((item) => {
      const configVisible = isModuleVisible('chat', item.itemKey);
      return configVisible;
    });

    return filteredItems;
  }, [chatItems, t, isModuleVisible]);

  // 更新路由映射，添加聊天路由
  const updateRouterMapWithChats = (chats) => {
    const newRouterMap = { ...routerMap };

    if (Array.isArray(chats) && chats.length > 0) {
      for (let i = 0; i < chats.length; i++) {
        newRouterMap['chat' + i] = '/console/chat/' + i;
      }
    }

    setRouterMapState(newRouterMap);
    return newRouterMap;
  };

  // 加载聊天项
  useEffect(() => {
    let chats = localStorage.getItem('chats');
    if (chats) {
      try {
        chats = JSON.parse(chats);
        if (Array.isArray(chats)) {
          let chatItems = [];
          for (let i = 0; i < chats.length; i++) {
            let shouldSkip = false;
            let chat = {};
            for (let key in chats[i]) {
              let link = chats[i][key];
              if (typeof link !== 'string') continue; // 确保链接是字符串
              if (link.startsWith('fluent') || link.startsWith('ccswitch')) {
                shouldSkip = true;
                break;
              }
              chat.text = key;
              chat.itemKey = 'chat' + i;
              chat.to = '/console/chat/' + i;
            }
            if (shouldSkip || !chat.text) continue; // 避免推入空项
            chatItems.push(chat);
          }
          setChatItems(chatItems);
          updateRouterMapWithChats(chats);
        }
      } catch (e) {
        showError('聊天数据解析失败');
      }
    }
  }, []);

  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    const currentPath = location.pathname;
    let matchingKey = Object.keys(routerMapState).find(
      (key) => routerMapState[key] === currentPath,
    );

    // 处理聊天路由
    if (!matchingKey && currentPath.startsWith('/console/chat/')) {
      const chatIndex = currentPath.split('/').pop();
      if (!isNaN(chatIndex)) {
        matchingKey = 'chat' + chatIndex;
      } else {
        matchingKey = 'chat';
      }
    }

    // 如果找到匹配的键，更新选中的键
    if (matchingKey) {
      setSelectedKeys([matchingKey]);
    }
  }, [location.pathname, routerMapState]);

  // 监控折叠状态变化以更新 body class
  useEffect(() => {
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [collapsed]);

  // 选中高亮颜色（统一）
  const SELECTED_COLOR = 'hsl(var(--sidebar-primary))';

  // 渲染自定义菜单项
  const renderNavItem = (item) => {
    if (item.className === 'tableHiddle') return null;

    const isSelected = selectedKeys.includes(item.itemKey);
    const to = routerMapState[item.itemKey] || routerMap[item.itemKey];

    const content = (
      <div
        className={`sidebar-nav-item flex items-center gap-2 cursor-pointer ${isSelected ? 'sidebar-nav-item-selected' : ''}`}
        onClick={() => {
          setSelectedKeys([item.itemKey]);
          onNavigate();
        }}
      >
        <div className='sidebar-icon-container flex-shrink-0'>
          {getLucideIcon(item.itemKey, isSelected)}
        </div>
        {!collapsed && (
          <span
            className='truncate font-medium text-sm'
            style={{ color: isSelected ? SELECTED_COLOR : 'inherit' }}
          >
            {item.text}
          </span>
        )}
      </div>
    );

    if (to) {
      return (
        <Link key={item.itemKey} to={to} style={{ textDecoration: 'none' }}>
          {content}
        </Link>
      );
    }
    return <div key={item.itemKey}>{content}</div>;
  };

  // 渲染子菜单项
  const renderSubItem = (item) => {
    if (item.items && item.items.length > 0) {
      const isOpen = openedKeys.includes(item.itemKey);
      const isSelected = selectedKeys.includes(item.itemKey);

      return (
        <div key={item.itemKey}>
          <div
            className={`sidebar-nav-item flex items-center gap-2 cursor-pointer ${isSelected ? 'sidebar-nav-item-selected' : ''}`}
            onClick={() => {
              if (isOpen) {
                setOpenedKeys(openedKeys.filter((k) => k !== item.itemKey));
              } else {
                setOpenedKeys([...openedKeys, item.itemKey]);
              }
            }}
          >
            <div className='sidebar-icon-container flex-shrink-0'>
              {getLucideIcon(item.itemKey, isSelected)}
            </div>
            {!collapsed && (
              <>
                <span
                  className='truncate font-medium text-sm flex-1'
                  style={{ color: isSelected ? SELECTED_COLOR : 'inherit' }}
                >
                  {item.text}
                </span>
                <ChevronLeft
                  size={14}
                  className='transition-transform duration-200 text-muted-foreground'
                  style={{ transform: isOpen ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                />
              </>
            )}
          </div>
          {isOpen && !collapsed && (
            <div className='ml-4'>
              {item.items.map((subItem) => {
                const isSubSelected = selectedKeys.includes(subItem.itemKey);
                const subTo = routerMapState[subItem.itemKey] || routerMap[subItem.itemKey];

                const subContent = (
                  <div
                    className={`sidebar-nav-item flex items-center gap-2 cursor-pointer ${isSubSelected ? 'sidebar-nav-item-selected' : ''}`}
                    onClick={() => {
                      setSelectedKeys([subItem.itemKey]);
                      onNavigate();
                    }}
                  >
                    <span
                      className='truncate font-medium text-sm'
                      style={{ color: isSubSelected ? SELECTED_COLOR : 'inherit' }}
                    >
                      {subItem.text}
                    </span>
                  </div>
                );

                if (subTo) {
                  return (
                    <Link key={subItem.itemKey} to={subTo} style={{ textDecoration: 'none' }}>
                      {subContent}
                    </Link>
                  );
                }
                return <div key={subItem.itemKey}>{subContent}</div>;
              })}
            </div>
          )}
        </div>
      );
    }
    return renderNavItem(item);
  };

  return (
    <div
      className='sidebar-container'
      style={{
        width: 'var(--sidebar-current-width)',
      }}
    >
      <SkeletonWrapper
        loading={showSkeleton}
        type='sidebar'
        className=''
        collapsed={collapsed}
        showAdmin={isAdmin()}
      >
        <div
          className='sidebar-nav'
          style={{ overflowY: 'auto' }}
        >
          {/* 聊天区域 */}
          {hasSectionVisibleModules('chat') && (
            <div className='sidebar-section'>
              {!collapsed && (
                <div className='sidebar-group-label'>{t('聊天')}</div>
              )}
              {chatMenuItems.map((item) => renderSubItem(item))}
            </div>
          )}

          {/* 控制台区域 */}
          {hasSectionVisibleModules('console') && (
            <>
              <Divider className='sidebar-divider' />
              <div>
                {!collapsed && (
                  <div className='sidebar-group-label'>{t('控制台')}</div>
                )}
                {workspaceItems.map((item) => renderNavItem(item))}
              </div>
            </>
          )}

          {/* 个人中心区域 */}
          {hasSectionVisibleModules('personal') && (
            <>
              <Divider className='sidebar-divider' />
              <div>
                {!collapsed && (
                  <div className='sidebar-group-label'>{t('个人中心')}</div>
                )}
                {financeItems.map((item) => renderNavItem(item))}
              </div>
            </>
          )}

          {/* 管理员区域 */}
          {isAdmin() && hasSectionVisibleModules('admin') && (
            <>
              <Divider className='sidebar-divider' />
              <div>
                {!collapsed && (
                  <div className='sidebar-group-label'>{t('管理员')}</div>
                )}
                {adminItems.map((item) => renderNavItem(item))}
              </div>
            </>
          )}

          {/* 安全审计区域（独立模块，不影响上游） */}
          {auditEnabled && (
            <>
              <Divider className='sidebar-divider' />
              <div>
                {!collapsed && (
                  <div className='sidebar-group-label'>{t('安全审计')}</div>
                )}
                {renderNavItem({ text: t('审计日志'), itemKey: 'audit-logs', to: '/console/audit-logs' })}
                {renderNavItem({ text: t('审计规则'), itemKey: 'audit-rules', to: '/console/audit-rules' })}
              </div>
            </>
          )}
        </div>
      </SkeletonWrapper>

      {/* 底部折叠按钮 */}
      <div className='sidebar-collapse-button'>
        <SkeletonWrapper
          loading={showSkeleton}
          type='button'
          width={collapsed ? 36 : 156}
          height={24}
          className='w-full'
        >
          <Button
            theme='outline'
            type='tertiary'
            size='small'
            icon={
              <ChevronLeft
                size={16}
                strokeWidth={2.5}
                color='hsl(var(--muted-foreground))'
                style={{
                  transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            }
            onClick={toggleCollapsed}
            icononly={collapsed}
            style={
              collapsed
                ? { width: 36, height: 24, padding: 0 }
                : { padding: '4px 12px', width: '100%' }
            }
          >
            {!collapsed ? t('收起侧边栏') : null}
          </Button>
        </SkeletonWrapper>
      </div>
    </div>
  );
};

export default SiderBar;
