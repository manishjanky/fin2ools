import { createContext, useContext, useState, useCallback } from 'react';

export interface AlertMessage {
  id: string;
  message: string;
  type: 'success' | 'alert' | 'warning' | 'error';
}

interface AlertContextType {
  alerts: AlertMessage[];
  showAlert: (message: string, type: 'success' | 'alert' | 'warning' | 'error', duration?: number) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const showAlert = useCallback(
    (message: string, type: 'success' | 'alert' | 'warning' | 'error' = 'alert', duration = 5000) => {
      const id = `alert-${Date.now()}-${Math.random()}`;
      
      setAlerts(prev => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeAlert(id);
        }, duration);
      }
    },
    []
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};
