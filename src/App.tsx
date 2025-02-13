import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TimeEntryForm } from './components/TimeEntryForm';
import { MonthlyView } from './components/MonthlyView';
import { LoginScreen } from './components/LoginScreen';
import { TimeEntry, MonthlyReport } from './types';
import { calculateHours } from './utils/dateUtils';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Toaster } from 'react-hot-toast';

function App() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTimeEntry = (entry: Omit<TimeEntry, 'id'>) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setEntries([...entries, newEntry]);
  };

  const handleCloseMonth = (month: number, year: number) => {
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() + 1 === month && entryDate.getFullYear() === year;
    });

    const totalHours = monthEntries.reduce((acc, entry) => {
      return acc + calculateHours(entry.startTime, entry.endTime, entry.breakDuration);
    }, 0);

    const newReport: MonthlyReport = {
      employeeId: auth.currentUser?.uid || '1',
      month,
      year,
      totalHours,
      status: 'closed',
    };

    setMonthlyReports([...monthlyReports, newReport]);
  };

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const currentMonthReport = monthlyReports.find(
    report => report.month === currentMonth && report.year === currentYear
  );

  const totalHoursCurrentMonth = entries
    .filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getMonth() + 1 === currentMonth &&
        entryDate.getFullYear() === currentYear
      );
    })
    .reduce((acc, entry) => {
      return acc + calculateHours(entry.startTime, entry.endTime, entry.breakDuration);
    }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLogin={() => setIsAuthenticated(true)} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Toaster position="top-right" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <TimeEntryForm onSubmit={handleTimeEntry} />
          
          <MonthlyView
            month={currentMonth}
            year={currentYear}
            totalHours={totalHoursCurrentMonth}
            onClose={() => handleCloseMonth(currentMonth, currentYear)}
            isClosed={!!currentMonthReport}
          />
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Registros do Mês</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarefa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entrada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saída
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Intervalo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries
                    .filter(entry => {
                      const entryDate = new Date(entry.date);
                      return (
                        entryDate.getMonth() + 1 === currentMonth &&
                        entryDate.getFullYear() === currentYear
                      );
                    })
                    .map(entry => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(entry.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {entry.taskName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{entry.startTime}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{entry.endTime}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {entry.breakDuration} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {calculateHours(
                            entry.startTime,
                            entry.endTime,
                            entry.breakDuration
                          ).toFixed(2)}h
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;