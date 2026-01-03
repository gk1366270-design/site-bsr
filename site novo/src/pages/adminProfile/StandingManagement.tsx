import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, BarChart3, Search, Filter, SortAsc, SortDesc, Trophy, Flag, Users, Calendar, Clock, GanttChart, ListFilter, SlidersHorizontal, X } from 'lucide-react';
import { Championship, Standing } from './types';
import { useToast } from '@/hooks/use-toast';
import EditDialog from './EditDialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface StandingManagementProps {
  standings: Championship[];
  setStandings: React.Dispatch<React.SetStateAction<Championship[]>>;
  isLoading: boolean;
}

// Helper function to generate consistent hash codes for strings
String.prototype.hashCode = function() {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
};

const StandingManagement: React.FC<StandingManagementProps> = ({ standings, setStandings, isLoading }) => {
  // Note: The standings prop contains championship data (from standings.json)
  // Each "standing" in the array represents a championship with its drivers, race count, etc.
  // This is used for both the public standings display and admin management
  const championships = standings;
  const setChampionships = setStandings;

  // Predefined teams for the team dropdown
  const predefinedTeams = [
    'Porsche GT Team',
    'Ferrari AF Corse',
    'Mercedes-AMG Team',
    'Audi Sport Team',
    'BMW M Team',
    'Lamborghini Squadra Corse',
    'McLaren Factory Team',
    's Racing',
    'Independent',
    'Privateer'
  ];

  // Predefined categories for the category dropdown
  const predefinedCategories = [
    'GT3 Championship',
    'Porsche Cup',
    'Endurance',
    'Formula 1',
    'Formula 2',
    'Formula 3',
    'Formula 4',
    'Stock Car',
    'Rally',
    'Kart',
    'Historic'
  ];
  const { toast } = useToast();
  const [editItem, setEditItem] = useState<Championship | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'category',
    direction: 'asc'
  });
  const [activeTab, setActiveTab] = useState<string>('grid');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [championshipToDelete, setChampionshipToDelete] = useState<Championship | null>(null);
  const [availablePilots, setAvailablePilots] = useState<string[]>([]);

  // Initialize IDs for championships that don't have them
  useEffect(() => {
    if (championships && championships.length > 0) {
      const needIdAssignment = championships.some(c => !c.id);
      if (needIdAssignment) {
        setChampionships(prev =>
          prev ? prev.map(championship => ({
            ...championship,
            id: championship.id || `championship-${championship.category.hashCode()}`
          })) : []
        );
      }
    }
  }, [championships, setChampionships]);

  // Fetch available pilots from accounts
  useEffect(() => {
    const fetchPilots = async () => {
      try {
        const response = await fetch('/api/accounts');
        if (response.ok) {
          const data = await response.json();
          const pilots = data.map((account: { displayName?: string; username: string }) => account.displayName || account.username);
          setAvailablePilots(pilots);
        }
      } catch (error) {
        console.error('Error fetching pilots:', error);
      }
    };
    
    fetchPilots();
  }, []);

  // Get unique categories for filters
  const categories = useMemo(() => {
    const uniqueCategories = championships ? [...new Set(championships.map(c => c.category))] : [];
    return ['all', ...uniqueCategories];
  }, [championships]);

  // Filtered and sorted championships
  const filteredChampionships = useMemo(() => {
    let result = championships ? [...championships] : [];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(championship =>
        championship.category.toLowerCase().includes(searchLower) ||
        championship.description.toLowerCase().includes(searchLower) ||
        (Array.isArray(championship.drivers) && championship.drivers.some(driver => driver.name.toLowerCase().includes(searchLower)))
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      result = result.filter(championship => championship.category === filterCategory);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'category') {
        return sortConfig.direction === 'asc'
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      } else if (sortConfig.key === 'raceCount') {
        return sortConfig.direction === 'asc'
          ? a.raceCount - b.raceCount
          : b.raceCount - a.raceCount;
      } else if (sortConfig.key === 'vacancies') {
        return sortConfig.direction === 'asc'
          ? a.vacancies - b.vacancies
          : b.vacancies - a.vacancies;
      }
      return 0;
    });

    return result;
  }, [championships, searchTerm, filterCategory, sortConfig]);

  // Statistics
  const stats = useMemo(() => {
    const total = championships ? championships.length : 0;
    const totalRaces = championships ? championships.reduce((sum, championship) => sum + championship.raceCount, 0) : 0;
    const totalVacancies = championships ? championships.reduce((sum, championship) => sum + championship.vacancies, 0) : 0;
    const totalRegistered = championships ? championships.reduce((sum, championship) => sum + championship.registeredPilots.length, 0) : 0;
    
    return { total, totalRaces, totalVacancies, totalRegistered };
  }, [championships]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEdit = useCallback((championship: Championship) => {
    setEditItem(championship);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((championshipId: string) => {
    const championship = championships ? championships.find(c => c.id === championshipId || c.category === championshipId) : null;
    if (championship) {
      setChampionshipToDelete(championship);
      setDeleteConfirmOpen(true);
    }
  }, [championships]);

  const confirmDelete = useCallback(async () => {
    if (championshipToDelete) {
      try {
        // Update local state after successful deletion
        setChampionships(prev => prev ? prev.filter(c => c.id !== championshipToDelete.id && c.category !== championshipToDelete.category) : []);
        toast({
          title: "Sucesso",
          description: `Campeonato "${championshipToDelete.category}" excluído com sucesso.`,
        });
        setDeleteConfirmOpen(false);
      } catch (error) {
        console.error(`Error deleting championship:`, error);
        toast({
          title: "Erro",
          description: `Falha ao excluir campeonato. Por favor, tente novamente.`,
          variant: "destructive",
        });
      }
    }
  }, [championshipToDelete, setChampionships, toast]);

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    try {
      // Validate and parse data safely
      const category = typeof data.category === 'string' ? data.category : 'General';
      const raceCount = data.raceCount ? parseInt(data.raceCount as string) || 0 : 0;
      const vacancies = data.vacancies ? parseInt(data.vacancies as string) || 0 : 20;
      
      // Parse drivers and registeredPilots safely
      let drivers: {name: string; points: number; team?: string}[] = [];
      let registeredPilots: string[] = [];
      
      try {
        drivers = data.drivers && typeof data.drivers === 'string'
          ? JSON.parse(data.drivers as string)
          : Array.isArray(data.drivers) ? data.drivers : [];
      } catch (e) {
        console.warn('Failed to parse drivers:', e);
      }
      
      try {
        registeredPilots = data.registeredPilots && typeof data.registeredPilots === 'string'
          ? JSON.parse(data.registeredPilots as string)
          : Array.isArray(data.registeredPilots) ? data.registeredPilots : [];
      } catch (e) {
        console.warn('Failed to parse registeredPilots:', e);
      }
      
      // Determine if this is an update or create operation
      const isUpdate = editItem && (editItem.id || editItem.category);
      const itemId = isUpdate ? (editItem.id || `championship-${editItem.category.hashCode()}`) : (data.id || `championship-${Date.now()}`);
      
      const savedItem = {
        ...data,
        id: itemId,
        category,
        drivers,
        raceCount,
        vacancies,
        registeredPilots,
        description: typeof data.description === 'string' ? data.description : ''
      } as Championship;
      
      setChampionships(prev => {
        if (!prev) return [savedItem];
        
        // Check if we're updating an existing item
        if (isUpdate) {
          // Find the existing item to update - match by ID first, then by category
          const existingItem = prev.find(item =>
            item.id === itemId ||
            (!item.id && item.category === category) ||
            (editItem && (item.category === editItem.category))
          );
          
          if (existingItem) {
            // Update the existing item
            return prev.map(item =>
              item.id === itemId ||
              (!item.id && item.category === category) ||
              (editItem && item.category === editItem.category)
                ? savedItem
                : item
            );
          } else {
            // If no existing item found, add as new
            return [...prev, savedItem];
          }
        } else {
          // Add new item
          return [...prev, savedItem];
        }
      });
      
      setIsDialogOpen(false);
      setEditItem(null);
      
      toast({
        title: "Sucesso",
        description: `Campeonato ${isUpdate ? 'atualizado' : 'criado'} com sucesso.`,
      });
    } catch (error) {
      console.error(`Error saving championship:`, error);
      toast({
        title: "Erro",
        description: `Falha ao salvar campeonato.`,
        variant: "destructive",
      });
    }
  }, [setChampionships, toast, editItem]);

  const getProgressPercentage = (championship: Championship) => {
    if (championship.vacancies <= 0) return 0;
    return Math.min(100, (championship.registeredPilots.length / championship.vacancies) * 100);
  };

  const renderChampionshipCard = (championship: Championship) => {
    const progress = getProgressPercentage(championship);

    return (
      <Card key={championship.category} className="relative hover:shadow-lg transition-shadow h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-lg">{championship.category}</CardTitle>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(championship)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(championship.category)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              {championship.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="flex items-center space-x-2">
                <Flag className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-xs text-muted-foreground">CORRIDAS</div>
                  <div className="font-semibold">{championship.raceCount}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-xs text-muted-foreground">VAGAS</div>
                  <div className="font-semibold">{championship.vacancies}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="text-xs text-muted-foreground">INSCRITOS</div>
                  <div className="font-semibold">{championship.registeredPilots.length}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-xs text-muted-foreground">PILOTOS</div>
                  <div className="font-semibold">{Array.isArray(championship.drivers) ? championship.drivers.length : 0}</div>
                </div>
              </div>
            </div>

            {Array.isArray(championship.drivers) && championship.drivers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                  Classificação Atual
                </h4>
                <div className="space-y-2">
                  {championship.drivers.slice(0, 3).map((driver, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{index + 1}°</span>
                        <span>{driver.name}</span>
                        {driver.team && (
                          <Badge variant="secondary" className="text-xs">{driver.team}</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">{driver.points} pts</span>
                      </div>
                    </div>
                  ))}
                  {Array.isArray(championship.drivers) && championship.drivers.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      +{championship.drivers.length - 3} mais pilotos
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Inscrições:</span>
                <span className="text-sm font-semibold">
                  {championship.registeredPilots.length}/{championship.vacancies}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className={`h-2 rounded-full ${progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : progress >= 20 ? 'bg-yellow-500' : 'bg-red-500'} transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground cursor-pointer hover:bg-muted/70"
                onClick={() => handleSort('category')}>
              <div className="flex items-center space-x-1">
                <span>Campeonato</span>
                {sortConfig.key === 'category' && (
                  sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </div>
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground">
              Descrição
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground cursor-pointer hover:bg-muted/70"
                onClick={() => handleSort('raceCount')}>
              <div className="flex items-center space-x-1">
                <span>Corridas</span>
                {sortConfig.key === 'raceCount' && (
                  sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </div>
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground cursor-pointer hover:bg-muted/70"
                onClick={() => handleSort('vacancies')}>
              <div className="flex items-center space-x-1">
                <span>Vagas/Inscrições</span>
                {sortConfig.key === 'vacancies' && (
                  sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </div>
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground">
              Pilotos
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredChampionships.map(championship => (
            <tr key={championship.category} className="border-b border-muted/20 hover:bg-muted/50 transition-colors">
              <td className="p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded flex items-center justify-center text-sm bg-primary/10 border border-primary/20">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium line-clamp-1">{championship.category}</span>
                </div>
              </td>
              <td className="p-3">
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {championship.description}
                </div>
              </td>
              <td className="p-3">
                <span className="font-semibold">{championship.raceCount}</span>
              </td>
              <td className="p-3">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{championship.registeredPilots.length}/{championship.vacancies}</span>
                  <Progress value={getProgressPercentage(championship)} className="w-20 h-2" />
                </div>
              </td>
              <td className="p-3">
                <Badge variant="outline" className="text-xs">
                  {Array.isArray(championship.drivers) ? championship.drivers.length : 0} pilotos classificados
                </Badge>
              </td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 hover:bg-primary/10 hover:text-primary transition-all"
                    onClick={() => handleEdit(championship)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    <span className="text-xs">Editar</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 px-2 hover:bg-red-600 hover:text-white transition-all"
                    onClick={() => handleDelete(championship.category)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="text-xs">Excluir</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-primary" />
            <span>Gerenciamento de Campeonatos</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie todos os campeonatos e classificações de sim racing
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => {
              setEditItem({
                id: '',
                category: '',
                drivers: [],
                raceCount: 0,
                vacancies: 20,
                registeredPilots: [],
                description: ''
              });
              setIsDialogOpen(true);
            }}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Campeonato</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <CardTitle className="text-2xl font-bold">{stats.total}</CardTitle>
          <CardDescription>Total de Campeonatos</CardDescription>
        </Card>
        <Card className="text-center p-4">
          <CardTitle className="text-2xl font-bold text-blue-600">{filteredChampionships.length}</CardTitle>
          <CardDescription>Campeonatos Filtrados</CardDescription>
        </Card>
        <Card className="text-center p-4">
          <CardTitle className="text-2xl font-bold text-green-600">{stats.totalRaces}</CardTitle>
          <CardDescription>Total de Corridas</CardDescription>
        </Card>
        <Card className="text-center p-4">
          <CardTitle className="text-2xl font-bold text-purple-600">{stats.totalVacancies}</CardTitle>
          <CardDescription>Total de Vagas</CardDescription>
        </Card>
        <Card className="text-center p-4">
          <CardTitle className="text-2xl font-bold text-orange-600">{stats.totalRegistered}</CardTitle>
          <CardDescription>Total de Inscrições</CardDescription>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Buscar Campeonatos</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, descrição ou piloto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Filtrar por Categoria</label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'Todas' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* View Toggle and Content */}
      <Card>
        <div className="p-4 border-b border-muted/20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="grid">Grade</TabsTrigger>
              <TabsTrigger value="table">Tabela</TabsTrigger>
            </TabsList>
            <div className="text-sm text-muted-foreground">
              {filteredChampionships.length} de {championships ? championships.length : 0} campeonatos
            </div>
          </Tabs>
        </div>

        <CardContent className="p-6">
          {filteredChampionships.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Nenhum campeonato encontrado
              </h3>
              <p className="text-muted-foreground/80">
                Tente ajustar seus filtros ou adicione um novo campeonato
              </p>
            </div>
          ) : activeTab === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChampionships.map((championship, index) => (
                <div key={championship.category} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  {renderChampionshipCard(championship)}
                </div>
              ))}
            </div>
          ) : (
            renderTableView()
          )}
        </CardContent>
      </Card>

      {/* Custom Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl">
          <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Trash2 className="h-5 w-5 mr-2 text-red-500" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
              Tem certeza de que deseja excluir este campeonato?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700 dark:text-gray-200 font-medium mb-2">
              Campeonato: <span className="text-primary font-semibold">"{championshipToDelete?.category}"</span>
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Esta ação não pode ser desfeita. Todos os dados deste campeonato serão permanentemente removidos.
            </p>
          </div>
          
          <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 h-10 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                <span className="font-medium">Cancelar</span>
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="flex-1 h-10 hover:bg-red-600 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="font-medium">Confirmar Exclusão</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditDialog
        item={editItem}
        type="championships"
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        isLoading={isLoading}
        availablePilots={availablePilots}
        predefinedTeams={predefinedTeams}
      />
    </div>
  );
};

export default StandingManagement;