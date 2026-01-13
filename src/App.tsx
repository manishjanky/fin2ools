import { RouterProvider } from 'react-router';
import './App.css';
import router from './app-router';
import { AlertProvider } from './context/AlertContext';

function App() {
  return (
    <AlertProvider>
      <RouterProvider router={router} />
    </AlertProvider>
  );
}

export default App;
