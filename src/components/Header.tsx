
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { WorkflowModule } from '../types';

interface HeaderProps {
  onLogoClick?: () => void;
  module?: WorkflowModule;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, module }) => {
  const isActionable = !!onLogoClick;

  const getModuleLabel = (m: WorkflowModule) => {
    switch (m) {
      case 'lookbook': return '棚拍 / 款片';
      case 'campaign': return '形象大片';
      case 'still_life': return '静物特写';
      default: return '';
    }
  };

  return (
    <header className="w-full pt-6 pb-4 px-8 z-20 bg-[var(--bg-color)] border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-end relative">

        {/* Left: Brand Identity (Editorial Style) */}
        <div className="flex flex-col items-start z-10">
          <button
            onClick={isActionable ? onLogoClick : undefined}
            className={`group flex flex-col items-start ${isActionable ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <h1 className="text-2xl font-serif font-medium tracking-tight text-gray-900 leading-none">
              秋水伊人
            </h1>
            <span className="text-[10px] tracking-[0.25em] uppercase text-gray-400 mt-0.5 font-sans group-hover:text-gray-600 transition-colors">
              Chiu Shui
            </span>
          </button>
        </div>

        {/* Center: Module Indicator (Absolute Center) */}
        {module && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-1 hidden md:block z-20">
            <span className="text-[11px] tracking-[0.2em] font-medium uppercase text-gray-400 whitespace-nowrap">
              {getModuleLabel(module)}
            </span>
          </div>
        )}

        {/* Right: Studio Label */}
        <div className="flex items-end gap-4 z-10">
          <span className="text-[11px] font-serif italic text-gray-400 tracking-wide">
            每一帧，皆为杰作
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
