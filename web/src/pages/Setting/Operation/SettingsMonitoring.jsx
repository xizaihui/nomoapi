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

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Button, Col, Form, Row, Spin } from '@douyinfe/semi-ui';
import {
  API,
  showError,
  showSuccess,
  showWarning,
  parseHttpStatusCodeRules,
} from '../../../helpers';
import { useTranslation } from 'react-i18next';
import HttpStatusCodeRulesInput from '../../../components/settings/HttpStatusCodeRulesInput';

const DEFAULTS = {
  ChannelDisableThreshold: '',
  QuotaRemindThreshold: '',
  AutomaticDisableChannelEnabled: false,
  AutomaticEnableChannelEnabled: false,
  AutomaticDisableKeywords: '',
  AutomaticDisableStatusCodes: '401',
  AutomaticRetryStatusCodes:
    '100-199,300-399,401-407,409-499,500-503,505-523,525-599',
  'monitor_setting.auto_test_channel_enabled': false,
  'monitor_setting.auto_test_channel_minutes': 10,
};

export default function SettingsMonitoring(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const formRef = useRef();
  const savedValuesRef = useRef({ ...DEFAULTS });

  // Track status code fields for live tag preview
  const [disableStatusCodes, setDisableStatusCodes] = useState(DEFAULTS.AutomaticDisableStatusCodes);
  const [retryStatusCodes, setRetryStatusCodes] = useState(DEFAULTS.AutomaticRetryStatusCodes);

  const parsedAutoDisableStatusCodes = parseHttpStatusCodeRules(disableStatusCodes || '');
  const parsedAutoRetryStatusCodes = parseHttpStatusCodeRules(retryStatusCodes || '');

  const getFormValues = useCallback(() => {
    if (!formRef.current) return { ...DEFAULTS };
    return formRef.current.getValues();
  }, []);

  function onSubmit() {
    const currentValues = getFormValues();
    const saved = savedValuesRef.current;

    const changes = [];
    for (const key of Object.keys(DEFAULTS)) {
      const cur = currentValues[key];
      const old = saved[key];
      if (cur !== old) {
        changes.push({ key, oldValue: old, newValue: cur });
      }
    }

    if (!changes.length) return showWarning(t('你似乎并没有修改什么'));

    if (!parsedAutoDisableStatusCodes.ok) {
      const details = parsedAutoDisableStatusCodes.invalidTokens?.length
        ? `: ${parsedAutoDisableStatusCodes.invalidTokens.join(', ')}`
        : '';
      return showError(`${t('自动禁用状态码格式不正确')}${details}`);
    }

    if (!parsedAutoRetryStatusCodes.ok) {
      const details = parsedAutoRetryStatusCodes.invalidTokens?.length
        ? `: ${parsedAutoRetryStatusCodes.invalidTokens.join(', ')}`
        : '';
      return showError(`${t('自动重试状态码格式不正确')}${details}`);
    }

    const normalizedMap = {
      AutomaticDisableStatusCodes: parsedAutoDisableStatusCodes.normalized,
      AutomaticRetryStatusCodes: parsedAutoRetryStatusCodes.normalized,
    };

    const requestQueue = changes.map((item) => {
      let value;
      if (typeof currentValues[item.key] === 'boolean') {
        value = String(currentValues[item.key]);
      } else {
        value = normalizedMap[item.key] ?? String(currentValues[item.key]);
      }
      return API.put('/api/option/', { key: item.key, value });
    });

    setLoading(true);
    Promise.all(requestQueue)
      .then((res) => {
        if (res.includes(undefined)) {
          return showError(t('部分保存失败，请重试'));
        }
        showSuccess(t('保存成功'));
        savedValuesRef.current = { ...currentValues };
        props.refresh();
      })
      .catch(() => {
        showError(t('保存失败，请重试'));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    const merged = { ...DEFAULTS };
    for (const key in props.options) {
      if (key in DEFAULTS) {
        merged[key] = props.options[key];
      }
    }
    savedValuesRef.current = { ...merged };
    setDisableStatusCodes(merged.AutomaticDisableStatusCodes);
    setRetryStatusCodes(merged.AutomaticRetryStatusCodes);
    if (formRef.current) {
      formRef.current.setValues(merged);
    }
  }, [props.options]);

  return (
    <>
      <Spin spinning={loading}>
        <Form
          initValues={{ ...DEFAULTS }}
          getFormApi={(formAPI) => (formRef.current = formAPI)}
          style={{ marginBottom: 15 }}
        >
          <Form.Section text={t('监控设置')}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.Switch
                  field={'monitor_setting.auto_test_channel_enabled'}
                  label={t('定时测试所有通道')}
                  size='default'
                  checkedText='｜'
                  uncheckedText='〇'
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.InputNumber
                  label={t('自动测试所有通道间隔时间')}
                  step={1}
                  min={1}
                  suffix={t('分钟')}
                  extraText={t('每隔多少分钟测试一次所有通道')}
                  placeholder={''}
                  field={'monitor_setting.auto_test_channel_minutes'}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.InputNumber
                  label={t('测试所有渠道的最长响应时间')}
                  step={1}
                  min={0}
                  suffix={t('秒')}
                  extraText={t(
                    '当运行通道全部测试时，超过此时间将自动禁用通道',
                  )}
                  placeholder={''}
                  field={'ChannelDisableThreshold'}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.InputNumber
                  label={t('额度提醒阈值')}
                  step={1}
                  min={0}
                  suffix={'Token'}
                  extraText={t('低于此额度时将发送邮件提醒用户')}
                  placeholder={''}
                  field={'QuotaRemindThreshold'}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.Switch
                  field={'AutomaticDisableChannelEnabled'}
                  label={t('失败时自动禁用通道')}
                  size='default'
                  checkedText='｜'
                  uncheckedText='〇'
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.Switch
                  field={'AutomaticEnableChannelEnabled'}
                  label={t('成功时自动启用通道')}
                  size='default'
                  checkedText='｜'
                  uncheckedText='〇'
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={16}>
                <HttpStatusCodeRulesInput
                  label={t('自动禁用状态码')}
                  placeholder={t('例如：401, 403, 429, 500-599')}
                  extraText={t(
                    '支持填写单个状态码或范围（含首尾），使用逗号分隔',
                  )}
                  field={'AutomaticDisableStatusCodes'}
                  onChange={(value) => setDisableStatusCodes(value)}
                  parsed={parsedAutoDisableStatusCodes}
                  invalidText={t('自动禁用状态码格式不正确')}
                />
                <HttpStatusCodeRulesInput
                  label={t('自动重试状态码')}
                  placeholder={t('例如：401, 403, 429, 500-599')}
                  extraText={t(
                    '支持填写单个状态码或范围（含首尾），使用逗号分隔；504 和 524 始终不重试，不受此处配置影响',
                  )}
                  field={'AutomaticRetryStatusCodes'}
                  onChange={(value) => setRetryStatusCodes(value)}
                  parsed={parsedAutoRetryStatusCodes}
                  invalidText={t('自动重试状态码格式不正确')}
                />
                <Form.TextArea
                  label={t('自动禁用关键词')}
                  placeholder={t('一行一个，不区分大小写')}
                  extraText={t(
                    '当上游通道返回错误中包含这些关键词时（不区分大小写），自动禁用通道',
                  )}
                  field={'AutomaticDisableKeywords'}
                  autosize={{ minRows: 6, maxRows: 12 }}
                />
              </Col>
            </Row>
            <Row>
              <Button size='default' onClick={onSubmit}>
                {t('保存监控设置')}
              </Button>
            </Row>
          </Form.Section>
        </Form>
      </Spin>
    </>
  );
}
