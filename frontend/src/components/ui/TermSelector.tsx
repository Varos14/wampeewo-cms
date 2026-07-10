import React from 'react';
import { useUiStore } from '../../store/uiStore';

export const TermSelector: React.FC = () => {
  const { activeTerm, setActiveTerm } = useUiStore();

  return (
    <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shadow-inner max-w-xs shrink-0">
      {[1, 2, 3].map((term) => {
        const isActive = activeTerm === term;
        return (
          <button
            key={term}
            onClick={() => setActiveTerm(term)}
            className={`flex-1 text-center py-1.5 px-4 rounded-lg text-xs font-bold transition-all duration-200 ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm scale-105'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'
            }`}
          >
            Term {term}
          </button>
        );
      })}
    </div>
  );
};
