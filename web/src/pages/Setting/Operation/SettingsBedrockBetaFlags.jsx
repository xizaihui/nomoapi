import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API, showError, showSuccess } from '../../../helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';

const SettingsBedrockBetaFlags = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState('');
  const [unsupported, setUnsupported] = useState('');

  const loadSettings = async () => {
    try {
      const res = await API.get('/api/option/');
      const { success, data } = res.data;
      if (success) {
        setSupported(data.BedrockBetaFlagsSupported || getDefaultSupported());
        setUnsupported(data.BedrockBetaFlagsUnsupported || getDefaultUnsupported());
      }
    } catch (error) {
      showError(t('加载设置失败'));
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const getDefaultSupported = () => {
    return `computer-use-2025-01-24
max-tokens-3-5-sonnet-2022-07-15
messages-2023-12-15
tools-2024-04-04
tools-2024-05-16`;
  };

  const getDefaultUnsupported = () => {
    return `context-management
prompt-caching-scope
prompt-caching
extended-thinking`;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save supported flags
      const res1 = await API.put('/api/option/', {
        key: 'BedrockBetaFlagsSupported',
        value: supported,
      });
      
      // Save unsupported flags
      const res2 = await API.put('/api/option/', {
        key: 'BedrockBetaFlagsUnsupported',
        value: unsupported,
      });

      if (res1.data.success && res2.data.success) {
        showSuccess(t('保存成功'));
        // Don't reload - keep current values
      } else {
        showError(res1.data.message || res2.data.message || t('保存失败'));
      }
    } catch (error) {
      showError(t('保存失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('AWS Bedrock Beta Flags 配置')}</CardTitle>
          <CardDescription>
            {t('配置 AWS Bedrock 支持和不支持的 Anthropic beta flags。每行一个 flag，以 # 开头的行为注释。')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="supported">{t('支持的 Beta Flags（白名单）')}</Label>
            <Textarea
              id="supported"
              value={supported}
              onChange={(e) => setSupported(e.target.value)}
              placeholder={getDefaultSupported()}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {t('这些 beta flags 会被发送给 Bedrock')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unsupported">{t('不支持的 Beta Flags（黑名单）')}</Label>
            <Textarea
              id="unsupported"
              value={unsupported}
              onChange={(e) => setUnsupported(e.target.value)}
              placeholder={getDefaultUnsupported()}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {t('这些 beta flags 会被过滤掉，不发送给 Bedrock')}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? t('保存中...') : t('保存设置')}
            </Button>
            <Button variant="outline" onClick={loadSettings} disabled={loading}>
              {t('重置')}
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{t('说明')}</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t('白名单中的 flags 会被允许发送给 Bedrock')}</li>
              <li>{t('黑名单中的 flags 会被强制过滤')}</li>
              <li>{t('未在任何列表中的 flags 默认会被拒绝（保守策略）')}</li>
              <li>{t('被过滤的 flags 会记录到系统日志中')}</li>
              <li>{t('修改后立即生效，无需重启服务')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsBedrockBetaFlags;
