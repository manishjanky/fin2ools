import { RouterProvider } from 'react-router';
import './App.css';
import router from './app-router';
import { AlertProvider } from './context/AlertContext';
import { useEffect } from 'react';
import { useMutualFundsStore } from './modules/mutual-funds/store/mutualFundsStore';
import { useInvestmentStore } from './modules/mutual-funds/store';

function App() {
  const initIndexedDB = useMutualFundsStore((state) => state.initIndexedDB);
  const syncLatestNAV = useMutualFundsStore((state) => state.syncLatestNAV);
  const loadInvestments = useInvestmentStore((state) => state.loadInvestments);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize IndexedDB for mutual funds and load investments/watchlist
        await initIndexedDB();
        
        // Load existing investments
        await loadInvestments();
        
        // Sync latest NAV for invested schemes
        await syncLatestNAV();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, [initIndexedDB, syncLatestNAV, loadInvestments]);

  return (
    <AlertProvider>
      <RouterProvider router={router} />
    </AlertProvider>
  );
}

export default App;