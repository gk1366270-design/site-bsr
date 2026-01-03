import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, Edit, Trash2, Plus, Globe, Moon, Sun, Users, Mail, Facebook, Twitter, Instagram, Youtube, Shield, AlertTriangle } from 'lucide-react';
import { Settings as SettingsType } from './types';
import { useToast } from '@/hooks/use-toast';
import SettingsForm from './SettingsForm';

interface SettingsManagementProps {
  settings: SettingsType;
  setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
  isLoading: boolean;
}

const SettingsManagement: React.FC<SettingsManagementProps> = ({ settings, setSettings, isLoading }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<SettingsType | null>(null);

  const handleEdit = useCallback(() => {
    setEditItem(settings);
    setIsDialogOpen(true);
  }, [settings]);

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to save settings: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
       
      setSettings(result.settings);
       
      setIsDialogOpen(false);
      setEditItem(null);
       
      toast({
        title: "Sucesso",
        description: `Configurações atualizadas com sucesso.`,
      });
    } catch (error) {
      console.error(`Error saving settings:` , error);
      toast({
        title: "Erro",
        description: `Falha ao salvar configurações: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [setSettings, toast]);

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'dark': return <Moon className="h-4 w-4 text-blue-500" />;
      case 'system': return <Globe className="h-4 w-4 text-green-500" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getMaintenanceBadge = (maintenanceMode: boolean) => {
    return maintenanceMode ? (
      <Badge variant="destructive" className="flex items-center space-x-1">
        <AlertTriangle className="h-3 w-3" />
        <span>Manutenção Ativa</span>
      </Badge>
    ) : (
      <Badge variant="default" className="flex items-center space-x-1">
        <Shield className="h-3 w-3" />
        <span>Operacional</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold flex items-center space-x-2">
            <Settings className="h-6 w-6 text-primary" />
            <span>Configurações da Plataforma</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie todas as configurações do Sim Racing Boost
          </p>
        </div>
        <Button onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Editar Configurações
        </Button>
      </div>

      {/* Settings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Site Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-primary" />
              <span>Informações do Site</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Nome do Site</p>
              <p className="font-medium">{settings.siteName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Descrição</p>
              <p className="text-sm">{settings.siteDescription}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tema</p>
              <div className="flex items-center space-x-2">
                {getThemeIcon(settings.theme)}
                <span className="capitalize">{settings.theme}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Status do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Modo de Manutenção</p>
              {getMaintenanceBadge(settings.maintenanceMode)}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Registro de Usuários</p>
              <Badge variant={settings.registrationEnabled ? 'default' : 'secondary'}>
                {settings.registrationEnabled ? 'Ativado' : 'Desativado'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Verificação de Email</p>
              <Badge variant={settings.emailVerificationRequired ? 'default' : 'secondary'}>
                {settings.emailVerificationRequired ? 'Obrigatório' : 'Opcional'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-primary" />
              <span>Informações de Contato</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm font-mono">{settings.contactInfo?.email}</p>
            </div>
            {settings.contactInfo?.phone && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="text-sm">{settings.contactInfo.phone}</p>
              </div>
            )}
            {settings.contactInfo?.address && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="text-sm">{settings.contactInfo.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Redes Sociais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {settings.socialMedia?.facebook && (
                <div className="flex items-center space-x-2">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Facebook</span>
                </div>
              )}
              {settings.socialMedia?.twitter && (
                <div className="flex items-center space-x-2">
                  <Twitter className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">Twitter</span>
                </div>
              )}
              {settings.socialMedia?.instagram && (
                <div className="flex items-center space-x-2">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  <span className="text-sm">Instagram</span>
                </div>
              )}
              {settings.socialMedia?.youtube && (
                <div className="flex items-center space-x-2">
                  <Youtube className="h-4 w-4 text-red-600" />
                  <span className="text-sm">YouTube</span>
                </div>
              )}
              {settings.socialMedia?.discord && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm">Discord</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Default Race Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-primary" />
              <span>Configurações Padrão de Corrida</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Máximo de Participantes</p>
              <p className="font-medium">{settings.defaultRaceSettings?.maxParticipants}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Voltas Padrão</p>
              <p className="font-medium">{settings.defaultRaceSettings?.defaultLaps}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Duração Padrão</p>
              <p className="font-medium">{settings.defaultRaceSettings?.defaultDuration}</p>
            </div>
          </CardContent>
        </Card>

        {/* UDP Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-primary" />
              <span>Configuração UDP</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Endereço de Escuta</p>
              <p className="text-sm font-mono">{settings.udpConfiguration?.defaultListenAddress}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Endereço de Envio</p>
              <p className="text-sm font-mono">{settings.udpConfiguration?.defaultSendAddress}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Intervalo de Atualização</p>
              <p className="text-sm">{settings.udpConfiguration?.defaultRefreshInterval}ms</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Form Dialog */}
      <SettingsForm
        settings={editItem}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SettingsManagement;