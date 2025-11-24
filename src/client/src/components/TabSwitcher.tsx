import React from 'react';

export type TabType = 'list' | 'json';

interface TabSwitcherProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          onClick={() => onTabChange('list')}
          className={`
            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
            ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }
          `}
        >
          サーバーリスト
        </button>
        <button
          onClick={() => onTabChange('json')}
          className={`
            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
            ${
              activeTab === 'json'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }
          `}
        >
          JSON編集
        </button>
      </nav>
    </div>
  );
};
