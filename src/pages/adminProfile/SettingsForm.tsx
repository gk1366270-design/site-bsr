import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X, Globe, Moon, Sun, Users, Mail, Facebook, Twitter, Instagram, Youtube, Shield, AlertTriangle, Server, Flag, Settings as SettingsIcon } from 'lucide-react';
import { Settings as SettingsType } from './types';

interface SettingsFormProps {
  settings: SettingsType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  isLoading: boolean;
}

interface FormData extends Record<string, unknown> {
  id?: string;
  siteName?: string;
  siteDescription?: string;
  siteLogo?: string;
  theme?: string;
  defaultLanguage?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  registrationEnabled?: boolean;
  emailVerificationRequired?: boolean;
  maxUsers?: string;
  defaultRaceSettings?: {
    maxParticipants?: number;
    defaultLaps?: number;
    defaultDuration?: string;
  };
  udpConfiguration?: {
    defaultListenAddress?: string;
    defaultSendAddress?: string;
    defaultRefreshInterval?: number;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    discord?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  seoSettings?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
}

const SettingsForm: React.FC<SettingsFormProps> = ({ settings, isOpen, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [activeTab, setActiveTab] = useState<string>('general');

  useEffect(() => {
    if (settings) {
      setFormData({
        id: settings.id || '',
        siteName: settings.siteName || '',
        siteDescription: settings.siteDescription || '',
        siteLogo: settings.siteLogo || '',
        theme: settings.theme || 'system',
        defaultLanguage: settings.defaultLanguage || 'pt-BR',
        maintenanceMode: settings.maintenanceMode || false,
        maintenanceMessage: settings.maintenanceMessage || '',
        registrationEnabled: settings.registrationEnabled || true,
        emailVerificationRequired: settings.emailVerificationRequired || false,
        maxUsers: settings.maxUsers || '',
        defaultRaceSettings: {
          maxParticipants: settings.defaultRaceSettings?.maxParticipants || 20,
          defaultLaps: settings.defaultRaceSettings?.defaultLaps || 35,
          defaultDuration: settings.defaultRaceSettings?.defaultDuration || '60 minutos'
        },
        udpConfiguration: {
          defaultListenAddress: settings.udpConfiguration?.defaultListenAddress || '127.0.0.1:11095',
          defaultSendAddress: settings.udpConfiguration?.defaultSendAddress || '127.0.0.1:12095',
          defaultRefreshInterval: settings.udpConfiguration?.defaultRefreshInterval || 1000
        },
        socialMedia: {
          facebook: settings.socialMedia?.facebook || '',
          twitter: settings.socialMedia?.twitter || '',
          instagram: settings.socialMedia?.instagram || '',
          youtube: settings.socialMedia?.youtube || '',
          discord: settings.socialMedia?.discord || ''
        },
        contactInfo: {
          email: settings.contactInfo?.email || '',
          phone: settings.contactInfo?.phone || '',
          address: settings.contactInfo?.address || ''
        },
        seoSettings: {
          metaTitle: settings.seoSettings?.metaTitle || '',
          metaDescription: settings.seoSettings?.metaDescription || '',
          metaKeywords: settings.seoSettings?.metaKeywords || ''
        }
      });
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section] as Record<string, unknown>,
        [field]: value
      }
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!settings) return null;

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light': return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'dark': return <Moon className="h-5 w-5 text-blue-500" />;
      case 'system': return <Globe className="h-5 w-5 text-green-500" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            <span>Configurações da Plataforma</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
            Configure todas as opções da plataforma Sim Racing Boost
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
              <TabsTrigger value="general">
                <Globe className="h-4 w-4 mr-2" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="system">
                <Shield className="h-4 w-4 mr-2" />
                Sistema
              </TabsTrigger>
              <TabsTrigger value="contact">
                <Mail className="h-4 w-4 mr-2" />
                Contato
              </TabsTrigger>
              <TabsTrigger value="social">
                <Users className="h-4 w-4 mr-2" />
                Social
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Server className="h-4 w-4 mr-2" />
                Avançado
              </TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <span>Informações do Site</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Nome do Site</Label>
                      <Input
                        id="siteName"
                        name="siteName"
                        value={formData.siteName as string || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="Ex: Sim Racing Boost"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Descrição do Site</Label>
                      <Textarea
                        id="siteDescription"
                        name="siteDescription"
                        value={formData.siteDescription as string || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="Descreva sua plataforma de sim racing..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteLogo">URL do Logo</Label>
                    <Input
                      id="siteLogo"
                      name="siteLogo"
                      value={formData.siteLogo as string || ''}
                      onChange={handleInputChange}
                      placeholder="URL para o logo do site"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tema</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {['light', 'dark', 'system'].map((theme) => (
                        <label key={theme} className="flex flex-col items-center cursor-pointer">
                          <input
                            type="radio"
                            name="theme"
                            value={theme}
                            checked={formData.theme === theme}
                            onChange={() => setFormData(prev => ({ ...prev, theme }))}
                            className="sr-only"
                          />
                          <div className={`w-full p-4 rounded-xl border-2 ${formData.theme === theme ? 'ring-2 ring-primary' : 'border-gray-300 dark:border-gray-600'} transition-all duration-200`}>
                            {getThemeIcon(theme)}
                            <div className="font-medium capitalize text-center mt-2">{theme}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultLanguage">Idioma Padrão</Label>
                    <Select
                      name="defaultLanguage"
                      value={formData.defaultLanguage as string || 'pt-BR'}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, defaultLanguage: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">Inglês (EUA)</SelectItem>
                        <SelectItem value="es-ES">Espanhol (Espanha)</SelectItem>
                        <SelectItem value="fr-FR">Francês (França)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Flag className="h-5 w-5 text-primary" />
                    <span>Configurações Padrão de Corrida</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="maxParticipants">Máximo de Participantes</Label>
                      <Input
                        id="maxParticipants"
                        name="maxParticipants"
                        type="number"
                        value={(formData.defaultRaceSettings as FormData['defaultRaceSettings'])?.maxParticipants || 20}
                        onChange={(e) => handleNestedInputChange('defaultRaceSettings', 'maxParticipants', e.target.value)}
                        min="2"
                        max="100"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultLaps">Voltas Padrão</Label>
                      <Input
                        id="defaultLaps"
                        name="defaultLaps"
                        type="number"
                        value={(formData.defaultRaceSettings as FormData['defaultRaceSettings'])?.defaultLaps || 35}
                        onChange={(e) => handleNestedInputChange('defaultRaceSettings', 'defaultLaps', e.target.value)}
                        min="1"
                        max="200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultDuration">Duração Padrão</Label>
                      <Input
                        id="defaultDuration"
                        name="defaultDuration"
                        value={(formData.defaultRaceSettings as FormData['defaultRaceSettings'])?.defaultDuration || '60 minutos'}
                        onChange={(e) => handleNestedInputChange('defaultRaceSettings', 'defaultDuration', e.target.value)}
                        placeholder="Ex: 60 minutos"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* System Settings Tab */}
            <TabsContent value="system">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Configurações do Sistema</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="font-medium">Modo de Manutenção</h4>
                          <p className="text-sm text-muted-foreground">Ative para colocar o site em manutenção</p>
                        </div>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        name="maintenanceMode"
                        checked={formData.maintenanceMode as boolean || false}
                        onCheckedChange={(checked) => handleSwitchChange('maintenanceMode', checked)}
                      />
                    </div>

                    {formData.maintenanceMode && (
                      <div className="space-y-2">
                        <Label htmlFor="maintenanceMessage">Mensagem de Manutenção</Label>
                        <Textarea
                          id="maintenanceMessage"
                          name="maintenanceMessage"
                          value={formData.maintenanceMessage as string || ''}
                          onChange={handleInputChange}
                          placeholder="Mensagem exibida aos usuários durante a manutenção..."
                          rows={4}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">Registro de Usuários</h4>
                          <p className="text-sm text-muted-foreground">Permitir novos registros</p>
                        </div>
                      </div>
                      <Switch
                        id="registrationEnabled"
                        name="registrationEnabled"
                        checked={formData.registrationEnabled as boolean || true}
                        onCheckedChange={(checked) => handleSwitchChange('registrationEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">Verificação de Email</h4>
                          <p className="text-sm text-muted-foreground">Requer verificação de email para novos usuários</p>
                        </div>
                      </div>
                      <Switch
                        id="emailVerificationRequired"
                        name="emailVerificationRequired"
                        checked={formData.emailVerificationRequired as boolean || false}
                        onCheckedChange={(checked) => handleSwitchChange('emailVerificationRequired', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxUsers">Limite Máximo de Usuários (Opcional)</Label>
                      <Input
                        id="maxUsers"
                        name="maxUsers"
                        type="number"
                        value={formData.maxUsers as string || ''}
                        onChange={handleInputChange}
                        placeholder="Deixe vazio para ilimitado"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Contact Settings Tab */}
            <TabsContent value="contact">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <span>Informações de Contato</span>
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email de Contato</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={(formData.contactInfo as FormData['contactInfo'])?.email || ''}
                      onChange={(e) => handleNestedInputChange('contactInfo', 'email', e.target.value)}
                      required
                      placeholder="contato@simracingboost.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone (Opcional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={(formData.contactInfo as FormData['contactInfo'])?.phone || ''}
                      onChange={(e) => handleNestedInputChange('contactInfo', 'phone', e.target.value)}
                      placeholder="(XX) XXXXX-XXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço (Opcional)</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={(formData.contactInfo as FormData['contactInfo'])?.address || ''}
                      onChange={(e) => handleNestedInputChange('contactInfo', 'address', e.target.value)}
                      placeholder="Endereço completo da organização..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <span>Configurações de SEO</span>
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Título Meta</Label>
                    <Input
                      id="metaTitle"
                      name="metaTitle"
                      value={(formData.seoSettings as FormData['seoSettings'])?.metaTitle || ''}
                      onChange={(e) => handleNestedInputChange('seoSettings', 'metaTitle', e.target.value)}
                      placeholder="Título para mecanismos de busca..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Descrição Meta</Label>
                    <Textarea
                      id="metaDescription"
                      name="metaDescription"
                      value={(formData.seoSettings as FormData['seoSettings'])?.metaDescription || ''}
                      onChange={(e) => handleNestedInputChange('seoSettings', 'metaDescription', e.target.value)}
                      placeholder="Descrição para mecanismos de busca..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords">Palavras-chave Meta</Label>
                    <Input
                      id="metaKeywords"
                      name="metaKeywords"
                      value={(formData.seoSettings as FormData['seoSettings'])?.metaKeywords || ''}
                      onChange={(e) => handleNestedInputChange('seoSettings', 'metaKeywords', e.target.value)}
                      placeholder="sim racing, corrida virtual, esports..."
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Social Media Tab */}
            <TabsContent value="social">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Redes Sociais</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        name="facebook"
                        value={(formData.socialMedia as FormData['socialMedia'])?.facebook || ''}
                        onChange={(e) => handleNestedInputChange('socialMedia', 'facebook', e.target.value)}
                        placeholder="URL do Facebook"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        name="twitter"
                        value={(formData.socialMedia as FormData['socialMedia'])?.twitter || ''}
                        onChange={(e) => handleNestedInputChange('socialMedia', 'twitter', e.target.value)}
                        placeholder="URL do Twitter"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        name="instagram"
                        value={(formData.socialMedia as FormData['socialMedia'])?.instagram || ''}
                        onChange={(e) => handleNestedInputChange('socialMedia', 'instagram', e.target.value)}
                        placeholder="URL do Instagram"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="youtube">YouTube</Label>
                      <Input
                        id="youtube"
                        name="youtube"
                        value={(formData.socialMedia as FormData['socialMedia'])?.youtube || ''}
                        onChange={(e) => handleNestedInputChange('socialMedia', 'youtube', e.target.value)}
                        placeholder="URL do YouTube"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discord">Discord</Label>
                      <Input
                        id="discord"
                        name="discord"
                        value={(formData.socialMedia as FormData['socialMedia'])?.discord || ''}
                        onChange={(e) => handleNestedInputChange('socialMedia', 'discord', e.target.value)}
                        placeholder="URL do servidor Discord"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Advanced Settings Tab */}
            <TabsContent value="advanced">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Server className="h-5 w-5 text-primary" />
                    <span>Configuração UDP para Live Timing</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Importante:</strong> Configure os endereços UDP para permitir a comunicação entre o plugin Assetto Corsa e o servidor de live timing.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="udpListenAddress">UDP Listen Address (Local)</Label>
                      <Input
                        id="udpListenAddress"
                        name="udpListenAddress"
                        value={(formData.udpConfiguration as FormData['udpConfiguration'])?.defaultListenAddress || '127.0.0.1:11095'}
                        onChange={(e) => handleNestedInputChange('udpConfiguration', 'defaultListenAddress', e.target.value)}
                        placeholder="Ex: 127.0.0.1:11095"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Endereço local onde o plugin escuta mensagens UDP
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="udpSendAddress">UDP Send Address (Plugin)</Label>
                      <Input
                        id="udpSendAddress"
                        name="udpSendAddress"
                        value={(formData.udpConfiguration as FormData['udpConfiguration'])?.defaultSendAddress || '127.0.0.1:12095'}
                        onChange={(e) => handleNestedInputChange('udpConfiguration', 'defaultSendAddress', e.target.value)}
                        placeholder="Ex: 127.0.0.1:12095"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Endereço do plugin para onde as mensagens UDP são enviadas
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="udpRefreshInterval">Intervalo de Atualização (ms)</Label>
                      <Input
                        id="udpRefreshInterval"
                        name="udpRefreshInterval"
                        type="number"
                        value={(formData.udpConfiguration as FormData['udpConfiguration'])?.defaultRefreshInterval || 1000}
                        onChange={(e) => handleNestedInputChange('udpConfiguration', 'defaultRefreshInterval', e.target.value)}
                        placeholder="Ex: 1000"
                        min="100"
                        max="10000"
                        step="100"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Intervalo de atualização dos dados de live timing em milissegundos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="h-10 px-6"
              >
                <X className="h-4 w-4 mr-2" />
                <span>Cancelar</span>
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-10 px-6 bg-primary hover:bg-primary-dark text-white font-semibold"
              >
                <Save className="h-4 w-4 mr-2" />
                <span>{isLoading ? 'Salvando...' : 'Salvar Configurações'}</span>
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsForm;