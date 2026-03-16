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
import { Button } from '@douyinfe/semi-ui';
import { RefreshCw, Search } from 'lucide-react';

const DashboardHeader = ({
  getGreeting,
  greetingVisible,
  showSearchModal,
  refresh,
  loading,
  t,
}) => {
  return (
    <div className='flex items-center justify-between mb-6'>
      <div
        className='transition-opacity duration-1000 ease-in-out'
        style={{ opacity: greetingVisible ? 1 : 0 }}
      >
        <h2 className='text-lg font-medium text-foreground tracking-tight'>
          {getGreeting}
        </h2>
      </div>
      <div className='flex gap-2'>
        <Button
          type='tertiary'
          icon={<Search size={14} />}
          onClick={showSearchModal}
          className='!h-8 !w-8 !p-0 !rounded-lg !bg-transparent hover:!bg-muted text-foreground/55 hover:text-foreground'
        />
        <Button
          type='tertiary'
          icon={<RefreshCw size={14} />}
          onClick={refresh}
          loading={loading}
          className='!h-8 !w-8 !p-0 !rounded-lg !bg-transparent hover:!bg-muted text-foreground/55 hover:text-foreground'
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
