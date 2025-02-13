import React from 'react';
import { getMonthName } from '../utils/dateUtils';

interface MonthlyViewProps {
  month: number;
  year: number;
  totalHours: number;
  onClose: () => void;
  isClosed: boolean;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  month,
  year,
  totalHours,
  onClose,
  isClosed,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {getMonthName(month)} de {year}
        </h2>
        <span className={`px-3 py-1 rounded-full text-sm ${
          isClosed ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
        }`}>
          {isClosed ? 'Fechado' : 'Em Aberto'}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600">Total de Horas:</p>
          <p className="text-2xl font-bold">{totalHours.toFixed(2)}h</p>
        </div>
        
        {!isClosed && (
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Fechar Mês
          </button>
        )}
      </div>
    </div>
  );
};