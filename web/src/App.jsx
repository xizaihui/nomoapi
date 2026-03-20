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

import React, { lazy, Suspense, useContext, useMemo } from 'react';
import { Route, Routes, useLocation, useParams } from 'react-router-dom';
import Loading from './components/common/ui/Loading';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AuthRedirect, PrivateRoute, AdminRoute } from './helpers';
import { StatusContext } from './context/Status';
import SetupCheck from './components/layout/SetupCheck';

// Core pages — static imports (always needed or very small)
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';

// Lazy import with auto-retry: if chunk fetch fails (e.g. after deploy),
// reload the page once to get fresh asset references.
function lazyRetry(importFn) {
  return lazy(() =>
    importFn().catch((err) => {
      const key = 'chunk_reload';
      const lastReload = sessionStorage.getItem(key);
      const now = Date.now();
      // Only auto-reload once per 30 seconds to avoid infinite loops
      if (!lastReload || now - Number(lastReload) > 30000) {
        sessionStorage.setItem(key, String(now));
        window.location.reload();
        return new Promise(() => {}); // Never resolves — page is reloading
      }
      throw err; // Already retried recently, let ErrorBoundary handle it
    })
  );
}

// Lazy-loaded pages — split into separate chunks
const Home = lazyRetry(() => import('./pages/Home'));
const Dashboard = lazyRetry(() => import('./pages/Dashboard'));
const About = lazyRetry(() => import('./pages/About'));
const UserAgreement = lazyRetry(() => import('./pages/UserAgreement'));
const PrivacyPolicy = lazyRetry(() => import('./pages/PrivacyPolicy'));
const Setup = lazyRetry(() => import('./pages/Setup'));
const User = lazyRetry(() => import('./pages/User'));
const Setting = lazyRetry(() => import('./pages/Setting'));
const Channel = lazyRetry(() => import('./pages/Channel'));
const Token = lazyRetry(() => import('./pages/Token'));
const Redemption = lazyRetry(() => import('./pages/Redemption'));
const TopUp = lazyRetry(() => import('./pages/TopUp'));
const Log = lazyRetry(() => import('./pages/Log'));
const Chat = lazyRetry(() => import('./pages/Chat'));
const Chat2Link = lazyRetry(() => import('./pages/Chat2Link'));
const Midjourney = lazyRetry(() => import('./pages/Midjourney'));
const Pricing = lazyRetry(() => import('./pages/Pricing'));
const Task = lazyRetry(() => import('./pages/Task'));
const ModelPage = lazyRetry(() => import('./pages/Model'));
const ModelDeploymentPage = lazyRetry(() => import('./pages/ModelDeployment'));
const Subscription = lazyRetry(() => import('./pages/Subscription'));
const PersonalSetting = lazyRetry(() => import('./components/settings/PersonalSetting'));
const PasswordResetForm = lazyRetry(() => import('./components/auth/PasswordResetForm'));
const PasswordResetConfirm = lazyRetry(() => import('./components/auth/PasswordResetConfirm'));
const OAuth2Callback = lazyRetry(() => import('./components/auth/OAuth2Callback'));

// 审计模块（独立功能，不影响上游）
const AuditLogsPage = lazyRetry(() => import('./features/audit/pages/AuditLogsPage'));
const AuditRulesPage = lazyRetry(() => import('./features/audit/pages/AuditRulesPage'));
const AuditRetentionPage = lazyRetry(() => import('./features/audit/pages/AuditRetentionPage'));

function DynamicOAuth2Callback() {
  const { provider } = useParams();
  return <OAuth2Callback type={provider} />;
}

function App() {
  const location = useLocation();
  const [statusState] = useContext(StatusContext);

  // 获取模型广场权限配置
  const pricingRequireAuth = useMemo(() => {
    const headerNavModulesConfig = statusState?.status?.HeaderNavModules;
    if (headerNavModulesConfig) {
      try {
        const modules = JSON.parse(headerNavModulesConfig);

        // 处理向后兼容性：如果pricing是boolean，默认不需要登录
        if (typeof modules.pricing === 'boolean') {
          return false; // 默认不需要登录鉴权
        }

        // 如果是对象格式，使用requireAuth配置
        return modules.pricing?.requireAuth === true;
      } catch (error) {
        console.error('解析顶栏模块配置失败:', error);
        return false; // 默认不需要登录
      }
    }
    return false; // 默认不需要登录
  }, [statusState?.status?.HeaderNavModules]);

  return (
    <SetupCheck>
      <ErrorBoundary>
      <Routes>
        <Route
          path='/'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path='/setup'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <Setup />
            </Suspense>
          }
        />
        <Route path='/forbidden' element={<Forbidden />} />
        <Route
          path='/console/models'
          element={
            <AdminRoute>
              <Suspense fallback={<Loading />}>
                <ModelPage />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route
          path='/console/deployment'
          element={
            <AdminRoute>
              <Suspense fallback={<Loading />}>
                <ModelDeploymentPage />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route
          path='/console/subscription'
          element={
            <AdminRoute>
              <Suspense fallback={<Loading />}>
                <Subscription />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route
          path='/console/channel'
          element={
            <AdminRoute>
              <Suspense fallback={<Loading />}>
                <Channel />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route
          path='/console/token'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading />}>
                <Token />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/console/redemption'
          element={
            <AdminRoute>
              <Suspense fallback={<Loading />}>
                <Redemption />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route
          path='/console/user'
          element={
            <AdminRoute>
              <Suspense fallback={<Loading />}>
                <User />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route
          path='/user/reset'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <PasswordResetConfirm />
            </Suspense>
          }
        />
        <Route
          path='/login'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <AuthRedirect>
                <LoginForm />
              </AuthRedirect>
            </Suspense>
          }
        />
        <Route
          path='/register'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <AuthRedirect>
                <RegisterForm />
              </AuthRedirect>
            </Suspense>
          }
        />
        <Route
          path='/reset'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <PasswordResetForm />
            </Suspense>
          }
        />
        <Route
          path='/oauth/github'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <OAuth2Callback type='github'></OAuth2Callback>
            </Suspense>
          }
        />
        <Route
          path='/oauth/discord'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <OAuth2Callback type='discord'></OAuth2Callback>
            </Suspense>
          }
        />
        <Route
          path='/oauth/oidc'
          element={
            <Suspense fallback={<Loading></Loading>}>
              <OAuth2Callback type='oidc'></OAuth2Callback>
            </Suspense>
          }
        />
        <Route
          path='/oauth/linuxdo'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <OAuth2Callback type='linuxdo'></OAuth2Callback>
            </Suspense>
          }
        />
        <Route
          path='/oauth/:provider'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <DynamicOAuth2Callback />
            </Suspense>
          }
        />
        <Route
          path='/console/setting'
          element={
            <AdminRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Setting />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route
          path='/console/personal'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <PersonalSetting />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/console/topup'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <TopUp />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/console/log'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading />}>
                <Log />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/console'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Dashboard />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/console/midjourney'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Midjourney />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/console/task'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Task />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/pricing'
          element={
            pricingRequireAuth ? (
              <PrivateRoute>
                <Suspense
                  fallback={<Loading></Loading>}
                  key={location.pathname}
                >
                  <Pricing />
                </Suspense>
              </PrivateRoute>
            ) : (
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Pricing />
              </Suspense>
            )
          }
        />
        <Route
          path='/about'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <About />
            </Suspense>
          }
        />
        <Route
          path='/user-agreement'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <UserAgreement />
            </Suspense>
          }
        />
        <Route
          path='/privacy-policy'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <PrivacyPolicy />
            </Suspense>
          }
        />
        <Route
          path='/console/chat/:id?'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <Chat />
            </Suspense>
          }
        />
        {/* 方便使用chat2link直接跳转聊天... */}
        <Route
          path='/chat2link'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Chat2Link />
              </Suspense>
            </PrivateRoute>
          }
        />
        {/* 审计模块路由（独立功能，不影响上游） */}
        <Route
          path='/console/audit-logs'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <AuditLogsPage />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/console/audit-rules'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <AuditRulesPage />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/console/audit-retention'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <AuditRetentionPage />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route path='*' element={<NotFound />} />
      </Routes>
      </ErrorBoundary>
    </SetupCheck>
  );
}

export default App;
