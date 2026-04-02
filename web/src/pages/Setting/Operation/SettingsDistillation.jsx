import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API, showError, showSuccess } from '../../../helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Badge } from '../../../components/ui/badge';

const SettingsDistillation = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [intervalStd, setIntervalStd] = useState('500');
  const [maxTokensWindow, setMaxTokensWindow] = useState('100');
  const [intervalsWindow, setIntervalsWindow] = useState('100');
  const [alertThreshold, setAlertThreshold] = useState('3');
  const [whitelist, setWhitelist] = useState([]);
  const [newWhitelistId, setNewWhitelistId] = useState('');
  const [alerts, setAlerts] = useState([]);

  const loadSettings = async () => {
    try {
      const res = await API.get('/api/option/');
      const { success, data } = res.data;
      if (success && Array.isArray(data)) {
        const optMap = {};
        data.forEach((item) => { optMap[item.key] = item.value; });
        setEnabled(optMap.DistillationDetectionEnabled === 'true');
        if (optMap.DistillationIntervalStdThreshold) setIntervalStd(optMap.DistillationIntervalStdThreshold);
        if (optMap.DistillationMaxTokensWindow) setMaxTokensWindow(optMap.DistillationMaxTokensWindow);
        if (optMap.DistillationIntervalsWindow) setIntervalsWindow(optMap.DistillationIntervalsWindow);
        if (optMap.DistillationAlertThreshold) setAlertThreshold(optMap.DistillationAlertThreshold);
      }
    } catch (error) {
      // settings may not exist yet
    }
  };

  const loadWhitelist = async () => {
    try {
      const res = await API.get('/api/distillation/whitelist');
      if (res.data.success) setWhitelist(res.data.data || []);
    } catch (error) { /* ignore */ }
  };

  const loadAlerts = async () => {
    try {
      const res = await API.get('/api/distillation/alerts');
      if (res.data.success) setAlerts(res.data.data || []);
    } catch (error) { /* ignore */ }
  };

  useEffect(() => {
    loadSettings();
    loadWhitelist();
    loadAlerts();
  }, []);

  const saveOption = async (key, value) => {
    return API.put('/api/option/', { key, value: String(value) });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveOption('DistillationDetectionEnabled', enabled ? 'true' : 'false');
      await saveOption('DistillationIntervalStdThreshold', intervalStd);
      await saveOption('DistillationMaxTokensWindow', maxTokensWindow);
      await saveOption('DistillationIntervalsWindow', intervalsWindow);
      await saveOption('DistillationAlertThreshold', alertThreshold);
      showSuccess(t('保存成功'));
    } catch (error) {
      showError(t('保存失败'));
    } finally {
      setLoading(false);
    }
  };

  const addToWhitelist = async () => {
    if (!newWhitelistId || isNaN(Number(newWhitelistId))) {
      showError('请输入有效的 Token ID');
      return;
    }
    try {
      const res = await API.post('/api/distillation/whitelist', { token_id: Number(newWhitelistId) });
      if (res.data.success) {
        showSuccess('已添加到白名单');
        setNewWhitelistId('');
        loadWhitelist();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('添加失败');
    }
  };

  const removeFromWhitelist = async (id) => {
    try {
      const res = await API.delete(`/api/distillation/whitelist/${id}`);
      if (res.data.success) {
        showSuccess('已移除');
        loadWhitelist();
      }
    } catch (error) {
      showError('移除失败');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('蒸馏检测')}</CardTitle>
              <CardDescription>
                {t('检测并自动禁用疑似进行模型蒸馏的 API Key')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="distill-enabled" className="text-sm">
                {enabled ? '已启用' : '已关闭'}
              </Label>
              <Switch
                id="distill-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 检测指标配置 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{t('检测指标')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">{t('请求间隔标准差阈值 (ms)')}</Label>
                <Input
                  type="number"
                  value={intervalStd}
                  onChange={(e) => setIntervalStd(e.target.value)}
                  placeholder="500"
                />
                <p className="text-xs text-muted-foreground">
                  {t('低于此值视为机器人行为，默认 500ms')}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t('max_tokens 检测窗口')}</Label>
                <Input
                  type="number"
                  value={maxTokensWindow}
                  onChange={(e) => setMaxTokensWindow(e.target.value)}
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground">
                  {t('连续 N 次 max_tokens 完全相同则触发，默认 100')}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t('间隔检测窗口')}</Label>
                <Input
                  type="number"
                  value={intervalsWindow}
                  onChange={(e) => setIntervalsWindow(e.target.value)}
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground">
                  {t('分析最近 N 次请求的间隔，默认 100')}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t('自动禁用阈值')}</Label>
                <Input
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  placeholder="3"
                />
                <p className="text-xs text-muted-foreground">
                  {t('累计告警 N 次后自动禁用 Key，默认 3')}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} size="sm">
            {loading ? t('保存中...') : t('保存配置')}
          </Button>

          {/* 检测规则说明 */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-medium">{t('检测规则')}</p>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>{t('指标1：请求间隔标准差低于阈值（机器人均匀发送）')}</li>
              <li>{t('指标2：连续 N 次请求的 max_tokens 完全相同（模板化采集）')}</li>
              <li><strong>{t('两个指标同时触发才计为一次告警')}</strong></li>
              <li>{t('累计达到阈值后自动禁用该 Key，不影响同用户其他 Key')}</li>
              <li>{t('白名单中的 Key 跳过检测')}</li>
              <li>{t('需要 Redis 支持')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 白名单 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('白名单')}</CardTitle>
          <CardDescription>{t('白名单中的 Token 跳过蒸馏检测')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              value={newWhitelistId}
              onChange={(e) => setNewWhitelistId(e.target.value)}
              placeholder="Token ID"
              className="w-40"
            />
            <Button size="sm" onClick={addToWhitelist}>{t('添加')}</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {whitelist.length === 0 && (
              <p className="text-xs text-muted-foreground">{t('白名单为空')}</p>
            )}
            {whitelist.map((id) => (
              <Badge key={id} variant="secondary" className="gap-1 pr-1">
                Token #{id}
                <button
                  className="ml-1 hover:text-destructive text-xs"
                  onClick={() => removeFromWhitelist(id)}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 当前告警 */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('当前告警')}</CardTitle>
            <CardDescription>{t('活跃的蒸馏检测告警（24小时内）')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.token_id} className="flex items-center justify-between border border-border rounded-md p-3">
                  <div>
                    <span className="text-sm font-medium">Token #{alert.token_id}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      告警次数: {alert.alert_count}
                    </span>
                  </div>
                  <Badge variant={alert.alert_count >= Number(alertThreshold) ? 'destructive' : 'outline'}>
                    {alert.alert_count >= Number(alertThreshold) ? '已禁用' : '告警中'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsDistillation;
