import Alert from './Alert';
import { useAlert } from '../../context/AlertContext';

const AlertContainer = () => {
  const { alerts, removeAlert } = useAlert();

  return (
    <div className="fixed top-0 right-0 z-99 pointer-events-none">
      <div className="p-4 space-y-2 pointer-events-auto">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            message={alert.message}
            type={alert.type}
            onClose={() => removeAlert(alert.id)}
            autoCloseDuration={0} // Manual close handled by context timeout
          />
        ))}
      </div>
    </div>
  );
};

export default AlertContainer;
