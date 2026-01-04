import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { apiGet } from '@/lib/api';

interface Settings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

const MaintenanceModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch settings to check maintenance mode
    apiGet<Settings>('/api/settings')
      .then(data => {
        if (data.maintenanceMode && data.maintenanceMessage) {
          setMaintenanceMessage(data.maintenanceMessage);
          setShowModal(true);
          setIsOpen(true);
        }
      })
      .catch(err => {
        console.error('Failed to fetch maintenance settings:', err);
      });
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!showModal || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Modo de Manutenção Ativo</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            O site está atualmente em modo de manutenção. Algumas funcionalidades podem estar limitadas.
          </p>
          <div className="bg-secondary p-4 rounded-md border border-border">
            <p className="text-sm text-secondary-foreground whitespace-pre-wrap">
              {maintenanceMessage}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleClose}
            variant="default"
            className="bg-primary hover:bg-primary/90"
          >
            OK, Entendido
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModal;