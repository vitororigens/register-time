export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

export const calculateHours = (startTime: string, endTime: string, breakDuration: number): number => {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  
  const diffInMinutes = (end.getTime() - start.getTime()) / 1000 / 60;
  return (diffInMinutes - breakDuration) / 60;
};

export const getMonthName = (month: number): string => {
  const date = new Date(2024, month - 1, 1);
  return date.toLocaleString('pt-BR', { month: 'long' });
};