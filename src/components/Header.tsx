import React from 'react';
import { Clock, LogOut } from 'lucide-react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

export const Header: React.FC = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="bg-indigo-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Clock className="w-8 h-8 mr-3" />
          <h1 className="text-2xl font-bold">Portal de Gestão de Horas</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm font-medium text-indigo-100 hover:text-white hover:bg-indigo-500 rounded-md transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair
        </button>
      </div>
    </header>
  );
};