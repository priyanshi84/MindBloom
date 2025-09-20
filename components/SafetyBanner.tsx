import React from 'react';
import { Icon } from './Icon';

const SafetyBanner = () => {
  return (
    <div className="bg-rose-100 border-t border-rose-200 p-2">
      <div className="max-w-screen-xl mx-auto flex items-center justify-center text-center">
        <p className="text-sm text-rose-800 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>If you are in distress, please reach out. Help is available.</span>
          <a href="tel:1800-599-0019" className="inline-flex items-center gap-1 font-semibold underline hover:text-rose-600">
            <Icon name="Phone" className="w-4 h-4" />
            <span>Call KIRAN: 1800-599-0019</span>
          </a>
        </p>
      </div>
    </div>
  );
};

export default SafetyBanner;