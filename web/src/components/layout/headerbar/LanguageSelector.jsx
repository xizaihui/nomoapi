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
import { Button, Dropdown } from '@douyinfe/semi-ui';
import { Languages } from 'lucide-react';

const LanguageSelector = ({ currentLang, onLanguageChange, t }) => {
  return (
    <Dropdown
      position='bottomRight'
      render={
        <Dropdown.Menu className='!bg-popover !border-border/60 !shadow-sm !rounded-lg'>
          {/* Language sorting: Order by English name (Chinese, English, French, Japanese, Russian) */}
          <Dropdown.Item
            onClick={() => onLanguageChange('zh-CN')}
            className={`!px-3 !py-1.5 !text-sm !text-foreground ${currentLang === 'zh-CN' ? '!bg-muted !font-medium' : 'hover:!bg-muted'}`}
          >
            简体中文
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => onLanguageChange('zh-TW')}
            className={`!px-3 !py-1.5 !text-sm !text-foreground ${currentLang === 'zh-TW' ? '!bg-muted !font-medium' : 'hover:!bg-muted'}`}
          >
        	繁體中文
          </Dropdown.Item>          <Dropdown.Item
            onClick={() => onLanguageChange('en')}
            className={`!px-3 !py-1.5 !text-sm !text-foreground ${currentLang === 'en' ? '!bg-muted !font-medium' : 'hover:!bg-muted'}`}
          >
            English
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => onLanguageChange('fr')}
            className={`!px-3 !py-1.5 !text-sm !text-foreground ${currentLang === 'fr' ? '!bg-muted !font-medium' : 'hover:!bg-muted'}`}
          >
            Français
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => onLanguageChange('ja')}
            className={`!px-3 !py-1.5 !text-sm !text-foreground ${currentLang === 'ja' ? '!bg-muted !font-medium' : 'hover:!bg-muted'}`}
          >
            日本語
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => onLanguageChange('ru')}
            className={`!px-3 !py-1.5 !text-sm !text-foreground ${currentLang === 'ru' ? '!bg-muted !font-medium' : 'hover:!bg-muted'}`}
          >
            Русский
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => onLanguageChange('vi')}
            className={`!px-3 !py-1.5 !text-sm !text-foreground ${currentLang === 'vi' ? '!bg-muted !font-medium' : 'hover:!bg-muted'}`}
          >
            Tiếng Việt
          </Dropdown.Item>
        </Dropdown.Menu>
      }
    >
      <Button
        icon={<Languages size={16} />}
        aria-label={t('common.changeLanguage')}
        theme='borderless'
        type='tertiary'
        className='!p-1.5 !text-current focus:!bg-muted !rounded-lg !bg-transparent hover:!bg-muted transition-colors'
      />
    </Dropdown>
  );
};

export default LanguageSelector;
