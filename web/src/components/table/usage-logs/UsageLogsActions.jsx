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

import React from 'react';
import { renderQuota } from '../../../helpers';
import CompactModeToggle from '../../common/ui/CompactModeToggle';
import { useMinimumLoadingTime } from '../../../hooks/common/useMinimumLoadingTime';

const StatItem = ({ label, value }) => (
  <div className='flex items-center gap-2 px-3 py-1.5'>
    <span className='text-xs text-muted-foreground/60 uppercase tracking-wider'>{label}</span>
    <span className='text-sm font-medium tabular-nums'>{value}</span>
  </div>
);

const LogsActions = ({
  stat,
  loadingStat,
  showStat,
  compactMode,
  setCompactMode,
  t,
}) => {
  const showSkeleton = useMinimumLoadingTime(loadingStat);
  const needSkeleton = !showStat || showSkeleton;

  return (
    <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-2 w-full mt-2'>
      {needSkeleton ? (
        <div className='flex gap-3'>
          <div className='h-8 w-28 rounded-md bg-muted animate-pulse' />
          <div className='h-8 w-16 rounded-md bg-muted animate-pulse' />
          <div className='h-8 w-16 rounded-md bg-muted animate-pulse' />
        </div>
      ) : (
        <div className='flex items-center divide-x divide-border/40 border border-border/60 rounded-lg'>
          <StatItem label={t('消耗额度')} value={renderQuota(stat.quota)} />
          <StatItem label='RPM' value={stat.rpm} />
          <StatItem label='TPM' value={stat.tpm} />
        </div>
      )}

      <CompactModeToggle
        compactMode={compactMode}
        setCompactMode={setCompactMode}
        t={t}
      />
    </div>
  );
};

export default LogsActions;
