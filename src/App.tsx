import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TimeEntryForm } from './components/TimeEntryForm';
import { MonthlyView } from './components/MonthlyView';
import { LoginScreen } from './components/LoginScreen';
import { TimeEntry, MonthlyReport } from './types';
import { calculateHours } from './utils/dateUtils';
import { auth, database } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set } from 'firebase/database';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

function App() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);

      if (user) {
        // Carregar entradas do usuário
        const entriesRef = ref(database, `entries/${user.uid}`);
        onValue(entriesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const entriesArray = Object.values(data) as TimeEntry[];
            setEntries(entriesArray);
          } else {
            setEntries([]);
          }
        });

        // Carregar relatórios mensais
        const reportsRef = ref(database, `reports/${user.uid}`);
        onValue(reportsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const reportsArray = Object.values(data) as MonthlyReport[];
            setMonthlyReports(reportsArray);
          } else {
            setMonthlyReports([]);
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleTimeEntry = async (entry: Omit<TimeEntry, 'id'>) => {
    if (!auth.currentUser) return;

    const newEntry = {
      ...entry,
      id: Date.now().toString(),
      userId: auth.currentUser.uid,
    };

    try {
      const entryRef = ref(
        database,
        `entries/${auth.currentUser.uid}/${newEntry.id}`
      );
      await set(entryRef, newEntry);
      toast.success('Registro salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      toast.error('Erro ao salvar registro. Tente novamente.');
    }
  };

  const handleCloseMonth = async (month: number, year: number) => {
    if (!auth.currentUser) return;

    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() + 1 === month && entryDate.getFullYear() === year;
    });

    const totalHours = monthEntries.reduce((acc, entry) => {
      return acc + calculateHours(entry.startTime, entry.endTime, entry.breakDuration);
    }, 0);

    const reportId = `${year}-${month}`;
    const newReport: MonthlyReport = {
      employeeId: auth.currentUser.uid,
      month,
      year,
      totalHours,
      status: 'closed',
    };

    try {
      const reportRef = ref(
        database,
        `reports/${auth.currentUser.uid}/${reportId}`
      );
      await set(reportRef, newReport);
      toast.success('Mês fechado com sucesso!');
    } catch (error) {
      console.error('Erro ao fechar mês:', error);
      toast.error('Erro ao fechar mês. Tente novamente.');
    }
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