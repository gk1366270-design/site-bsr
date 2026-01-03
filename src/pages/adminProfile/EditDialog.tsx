import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, X, Gauge, Flag, Calendar, Image as ImageIcon, Trash2, Upload, Server, BarChart3, Trophy, GanttChart } from 'lucide-react';
import { User, Achievement, Race, News, Standing, Championship } from './types';
import { Users, Plus } from 'lucide-react';
import RequirementBuilder from './RequirementBuilder';

interface EditDialogProps {
  item: User | Achievement | Race | News | Standing | Championship | null;
  type: 'users' | 'achievements' | 'races' | 'news' | 'standings' | 'championships';
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
  isLoading: boolean;
  availablePilots?: string[];
  predefinedTeams?: string[];
}

// Helper function to format dates for input fields
const formatDateForInput = (dateString: string): string => {
  try {
    // Try to parse the date string
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      // If invalid, try to parse from DD/MM/YYYY format
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Months are 0-indexed
        const year = parseInt(parts[2]);
        const parsedDate = new Date(year, month, day);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0];
        }
      }
      // If still invalid, return empty string
      return '';
    }
    
    // Return in YYYY-MM-DD format for date input
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

const EditDialog: React.FC<EditDialogProps> = ({ item, type, isOpen, onClose, onSave, isLoading, availablePilots = [], predefinedTeams = [] }) => {
  const [requirement, setRequirement] = useState<string>((item as Achievement)?.requirement || '');
  const [category, setCategory] = useState<string>((item as Achievement)?.category || 'geral');
  const [raceImage, setRaceImage] = useState<string>((item as Race)?.image || '');
  const [imagePreview, setImagePreview] = useState<string>((item as Race)?.image || '');
  const [newsImage, setNewsImage] = useState<string>((item as News)?.image || '');
  const [newsImagePreview, setNewsImagePreview] = useState<string>((item as News)?.image || '');
  const [standings, setStandings] = useState<{category: string}[]>([]);
  const [standingsLoading, setStandingsLoading] = useState<boolean>(false);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [championshipPilots, setChampionshipPilots] = useState<string[]>([]);
  const [championshipDrivers, setChampionshipDrivers] = useState<{name: string; points: number; team?: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newsFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPilots, setSelectedPilots] = useState<string[]>(item && Array.isArray((item as Championship).registeredPilots) ? (item as Championship).registeredPilots : []);
  const [drivers, setDrivers] = useState<{name: string; points: number; team?: string}[]>(item && Array.isArray((item as Championship).drivers) ? (item as Championship).drivers : []);
  const [newsTags, setNewsTags] = useState<string[]>(item && Array.isArray((item as News).tags) ? (item as News).tags : []);
  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  
  // Fetch standings data when component mounts
  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setStandingsLoading(true);
        setStandingsError(null);
        const response = await fetch('/api/standings');
        if (response.ok) {
          const data = await response.json();
          setStandings(Array.isArray(data) ? data : []);
        } else {
          setStandingsError('Failed to fetch standings data');
          setStandings([]);
        }
      } catch (error) {
        console.error('Error fetching standings:', error);
        setStandingsError('Error fetching standings');
        setStandings([]);
      } finally {
        setStandingsLoading(false);
      }
    };
    
    if (type === 'races' && isOpen) {
      fetchStandings();
    }
  }, [type, isOpen]);

  // Load available tags when component mounts
  useEffect(() => {
    const loadAvailableTags = async () => {
      try {
        const response = await fetch('/api/news');
        if (response.ok) {
          const newsData = await response.json();
          // Extract all unique tags from existing news
          const allTags = new Set<string>();
          newsData.forEach((newsItem: News) => {
            if (newsItem.tags && Array.isArray(newsItem.tags)) {
              newsItem.tags.forEach((tag: string) => allTags.add(tag));
            }
          });
          setAvailableTags(Array.from(allTags));
        }
      } catch (error) {
        console.error('Error loading available tags:', error);
      }
    };

    if (type === 'news' && isOpen) {
      loadAvailableTags();
    }
  }, [type, isOpen]);
  
  // Update requirement state when item changes
  useEffect(() => {
    if ((item as Achievement)?.requirement) {
      setRequirement((item as Achievement).requirement);
    }
    if ((item as Achievement)?.category) {
      setCategory((item as Achievement).category);
    }
    if ((item as Race)?.image) {
      setRaceImage((item as Race).image);
      setImagePreview((item as Race).image);
    }
    if ((item as News)?.image) {
      setNewsImage((item as News).image);
      setNewsImagePreview((item as News).image);
    }
  }, [item]);

  // Update championship state when item changes
  useEffect(() => {
    if (item && type === 'championships') {
      const championship = item as Championship;
      setSelectedPilots(championship.registeredPilots || []);
      setDrivers(championship.drivers || []);
    }
  }, [item, type]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = { id: item?.id || '' };
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    // Add the requirement value from state
    data['requirement'] = requirement;
    
    console.log('Form submitted with data:', data);
    console.log('Save button clicked - calling onSave');
    
    onSave(data);
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl ${(type === 'races' || type === 'news' || type === 'championships') ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {item?.id ? 'Editar' : 'Criar'} {type.slice(0, -1)}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
            {item?.id ? 'Edite os detalhes deste item' : 'Criar um novo item'}
          </DialogDescription>
        </DialogHeader>
        
        <div className={`space-y-6 ${(type === 'races' || type === 'news' || type === 'championships') ? 'pr-4' : ''}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {type === 'users' && renderUserForm(item as User)}
            {type === 'achievements' && renderAchievementForm(item as Achievement, requirement, setRequirement, category, setCategory)}
            {type === 'races' && renderRaceForm(item as Race, raceImage, setRaceImage, imagePreview, setImagePreview, fileInputRef, standings, standingsLoading, standingsError)}
            {type === 'news' && renderNewsForm(item as News, newsTags, setNewsTags, tagInput, setTagInput, selectedTag, setSelectedTag, availableTags, newsImage, setNewsImage, newsImagePreview, setNewsImagePreview, newsFileInputRef)}
            {type === 'standings' && renderStandingForm(item as Standing)}
            {type === 'championships' && renderChampionshipForm(item as Championship, availablePilots || [], selectedPilots, setSelectedPilots, drivers, setDrivers, predefinedTeams || [])}
            
            {type === 'races' && (
              <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="h-10 px-6 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
                  >
                    <X className="h-4 w-4 mr-2" />
                    <span className="font-medium">Cancelar</span>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-10 px-6 bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    <span className="font-medium">{isLoading ? 'Salvando...' : 'Salvar'}</span>
                  </Button>
                </div>
              </div>
            )}
            
            {type !== 'races' && (
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-10 px-6 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  <span className="font-medium">Cancelar</span>
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 px-6 bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <Save className="h-4 w-4 mr-2" />
                  <span className="font-medium">{isLoading ? 'Salvando...' : 'Salvar'}</span>
                </Button>
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const renderUserForm = (user: User) => (
  <>
    <div className="space-y-2">
      <Label htmlFor="username">Nome de Usuário</Label>
      <Input id="username" name="username" defaultValue={user.username || ''} required />
    </div>
    <div className="space-y-2">
      <Label htmlFor="displayName">Nome de Exibição</Label>
      <Input id="displayName" name="displayName" defaultValue={user.displayName || ''} required />
    </div>
    <div className="space-y-2">
      <Label htmlFor="role">Função</Label>
      <Select name="role" defaultValue={user.role || 'user'}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione a função" />
        </SelectTrigger>
        <SelectContent position="popper" side="bottom">
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">Usuário</SelectItem>
          <SelectItem value="premium">Premium</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="isActive">Status</Label>
      <Select name="isActive" defaultValue={user.isActive?.toString() || 'true'}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent position="popper" side="bottom">
          <SelectItem value="true">Ativo</SelectItem>
          <SelectItem value="false">Inativo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </>
);

const renderAchievementForm = (achievement: Achievement, requirement: string, setRequirement: React.Dispatch<React.SetStateAction<string>>, category: string, setCategory: React.Dispatch<React.SetStateAction<string>>) => {

  const getRarityInfo = (rarity: string) => {
    switch (rarity) {
      case 'common': return { color: 'bg-gray-800 border-gray-600', icon: '🟢', description: 'Conquistas básicas, fáceis de obter' };
      case 'rare': return { color: 'bg-gray-800 border-blue-500', icon: '🔵', description: 'Conquistas desafiadoras, requerem habilidade' };
      case 'epic': return { color: 'bg-gray-800 border-purple-500', icon: '🟣', description: 'Conquistas difíceis, para jogadores dedicados' };
      case 'legendary': return { color: 'bg-gray-800 border-yellow-500', icon: '🟡', description: 'Conquistas extremamente raras, para os melhores' };
      default: return { color: 'bg-gray-800 border-gray-600', icon: '⚪', description: 'Selecione uma raridade' };
    }
  };

  const rarityInfo = getRarityInfo(achievement.rarity || 'common');

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Título da Conquista
          </Label>
          <Input
            id="title"
            name="title"
            defaultValue={achievement.title || ''}
            required
            placeholder="Ex: Primeiro Pódio"
            maxLength={50}
            className="h-12 text-lg border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Máximo de 50 caracteres</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Descrição
          </Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={achievement.description || ''}
            required
            placeholder="Descreva como os usuários podem obter esta conquista..."
            rows={5}
            className="border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 min-h-[150px] text-base"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Descreva os requisitos claramente para os usuários</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Categoria
          </Label>
          <Select name="category" value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30">
              <SelectValue placeholder="Selecione categoria" />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom">
              <SelectItem value="geral">Geral</SelectItem>
              <SelectItem value="corrida">Corrida</SelectItem>
              <SelectItem value="habilidade">Habilidade</SelectItem>
              <SelectItem value="tempo">Tempo</SelectItem>
              <SelectItem value="equipe">Equipe</SelectItem>
              <SelectItem value="evento">Evento Especial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="requirement" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Requisito para Desbloqueio
          </Label>
          <RequirementBuilder
            value={requirement}
            onChange={setRequirement}
          />
          <input
            type="hidden"
            name="requirement"
            value={requirement}
            id="requirement"
          />
        </div>
        <input
          type="hidden"
          name="category"
          value={category}
          id="category"
        />

        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Raridade
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['common', 'rare', 'epic', 'legendary'].map((rarity) => {
              const info = getRarityInfo(rarity);
              return (
                <label key={rarity} className="flex flex-col items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="rarity"
                    value={rarity}
                    defaultChecked={achievement.rarity === rarity}
                    className="sr-only"
                  />
                  <div className={`w-full p-4 rounded-xl border-2 ${info.color.replace('text-', '').replace('border-', '')} ${achievement.rarity === rarity ? 'ring-2 ring-primary' : 'group-hover:ring-2 group-hover:ring-primary/50'} transition-all duration-200 transform ${achievement.rarity === rarity ? 'scale-105' : 'group-hover:scale-105'}`}>
                    <div className="text-3xl mb-2">{info.icon}</div>
                    <div className="font-bold capitalize text-base text-white">{rarity}</div>
                    <div className="text-xs text-gray-300 mt-1 text-center font-medium">{info.description}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

const renderRaceForm = (race: Race, raceImage: string, setRaceImage: React.Dispatch<React.SetStateAction<string>>, imagePreview: string, setImagePreview: React.Dispatch<React.SetStateAction<string>>, fileInputRef: React.RefObject<HTMLInputElement>, standings: {category: string}[], standingsLoading: boolean, standingsError: string | null) => (
  <>
    {/* Basic Information Section */}
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Flag className="h-5 w-5 mr-2 text-primary" />
        Informações Básicas
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Título da Corrida
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={race.title || ''}
              required
              placeholder="Ex: Grande Prêmio de Interlagos"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="track" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Pista
            </Label>
            <Input
              id="track"
              name="track"
              defaultValue={race.track || ''}
              required
              placeholder="Ex: Autódromo de Interlagos"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="championship" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Campeonato
            </Label>
            <Select name="championship" defaultValue={race.championship || undefined}>
              <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30">
                <SelectValue placeholder={standings && standings.length > 0 ? "Selecione um campeonato" : "Nenhum campeonato disponível"} />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom">
                {standingsLoading ? (
                  <div className="p-2 text-sm text-gray-500">
                    Carregando campeonatos...
                  </div>
                ) : standingsError ? (
                  <div className="p-2 text-sm text-red-500">
                    {standingsError}
                  </div>
                ) : standings?.length > 0 ? (
                 standings.map((standing) => (
                   <SelectItem key={standing.category} value={standing.category}>
                     {standing.category}
                   </SelectItem>
                 ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">
                    Nenhum campeonato disponível
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Categoria
            </Label>
            <Select name="category" defaultValue={race.category || 'formula'}>
              <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom">
                <SelectItem value="formula">Fórmula</SelectItem>
                <SelectItem value="gt">GT/Endurance</SelectItem>
                <SelectItem value="stock">Stock Car</SelectItem>
                <SelectItem value="rally">Rally</SelectItem>
                <SelectItem value="kart">Kart</SelectItem>
                <SelectItem value="historic">Histórico</SelectItem>
                <SelectItem value="amateur">Amador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Imagem da Corrida
            </Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                 onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                id="raceImageUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert('O arquivo é muito grande. Máximo de 5MB permitido.');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const result = event.target?.result;
                      if (typeof result === 'string') {
                        setImagePreview(result);
                        setRaceImage(result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Race preview"
                      className="w-32 h-20 object-cover rounded-md mx-auto"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview('');
                        setRaceImage('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex justify-center space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      <span>Alterar Imagem</span>
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview('');
                        setRaceImage('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Remover</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Clique para fazer upload ou arraste e solte
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG ou WEBP (Máx. 5MB)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    <span>Selecionar Imagem</span>
                  </Button>
                </div>
              )}
            </div>
            {raceImage && (
              <input type="hidden" name="image" value={raceImage} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Data
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={race.date ? formatDateForInput(race.date) : ''}
              required
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Hora
            </Label>
            <Input
              id="time"
              name="time"
              type="time"
              defaultValue={race.time || '20:00'}
              required
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="laps" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Voltas
            </Label>
            <Input
              id="laps"
              name="laps"
              defaultValue={race.laps || ''}
              placeholder="Ex: 35 voltas"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Duração
            </Label>
            <Input
              id="duration"
              name="duration"
              defaultValue={race.duration || ''}
              placeholder="Ex: 50 min ou 3 horas"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Descrição
        </Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={race.description || ''}
          placeholder="Descreva detalhes sobre a corrida, regras especiais, premiação, etc..."
          rows={4}
          className="border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 min-h-[120px] text-base"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">Informe detalhes relevantes para os participantes</p>
      </div>
    </div>

    {/* Race Settings Section */}
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-primary" />
        Configurações da Corrida
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Status
            </Label>
            <Select name="status" defaultValue={race.status || 'upcoming'}>
              <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom">
                <SelectItem value="upcoming">Próxima</SelectItem>
                <SelectItem value="ongoing">Em andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Máximo de Participantes
            </Label>
            <Input
              id="maxParticipants"
              name="maxParticipants"
              type="number"
              defaultValue={race.maxParticipants?.toString() || '20'}
              required
              min="2"
              max="100"
              placeholder="Ex: 20"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prize" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Premiação (Opcional)
            </Label>
            <Input
              id="prize"
              name="prize"
              type="number"
              defaultValue={race.prize?.toString() || '0'}
              min="0"
              placeholder="Ex: 1000"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Server Configuration Section */}
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Server className="h-5 w-5 mr-2 text-primary" />
        Configuração do Servidor
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serverIp" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              IP do Servidor
            </Label>
            <Input
              id="serverIp"
              name="serverIp"
              defaultValue={race.serverIp || ''}
              placeholder="Ex: 24.152.39.252"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serverPort" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Porta do Servidor
            </Label>
            <Input
              id="serverPort"
              name="serverPort"
              defaultValue={race.serverPort || ''}
              placeholder="Ex: 8095"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>
        </div>
      </div>
    </div>

    {/* UDP Live Timing Configuration Section */}
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Server className="h-5 w-5 mr-2 text-primary" />
        Configuração UDP para Live Timing
      </h3>

      <div className="space-y-4 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Importante:</strong> Configure os endereços UDP para permitir a comunicação entre o plugin Assetto Corsa e o servidor de live timing. Cada corrida pode ter sua própria configuração UDP para permitir múltiplas corridas simultâneas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="udpListenAddress" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              UDP Listen Address (Local)
            </Label>
            <Input
              id="udpListenAddress"
              name="udpListenAddress"
              defaultValue={race.udpListenAddress || '127.0.0.1:11095'}
              placeholder="Ex: 127.0.0.1:11095"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Endereço local onde o plugin escuta mensagens UDP. Deve ser o mesmo que "UDP Plugin Local Port" no Assetto Corsa.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="udpSendAddress" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              UDP Send Address (Plugin)
            </Label>
            <Input
              id="udpSendAddress"
              name="udpSendAddress"
              defaultValue={race.udpSendAddress || '127.0.0.1:12095'}
              placeholder="Ex: 127.0.0.1:12095"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Endereço do plugin para onde as mensagens UDP são enviadas. Antigamente conhecido como "UDP Plugin Address".
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="udpEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Live Timing Ativado
            </Label>
            <Select name="udpEnabled" defaultValue={race.udpEnabled?.toString() || 'true'}>
              <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30">
                <SelectValue placeholder="Selecione status" />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom">
                <SelectItem value="true">Ativado</SelectItem>
                <SelectItem value="false">Desativado</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ative ou desative o live timing para esta corrida.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="udpRefreshInterval" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Intervalo de Atualização (ms)
            </Label>
            <Input
              id="udpRefreshInterval"
              name="udpRefreshInterval"
              type="number"
              defaultValue={race.udpRefreshInterval?.toString() || '1000'}
              placeholder="Ex: 1000"
              min="100"
              max="10000"
              step="100"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Intervalo de atualização dos dados de live timing em milissegundos.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Track Conditions Section */}
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Gauge className="h-5 w-5 mr-2 text-primary" />
        Condições da Pista
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 min-w-0">
          <div className="space-y-2">
            <Label htmlFor="trackTemp" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Temperatura da Pista (°C)
            </Label>
            <Input
              id="trackTemp"
              name="trackTemp"
              type="number"
              step="0.1"
              defaultValue={race.trackTemp?.toString() || '0'}
              placeholder="Ex: 42.5"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="airTemp" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Temperatura do Ar (°C)
            </Label>
            <Input
              id="airTemp"
              name="airTemp"
              type="number"
              step="0.1"
              defaultValue={race.airTemp?.toString() || '0'}
              placeholder="Ex: 28.3"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="windSpeed" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Velocidade do Vento (km/h)
            </Label>
            <Input
              id="windSpeed"
              name="windSpeed"
              type="number"
              step="0.1"
              defaultValue={race.windSpeed?.toString() || '0'}
              placeholder="Ex: 12.5"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="windDirection" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Direção do Vento
            </Label>
            <Select name="windDirection" defaultValue={race.windDirection || 'N'}>
              <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30">
                <SelectValue placeholder="Selecione direção" />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom">
                <SelectItem value="N">Norte (N)</SelectItem>
                <SelectItem value="NE">Nordeste (NE)</SelectItem>
                <SelectItem value="E">Leste (E)</SelectItem>
                <SelectItem value="SE">Sudeste (SE)</SelectItem>
                <SelectItem value="S">Sul (S)</SelectItem>
                <SelectItem value="SW">Sudoeste (SW)</SelectItem>
                <SelectItem value="W">Oeste (W)</SelectItem>
                <SelectItem value="NW">Noroeste (NW)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fuelRecommendation" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Recomendação de Combustível (L)
            </Label>
            <Input
              id="fuelRecommendation"
              name="fuelRecommendation"
              type="number"
              step="0.1"
              defaultValue={race.fuelRecommendation?.toString() || '0'}
              placeholder="Ex: 85.5"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tirePressureFront" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Pressão dos Pneus Dianteiros (PSI)
            </Label>
            <Input
              id="tirePressureFront"
              name="tirePressureFront"
              type="number"
              step="0.1"
              defaultValue={race.tirePressureFront?.toString() || '0'}
              placeholder="Ex: 38.2"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tirePressureRear" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Pressão dos Pneus Traseiros (PSI)
            </Label>
            <Input
              id="tirePressureRear"
              name="tirePressureRear"
              type="number"
              step="0.1"
              defaultValue={race.tirePressureRear?.toString() || '0'}
              placeholder="Ex: 37.8"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brakeBias" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Balanceamento de Freio (%)
            </Label>
            <Input
              id="brakeBias"
              name="brakeBias"
              type="number"
              step="0.1"
              defaultValue={race.brakeBias?.toString() || '0'}
              placeholder="Ex: 52.5"
              min="0"
              max="100"
              className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <Label htmlFor="setupNotes" className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Notas de Configuração
        </Label>
        <Textarea
          id="setupNotes"
          name="setupNotes"
          defaultValue={race.setupNotes || ''}
          placeholder="Informe detalhes sobre configuração recomendada, estratégia, pontos críticos do circuito, etc..."
          rows={3}
          className="border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 min-h-[100px] text-base"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">Ajude os pilotos com informações técnicas importantes</p>
      </div>
    </div>
  </>
);

const renderNewsForm = (newsItem: News, newsTags: string[], setNewsTags: React.Dispatch<React.SetStateAction<string[]>>, tagInput: string, setTagInput: React.Dispatch<React.SetStateAction<string>>, selectedTag: string, setSelectedTag: React.Dispatch<React.SetStateAction<string>>, availableTags: string[], newsImage: string, setNewsImage: React.Dispatch<React.SetStateAction<string>>, newsImagePreview: string, setNewsImagePreview: React.Dispatch<React.SetStateAction<string>>, newsFileInputRef: React.RefObject<HTMLInputElement>) => {

  const handleAddTag = () => {
    if (tagInput.trim() && !newsTags.includes(tagInput.trim())) {
      setNewsTags([...newsTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewsTags(newsTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" defaultValue={newsItem.title || ''} required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="summary">Resumo</Label>
          <Textarea id="summary" name="summary" defaultValue={newsItem.summary || ''} required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content">Conteúdo</Label>
          <Textarea id="content" name="content" defaultValue={newsItem.content || ''} required rows={8} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select name="category" defaultValue={newsItem.category || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Regulamento">Regulamento</SelectItem>
              <SelectItem value="Parceria">Parceria</SelectItem>
              <SelectItem value="Resultados">Resultados</SelectItem>
              <SelectItem value="Campeonato">Campeonato</SelectItem>
              <SelectItem value="Noticias">Notícias</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={newsItem.date ? new Date(newsItem.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Imagem da Notícia
          </Label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
               onClick={() => newsFileInputRef.current?.click()}>
            <input
              ref={newsFileInputRef}
              id="newsImageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    alert('O arquivo é muito grande. Máximo de 5MB permitido.');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const result = event.target?.result;
                    if (typeof result === 'string') {
                      setNewsImagePreview(result);
                      setNewsImage(result);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {newsImagePreview ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={newsImagePreview}
                    alt="News preview"
                    className="w-32 h-20 object-cover rounded-md mx-auto"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewsImagePreview('');
                      setNewsImage('');
                      if (newsFileInputRef.current) {
                        newsFileInputRef.current.value = '';
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex justify-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      newsFileInputRef.current?.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    <span>Alterar Imagem</span>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewsImagePreview('');
                      setNewsImage('');
                      if (newsFileInputRef.current) {
                        newsFileInputRef.current.value = '';
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>Remover</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Clique para fazer upload ou arraste e solte
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG ou WEBP (Máx. 5MB)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    newsFileInputRef.current?.click();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Selecionar Imagem</span>
                </Button>
              </div>
            )}
          </div>
          {newsImage && (
            <input type="hidden" name="image" value={newsImage} />
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="published">Status</Label>
          <Select name="published" defaultValue={newsItem.published?.toString() || 'false'}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom">
              <SelectItem value="true">Publicado</SelectItem>
              <SelectItem value="false">Rascunho</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Tags Section */}
        <div className="space-y-3">
          <Label>Tags</Label>
          <div className="flex space-x-2">
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione uma tag existente ou adicione nova" />
              </SelectTrigger>
              <SelectContent>
                {availableTags.length > 0 ? (
                  availableTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-tags" disabled>Nenhuma tag disponível</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={() => {
                if (selectedTag && !newsTags.includes(selectedTag)) {
                  setNewsTags([...newsTags, selectedTag]);
                  setSelectedTag('');
                }
              }}
              size="sm"
            >
              Adicionar Tag
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Ou adicione uma nova tag"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <Button type="button" onClick={handleAddTag} size="sm">
              Adicionar Nova
            </Button>
          </div>
          
          {newsTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {newsTags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-2">
                  <span>{tag}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
          
          <input type="hidden" name="tags" value={JSON.stringify(newsTags)} />
        </div>
      </div>
    </>
  );
};

const renderStandingForm = (standing: Standing) => {
  // Get current year for season default
  const currentYear = new Date().getFullYear();
  const seasonOptions = [currentYear.toString(), (currentYear - 1).toString(), (currentYear + 1).toString()];

  return (
    <>
      {/* Basic Information Section */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-primary" />
          Informações do Piloto
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Nome do Piloto
              </Label>
              <Input
                id="userName"
                name="userName"
                defaultValue={standing.userName || ''}
                required
                placeholder="Ex: GoldZera"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Equipe (Opcional)
              </Label>
              <Input
                id="team"
                name="team"
                defaultValue={standing.team || ''}
                placeholder="Ex: Porsche GT Team"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="championshipName" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Campeonato (Opcional)
              </Label>
              <Input
                id="championshipName"
                name="championshipName"
                defaultValue={standing.championshipName || ''}
                placeholder="Ex: GT3 Championship"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Categoria
              </Label>
              <Select name="category" defaultValue={standing.category || 'GT3'}>
                <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom">
                  <SelectItem value="GT3">GT3</SelectItem>
                  <SelectItem value="Porsche Cup">Porsche Cup</SelectItem>
                  <SelectItem value="Endurance">Endurance</SelectItem>
                  <SelectItem value="Formula">Fórmula</SelectItem>
                  <SelectItem value="Stock Car">Stock Car</SelectItem>
                  <SelectItem value="Rally">Rally</SelectItem>
                  <SelectItem value="Kart">Kart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="season" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Temporada
              </Label>
              <Select name="season" defaultValue={standing.season || currentYear.toString()}>
                <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30">
                  <SelectValue placeholder="Selecione a temporada" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom">
                  {seasonOptions.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Status
              </Label>
              <Select name="status" defaultValue={standing.status || 'active'}>
                <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom">
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="disqualified">Desclassificado</SelectItem>
                  <SelectItem value="withdrawn">Retirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Statistics Section */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Estatísticas de Performance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Posição na Classificação
              </Label>
              <Input
                id="position"
                name="position"
                type="number"
                defaultValue={standing.position?.toString() || '1'}
                required
                min="1"
                max="100"
                placeholder="Ex: 1"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Pontos Totais
              </Label>
              <Input
                id="points"
                name="points"
                type="number"
                defaultValue={standing.points?.toString() || '0'}
                required
                min="0"
                placeholder="Ex: 145"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wins" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Vitórias
              </Label>
              <Input
                id="wins"
                name="wins"
                type="number"
                defaultValue={standing.wins?.toString() || '0'}
                required
                min="0"
                placeholder="Ex: 3"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="podiums" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Pódios
              </Label>
              <Input
                id="podiums"
                name="podiums"
                type="number"
                defaultValue={standing.podiums?.toString() || '0'}
                required
                min="0"
                placeholder="Ex: 5"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="races" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Corridas Disputadas
              </Label>
              <Input
                id="races"
                name="races"
                type="number"
                defaultValue={standing.races?.toString() || '0'}
                required
                min="0"
                placeholder="Ex: 8"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="polePositions" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Pole Positions
              </Label>
              <Input
                id="polePositions"
                name="polePositions"
                type="number"
                defaultValue={standing.polePositions?.toString() || '0'}
                min="0"
                placeholder="Ex: 2"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fastestLaps" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Voltas Mais Rápidas
              </Label>
              <Input
                id="fastestLaps"
                name="fastestLaps"
                type="number"
                defaultValue={standing.fastestLaps?.toString() || '0'}
                min="0"
                placeholder="Ex: 1"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dnfs" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                DNFs (Não Terminou)
              </Label>
              <Input
                id="dnfs"
                name="dnfs"
                type="number"
                defaultValue={standing.dnfs?.toString() || '0'}
                min="0"
                placeholder="Ex: 0"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="penaltyPoints" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Pontos de Penalidade
              </Label>
              <Input
                id="penaltyPoints"
                name="penaltyPoints"
                type="number"
                defaultValue={standing.penaltyPoints?.toString() || '0'}
                min="0"
                placeholder="Ex: 0"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics Section */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <GanttChart className="h-5 w-5 mr-2 text-primary" />
          Estatísticas Avançadas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bestFinish" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Melhor Resultado
              </Label>
              <Input
                id="bestFinish"
                name="bestFinish"
                type="number"
                defaultValue={standing.bestFinish?.toString() || ''}
                min="1"
                placeholder="Ex: 1"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="averageFinish" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Média de Chegada
              </Label>
              <Input
                id="averageFinish"
                name="averageFinish"
                type="number"
                step="0.1"
                defaultValue={standing.averageFinish?.toString() || ''}
                min="1"
                placeholder="Ex: 2.5"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalTime" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Tempo Total (Opcional)
              </Label>
              <Input
                id="totalTime"
                name="totalTime"
                defaultValue={standing.totalTime || ''}
                placeholder="Ex: 2:35:42.123"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Notas Adicionais (Opcional)
          </Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={standing.notes || ''}
            placeholder="Informe detalhes adicionais sobre o piloto, desempenho, incidentes, etc..."
            rows={3}
            className="border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 min-h-[100px] text-base"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Informações adicionais sobre o piloto ou desempenho</p>
        </div>
      </div>
    </>
  );
};

const renderChampionshipForm = (championship: Championship, availablePilots: string[], selectedPilots: string[], setSelectedPilots: React.Dispatch<React.SetStateAction<string[]>>, drivers: {name: string; points: number; team?: string}[], setDrivers: React.Dispatch<React.SetStateAction<{name: string; points: number; team?: string}[]>>, predefinedTeams: string[]) => {
  
  const handlePilotSelect = (pilot: string) => {
    if (!selectedPilots.includes(pilot)) {
      setSelectedPilots([...selectedPilots, pilot]);
    }
  };

  const handlePilotRemove = (pilot: string) => {
    setSelectedPilots(selectedPilots.filter(p => p !== pilot));
  };

  const handleDriverAdd = () => {
    const available = availablePilots.filter(pilot =>
      !drivers.some(driver => driver.name === pilot)
    );
    
    if (available.length > 0) {
      setDrivers([...drivers, { name: available[0], points: 0, team: '' }]);
    } else {
      console.warn('No available pilots to add');
    }
  };

  const handleDriverRemove = (index: number) => {
    setDrivers(drivers.filter((_, i) => i !== index));
  };

  const handleDriverChange = (index: number, field: string, value: string | number) => {
    const newDrivers = [...drivers];
    if (field === 'name') {
      newDrivers[index].name = value as string;
    } else if (field === 'points') {
      // Ensure points are non-negative
      const pointsValue = typeof value === 'string' ? parseInt(value) || 0 : value as number;
      newDrivers[index].points = Math.max(0, pointsValue);
    } else if (field === 'team') {
      newDrivers[index].team = value as string;
    }
    setDrivers(newDrivers);
  };

  return (
    <>
      {/* Championship Information Section */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Informações do Campeonato
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Nome do Campeonato
              </Label>
              <Input
                id="category"
                name="category"
                defaultValue={championship.category || ''}
                required
                placeholder="Ex: GT3 Championship"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="raceCount" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Número de Corridas
              </Label>
              <Input
                id="raceCount"
                name="raceCount"
                type="number"
                defaultValue={championship.raceCount?.toString() || '0'}
                required
                min="1"
                max="100"
                placeholder="Ex: 8"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vacancies" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Vagas Disponíveis
              </Label>
              <Input
                id="vacancies"
                name="vacancies"
                type="number"
                defaultValue={championship.vacancies?.toString() || '20'}
                required
                min="1"
                max="100"
                placeholder="Ex: 20"
                className="h-11 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Descrição
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={championship.description || ''}
                required
                placeholder="Descreva o campeonato, regras, premiação, etc..."
                rows={5}
                className="border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 min-h-[120px] text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Registered Pilots Section */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-primary" />
          Pilotos Inscritos
        </h3>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Selecionar Pilotos
            </Label>
            <Select onValueChange={handlePilotSelect}>
              <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30">
                <SelectValue placeholder="Selecione um piloto para inscrever" />
              </SelectTrigger>
              <SelectContent>
                {availablePilots && availablePilots.length > 0 ? (
                  availablePilots
                    .filter(pilot => !selectedPilots.includes(pilot))
                    .map(pilot => (
                      <SelectItem key={pilot} value={pilot}>{pilot}</SelectItem>
                    ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">No pilots available</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedPilots.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Pilotos Inscritos ({selectedPilots.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedPilots.map(pilot => (
                  <Badge key={pilot} variant="secondary" className="flex items-center space-x-2">
                    <span>{pilot}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                      onClick={() => handlePilotRemove(pilot)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhum piloto inscrito ainda
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Selecione pilotos no dropdown acima para inscrevê-los neste campeonato
              </p>
            </div>
          )}

          <input type="hidden" name="registeredPilots" value={JSON.stringify(selectedPilots)} />
        </div>
      </div>

      {/* Drivers/Standings Section */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-primary" />
          Classificação Atual
        </h3>

        <div className="space-y-4">
          {drivers.length > 0 ? (
            drivers.map((driver, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Piloto {index + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDriverRemove(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`driver-${index}-name`} className="text-sm font-medium">
                      Nome do Piloto
                    </Label>
                    <Select
                      value={driver.name}
                      onValueChange={(value) => handleDriverChange(index, 'name', value)}
                    >
                      <SelectTrigger className="h-10 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30">
                        <SelectValue placeholder="Selecione um piloto" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePilots && availablePilots.length > 0 ? (
                          availablePilots.map(pilot => (
                            <SelectItem key={pilot} value={pilot}>{pilot}</SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500">No pilots available</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`driver-${index}-points`} className="text-sm font-medium">
                      Pontos
                    </Label>
                    <Input
                      id={`driver-${index}-points`}
                      type="number"
                      value={driver.points}
                      onChange={(e) => handleDriverChange(index, 'points', parseInt(e.target.value) || 0)}
                      min="0"
                      placeholder="Pontos"
                      className="h-10 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`driver-${index}-team`} className="text-sm font-medium">
                      Equipe (Opcional)
                    </Label>
                    <Select
                      value={driver.team || ''}
                      onValueChange={(value) => handleDriverChange(index, 'team', value)}
                    >
                      <SelectTrigger className="h-10 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30">
                        <SelectValue placeholder="Selecione uma equipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma equipe</SelectItem>
                        {predefinedTeams.map(team => (
                          <SelectItem key={team} value={team}>{team}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <BarChart3 className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-1">
                Nenhum piloto na classificação
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Clique no botão abaixo para adicionar pilotos à classificação
              </p>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleDriverAdd}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Piloto à Classificação</span>
          </Button>

          <input type="hidden" name="drivers" value={JSON.stringify(drivers)} />
        </div>
      </div>
    </>
  );
};

export default EditDialog;