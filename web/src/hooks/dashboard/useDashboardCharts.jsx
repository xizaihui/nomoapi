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

import { useState, useCallback, useEffect } from 'react';
// vchart-semi-theme no longer used — custom aurora themes registered directly
import VChart from '@visactor/vchart';
import {
  modelColorMap,
  renderNumber,
  renderQuota,
  modelToColor,
  getQuotaWithUnit,
} from '../../helpers';
import {
  processRawData,
  calculateTrendData,
  aggregateDataByTimeAndModel,
  generateChartTimePoints,
  updateChartSpec,
  updateMapValue,
  initializeMaps,
} from '../../helpers/dashboard';

export const useDashboardCharts = (
  dataExportDefaultTime,
  setTrendData,
  setConsumeQuota,
  setTimes,
  setConsumeTokens,
  setPieData,
  setLineData,
  setModelColors,
  t,
) => {
  // ========== 图表规格状态 ==========
  const [spec_pie, setSpecPie] = useState({
    type: 'pie',
    background: 'transparent',
    data: [
      {
        id: 'id0',
        values: [{ type: 'null', value: '0' }],
      },
    ],
    outerRadius: 0.8,
    innerRadius: 0.5,
    padAngle: 0.6,
    valueField: 'value',
    categoryField: 'type',
    pie: {
      style: {
        cornerRadius: 10,
      },
      state: {
        hover: {
          outerRadius: 0.85,
          stroke: '#737373',
          lineWidth: 1,
        },
        selected: {
          outerRadius: 0.85,
          stroke: '#737373',
          lineWidth: 1,
        },
      },
    },
    title: {
      visible: true,
      text: t('模型调用次数占比'),
      subtext: `${t('总计')}：${renderNumber(0)}`,
    },
    legends: {
      visible: true,
      orient: 'left',
    },
    label: {
      visible: true,
    },
    tooltip: {
      mark: {
        content: [
          {
            key: (datum) => datum['type'],
            value: (datum) => renderNumber(datum['value']),
          },
        ],
      },
    },
    color: {
      specified: modelColorMap,
    },
  });

  const [spec_line, setSpecLine] = useState({
    type: 'bar',
    background: 'transparent',
    data: [
      {
        id: 'barData',
        values: [],
      },
    ],
    xField: 'Time',
    yField: 'Usage',
    seriesField: 'Model',
    stack: true,
    legends: {
      visible: true,
      selectMode: 'single',
    },
    title: {
      visible: true,
      text: t('模型消耗分布'),
      subtext: `${t('总计')}：${renderQuota(0, 2)}`,
    },
    bar: {
      state: {
        hover: {
          stroke: '#737373',
          lineWidth: 1,
        },
      },
    },
    tooltip: {
      mark: {
        content: [
          {
            key: (datum) => datum['Model'],
            value: (datum) => renderQuota(datum['rawQuota'] || 0, 4),
          },
        ],
      },
      dimension: {
        content: [
          {
            key: (datum) => datum['Model'],
            value: (datum) => datum['rawQuota'] || 0,
          },
        ],
        updateContent: (array) => {
          array.sort((a, b) => b.value - a.value);
          let sum = 0;
          for (let i = 0; i < array.length; i++) {
            if (array[i].key == '其他') {
              continue;
            }
            let value = parseFloat(array[i].value);
            if (isNaN(value)) {
              value = 0;
            }
            if (array[i].datum && array[i].datum.TimeSum) {
              sum = array[i].datum.TimeSum;
            }
            array[i].value = renderQuota(value, 4);
          }
          array.unshift({
            key: t('总计'),
            value: renderQuota(sum, 4),
          });
          return array;
        },
      },
    },
    color: {
      specified: modelColorMap,
    },
  });

  // 模型消耗趋势折线图
  const [spec_model_line, setSpecModelLine] = useState({
    type: 'line',
    background: 'transparent',
    data: [
      {
        id: 'lineData',
        values: [],
      },
    ],
    xField: 'Time',
    yField: 'Count',
    seriesField: 'Model',
    legends: {
      visible: true,
      selectMode: 'single',
    },
    title: {
      visible: true,
      text: t('模型消耗趋势'),
      subtext: '',
    },
    tooltip: {
      mark: {
        content: [
          {
            key: (datum) => datum['Model'],
            value: (datum) => renderNumber(datum['Count']),
          },
        ],
      },
    },
    color: {
      specified: modelColorMap,
    },
  });

  // 模型调用次数排行柱状图
  const [spec_rank_bar, setSpecRankBar] = useState({
    type: 'bar',
    background: 'transparent',
    data: [
      {
        id: 'rankData',
        values: [],
      },
    ],
    xField: 'Model',
    yField: 'Count',
    seriesField: 'Model',
    legends: {
      visible: true,
      selectMode: 'single',
    },
    title: {
      visible: true,
      text: t('模型调用次数排行'),
      subtext: '',
    },
    bar: {
      state: {
        hover: {
          stroke: '#737373',
          lineWidth: 1,
        },
      },
    },
    tooltip: {
      mark: {
        content: [
          {
            key: (datum) => datum['Model'],
            value: (datum) => renderNumber(datum['Count']),
          },
        ],
      },
    },
    color: {
      specified: modelColorMap,
    },
  });

  // ========== 数据处理函数 ==========
  const generateModelColors = useCallback((uniqueModels, modelColors) => {
    const newModelColors = {};
    Array.from(uniqueModels).forEach((modelName) => {
      newModelColors[modelName] =
        modelColorMap[modelName] ||
        modelColors[modelName] ||
        modelToColor(modelName);
    });
    return newModelColors;
  }, []);

  const updateChartData = useCallback(
    (data) => {
      const processedData = processRawData(
        data,
        dataExportDefaultTime,
        initializeMaps,
        updateMapValue,
      );

      const {
        totalQuota,
        totalTimes,
        totalTokens,
        uniqueModels,
        timePoints,
        timeQuotaMap,
        timeTokensMap,
        timeCountMap,
      } = processedData;

      const trendDataResult = calculateTrendData(
        timePoints,
        timeQuotaMap,
        timeTokensMap,
        timeCountMap,
        dataExportDefaultTime,
      );
      setTrendData(trendDataResult);

      const newModelColors = generateModelColors(uniqueModels, {});
      setModelColors(newModelColors);

      const aggregatedData = aggregateDataByTimeAndModel(
        data,
        dataExportDefaultTime,
      );

      const modelTotals = new Map();
      for (let [_, value] of aggregatedData) {
        updateMapValue(modelTotals, value.model, value.count);
      }

      const newPieData = Array.from(modelTotals)
        .map(([model, count]) => ({
          type: model,
          value: count,
        }))
        .sort((a, b) => b.value - a.value);

      const chartTimePoints = generateChartTimePoints(
        aggregatedData,
        data,
        dataExportDefaultTime,
      );

      let newLineData = [];

      chartTimePoints.forEach((time) => {
        let timeData = Array.from(uniqueModels).map((model) => {
          const key = `${time}-${model}`;
          const aggregated = aggregatedData.get(key);
          return {
            Time: time,
            Model: model,
            rawQuota: aggregated?.quota || 0,
            Usage: aggregated?.quota
              ? getQuotaWithUnit(aggregated.quota, 4)
              : 0,
          };
        });

        const timeSum = timeData.reduce((sum, item) => sum + item.rawQuota, 0);
        timeData.sort((a, b) => b.rawQuota - a.rawQuota);
        timeData = timeData.map((item) => ({ ...item, TimeSum: timeSum }));
        newLineData.push(...timeData);
      });

      newLineData.sort((a, b) => a.Time.localeCompare(b.Time));

      updateChartSpec(
        setSpecPie,
        newPieData,
        `${t('总计')}：${renderNumber(totalTimes)}`,
        newModelColors,
        'id0',
      );

      updateChartSpec(
        setSpecLine,
        newLineData,
        `${t('总计')}：${renderQuota(totalQuota, 2)}`,
        newModelColors,
        'barData',
      );

      // ===== 模型调用次数折线图 =====
      let modelLineData = [];
      chartTimePoints.forEach((time) => {
        const timeData = Array.from(uniqueModels).map((model) => {
          const key = `${time}-${model}`;
          const aggregated = aggregatedData.get(key);
          return {
            Time: time,
            Model: model,
            Count: aggregated?.count || 0,
          };
        });
        modelLineData.push(...timeData);
      });
      modelLineData.sort((a, b) => a.Time.localeCompare(b.Time));

      // ===== 模型调用次数排行柱状图 =====
      const rankData = Array.from(modelTotals)
        .map(([model, count]) => ({
          Model: model,
          Count: count,
        }))
        .sort((a, b) => b.Count - a.Count);

      updateChartSpec(
        setSpecModelLine,
        modelLineData,
        `${t('总计')}：${renderNumber(totalTimes)}`,
        newModelColors,
        'lineData',
      );

      updateChartSpec(
        setSpecRankBar,
        rankData,
        `${t('总计')}：${renderNumber(totalTimes)}`,
        newModelColors,
        'rankData',
      );

      setPieData(newPieData);
      setLineData(newLineData);
      setConsumeQuota(totalQuota);
      setTimes(totalTimes);
      setConsumeTokens(totalTokens);
    },
    [
      dataExportDefaultTime,
      setTrendData,
      generateModelColors,
      setModelColors,
      setPieData,
      setLineData,
      setConsumeQuota,
      setTimes,
      setConsumeTokens,
      t,
    ],
  );

  // ========== 初始化图表主题 ==========
  useEffect(() => {
    // Register grayscale theme for VChart
    try {
      const grayscaleTheme = {
        background: 'transparent',
        colorScheme: {
          default: [
            '#171717', '#404040', '#737373', '#a3a3a3', '#d4d4d4',
            '#525252', '#8a8a8a', '#b5b5b5', '#2e2e2e', '#616161',
          ],
        },
        series: {
          bar: {
            bar: {
              style: { fillOpacity: 0.85 },
              state: { hover: { stroke: '#171717', lineWidth: 1, fillOpacity: 1 } },
            },
          },
          line: {
            line: { style: { lineWidth: 1.5 } },
            point: { style: { size: 3, fillOpacity: 0.8 } },
          },
          pie: {
            pie: {
              style: { fillOpacity: 0.9 },
              state: { hover: { outerRadius: 0.85, fillOpacity: 1 } },
            },
          },
        },
        component: {
          axis: {
            label: { style: { fill: '#a3a3a3', fontSize: 11 } },
            tick: { style: { stroke: '#e5e5e5' } },
            domainLine: { style: { stroke: '#e5e5e5' } },
            grid: { style: { stroke: '#f0f0f0', lineDash: [3, 3] } },
          },
          legend: {
            label: { style: { fill: '#737373', fontSize: 11 } },
          },
          title: {
            style: { fill: '#171717', fontSize: 13, fontWeight: 500 },
            subtextStyle: { fill: '#a3a3a3', fontSize: 11 },
          },
          tooltip: {
            panel: { style: { backgroundColor: '#171717', border: { color: '#171717' } } },
            titleLabel: { style: { fill: '#ffffff', fontSize: 11 } },
            keyLabel: { style: { fill: '#d4d4d4', fontSize: 11 } },
            valueLabel: { style: { fill: '#ffffff', fontSize: 11 } },
          },
        },
      };

      const darkGrayscaleTheme = {
        background: 'transparent',
        colorScheme: {
          default: [
            '#a3a3a3', '#737373', '#8a8a8a', '#d4d4d4', '#525252',
            '#b5b5b5', '#616161', '#959595', '#c4c4c4', '#404040',
          ],
        },
        series: {
          bar: {
            bar: {
              style: { fillOpacity: 0.75 },
              state: { hover: { stroke: '#a3a3a3', lineWidth: 1, fillOpacity: 1 } },
            },
          },
          line: {
            line: { style: { lineWidth: 1.5 } },
            point: { style: { size: 3, fillOpacity: 0.7 } },
          },
          pie: {
            pie: {
              style: { fillOpacity: 0.8 },
              state: { hover: { outerRadius: 0.85, fillOpacity: 1, stroke: '#a3a3a3', lineWidth: 1 } },
            },
          },
        },
        component: {
          axis: {
            label: { style: { fill: '#525252', fontSize: 11 } },
            tick: { style: { stroke: '#2a2a2a' } },
            domainLine: { style: { stroke: '#2a2a2a' } },
            grid: { style: { stroke: '#1f1f1f', lineDash: [3, 3] } },
          },
          legend: {
            label: { style: { fill: '#737373', fontSize: 11 } },
          },
          title: {
            style: { fill: '#a3a3a3', fontSize: 13, fontWeight: 500 },
            subtextStyle: { fill: '#525252', fontSize: 11 },
          },
          tooltip: {
            panel: { style: { backgroundColor: '#1a1a1a', border: { color: '#2a2a2a', width: 1 } } },
            titleLabel: { style: { fill: '#d4d4d4', fontSize: 11 } },
            keyLabel: { style: { fill: '#a3a3a3', fontSize: 11 } },
            valueLabel: { style: { fill: '#d4d4d4', fontSize: 11 } },
          },
        },
      };

      VChart.ThemeManager?.registerTheme?.('aurora-light', grayscaleTheme);
      VChart.ThemeManager?.registerTheme?.('aurora-dark', darkGrayscaleTheme);

      const isDark = document.body.hasAttribute('theme-mode');
      VChart.ThemeManager?.setCurrentTheme?.(isDark ? 'aurora-dark' : 'aurora-light');

      // Watch for theme changes
      const observer = new MutationObserver(() => {
        const dark = document.body.hasAttribute('theme-mode');
        VChart.ThemeManager?.setCurrentTheme?.(dark ? 'aurora-dark' : 'aurora-light');
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ['theme-mode'] });
      return () => observer.disconnect();
    } catch (e) {
      // ignore if ThemeManager not available
    }
  }, []);

  return {
    // 图表规格
    spec_pie,
    spec_line,
    spec_model_line,
    spec_rank_bar,

    // 函数
    updateChartData,
    generateModelColors,
  };
};
