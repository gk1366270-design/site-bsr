import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Flag, Search, Filter, SortAsc, SortDesc, Calendar, Clock, Users, Thermometer, Wind, Droplet, Gauge, FileText, Trophy, X } from 'lucide-react';
import { Race } from './types';
import { useToast } from '@/hooks/use-toast';
import EditDialog from './EditDialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface RaceManagementProps {
  races: Race[];
  setRaces: React.Dispatch<React.SetStateAction<Race[]>>;
  isLoading: boolean;
}

const RaceManagement: React.FC<RaceManagementProps> = ({ races, setRaces, isLoading }) => {
  const { toast } = useToast();
  const [editItem, setEditItem] = useState<Race | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'asc'
  });
  const [activeTab, setActiveTab] = useState<string>('grid');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [raceToDelete, setRaceToDelete] = useState<Race | null>(null);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(races.map(r => r.category))];
    return ['all', ...uniqueCategories.filter(Boolean)];
  }, [races]);

  // Filtered and sorted races
  const filteredRaces = useMemo(() => {
    let result = [...races];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(race =>
        race.title.toLowerCase().includes(searchLower) ||
        race.track.toLowerCase().includes(searchLower) ||
        race.description?.toLowerCase().includes(searchLower) ||
        race.category?.toLowerCase().includes(searchLower) ||
        race.championship?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(race => race.status === filterStatus);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      result = result.filter(race => race.category === filterCategory);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortConfig.key === 'title') {
        return sortConfig.direction === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortConfig.key === 'participants') {
        const aCount = typeof a.participants === 'number' ? a.participants : (Array.isArray(a.participants) ? a.participants.length : 0);
        const bCount = typeof b.participants === 'number' ? b.participants : (Array.isArray(b.participants) ? b.participants.length : 0);
        return sortConfig.direction === 'asc' ? aCount - bCount : bCount - aCount;
      }
      return 0;
    });

    return result;
  }, [races, searchTerm, filterStatus, filterCategory, sortConfig]);

  // Statistics
  const stats = useMemo(() => {
    const total = races.length;
    const byStatus = {
      upcoming: races.filter(r => r.status === 'upcoming').length,
      ongoing: races.filter(r => r.status === 'ongoing').length,
      completed: races.filter(r => r.status === 'completed').length
    };
    
    const totalParticipants = races.reduce((sum, race) => {
      const count = typeof race.participants === 'number' ? race.participants : (Array.isArray(race.participants) ? race.participants.length : 0);
      return sum + count;
    }, 0);
    
    return { total, byStatus, totalParticipants };
  }, [races]);

  const handleEdit = useCallback((race: Race) => {
    setEditItem(race);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((raceId: string) => {
    const race = races.find(r => r.id === raceId);
    if (race) {
      setRaceToDelete(race);
      setDeleteConfirmOpen(true);
    }
  }, [races]);

  const confirmDelete = useCallback(async () => {
    if (raceToDelete) {
      try {
        // Call the API to delete the race from the server
        const response = await fetch(`/api/races/${raceToDelete.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Update local state after successful deletion
        setRaces(prev => prev.filter(race => race.id !== raceToDelete.id));
        toast({
          title: "Sucesso",
          description: `Corrida "${raceToDelete.title}" excluída com sucesso.`,
        });
        setDeleteConfirmOpen(false);
      } catch (error) {
        console.error(`Error deleting race:`, error);
        toast({
          title: "Erro",
          description: `Falha ao excluir corrida. Por favor, tente novamente.`,
          variant: "destructive",
        });
      }
    }
  }, [raceToDelete, setRaces, toast]);

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    try {
      const savedItem = {
        ...data,
        id: data.id || `race-${Date.now()}`,
        createdAt: data.createdAt || new Date().toISOString()
      } as Race;
      
      // Call the appropriate API endpoint
      let response;
      if (data.id) {
        // Update existing race
        response = await fetch(`/api/races/${data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(savedItem),
          credentials: 'include'
        });
      } else {
        // Create new race
        response = await fetch('/api/races', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(savedItem),
          credentials: 'include'
        });
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update local state
      setRaces(prev => data.id
        ? prev.map(item => item.id === data.id ? result.item : item)
        : [result.item, ...prev]
      );
      
      setIsDialogOpen(false);
      setEditItem(null);
      
      toast({
        title: "Sucesso",
        description: `Corrida ${data.id ? 'atualizada' : 'criada'} com sucesso.`,
      });
    } catch (error) {
      console.error(`Error saving race:`, error);
      toast({
        title: "Erro",
        description: `Falha ao salvar corrida. Por favor, tente novamente.`,
        variant: "destructive",
      });
    }
  }, [setRaces, toast]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80">✅ Concluída</Badge>;
      case 'ongoing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100/80">⏰ Em andamento</Badge>;
      case 'upcoming':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80">📅 Próxima</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'formula': return <Trophy className="h-4 w-4 text-red-500" />;
      case 'gt': return <Trophy className="h-4 w-4 text-blue-500" />;
      case 'stock': return <Trophy className="h-4 w-4 text-green-500" />;
      case 'rally': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'kart': return <Trophy className="h-4 w-4 text-purple-500" />;
      case 'historic': return <Trophy className="h-4 w-4 text-amber-500" />;
      case 'amateur': return <Trophy className="h-4 w-4 text-gray-500" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const renderRaceCard = (race: Race) => {
    const participantCount = typeof race.participants === 'number'
      ? race.participants
      : (Array.isArray(race.participants) ? race.participants.length : 0);

    const getProgressColor = () => {
      const percentage = (participantCount / race.maxParticipants) * 100;
      if (percentage >= 80) return 'bg-green-500';
      if (percentage >= 50) return 'bg-blue-500';
      if (percentage >= 20) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    return (
      <Card
        key={race.id}
        className="relative group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden w-full h-full"
      >
        <CardHeader className="pb-3">

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-primary/10 border-2 border-primary/20 shadow-md transition-transform duration-300">
                <Flag className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-3">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{race.title}</CardTitle>
                {getStatusBadge(race.status)}
              </div>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                {race.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/10 px-2 py-1 flex items-center">
                  {getCategoryIcon(race.category)}
                  <span className="ml-1">{race.category}</span>
                </Badge>
                {race.championship && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {race.championship}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{new Date(race.date).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground/80">PISTA</div>
                  <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">{race.track}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground/80">PARTICIPANTES</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{participantCount}/{race.maxParticipants}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground/80">DURAÇÃO</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{race.duration || race.laps || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground/80">TEMPERATURA</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{race.trackTemp}°C pista</div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Inscrições:</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {participantCount}/{race.maxParticipants}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className={`h-2 rounded-full ${getProgressColor()} transition-all duration-500`}
                  style={{ width: `${(participantCount / race.maxParticipants) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons - Visible below content */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10 border-primary text-primary hover:bg-primary/5 hover:text-primary-dark transition-all duration-200"
                onClick={() => handleEdit(race)}
              >
                <Edit className="h-4 w-4 mr-2" />
                <span className="font-medium">Editar</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 h-10 hover:bg-red-600 hover:text-white transition-all duration-200"
                onClick={() => handleDelete(race.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="font-medium">Excluir</span>
              </Button>
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
                onClick={() => handleSort('title')}>
              <div className="flex items-center space-x-1">
                <span>Título</span>
                {sortConfig.key === 'title' && (
                  sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </div>
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground">
              Pista
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground">
              Campeonato
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground cursor-pointer hover:bg-muted/70"
                onClick={() => handleSort('participants')}>
              <div className="flex items-center space-x-1">
                <span>Participantes</span>
                {sortConfig.key === 'participants' && (
                  sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </div>
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground">
              Data
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground">
              Status
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredRaces.map(race => {
            const participantCount = typeof race.participants === 'number'
              ? race.participants
              : (Array.isArray(race.participants) ? race.participants.length : 0);
              
            return (
              <tr key={race.id} className="border-b border-muted/20 hover:bg-muted/50 transition-colors">
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded flex items-center justify-center text-sm bg-primary/10 border border-primary/20">
                      <Flag className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium line-clamp-1">{race.title}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {race.track}
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant="outline" className="text-xs">
                    {race.championship || 'N/A'}
                  </Badge>
                </td>
                <td className="p-3">
                  <span className="font-semibold">{participantCount}/{race.maxParticipants}</span>
                </td>
                <td className="p-3">
                  <div className="text-sm text-muted-foreground">
                    {new Date(race.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </div>
                </td>
                <td className="p-3">
                  {getStatusBadge(race.status)}
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 hover:bg-primary/10 hover:text-primary transition-all"
                      onClick={() => handleEdit(race)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      <span className="text-xs">Editar</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 px-2 hover:bg-red-600 hover:text-white transition-all"
                      onClick={() => handleDelete(race.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span className="text-xs">Excluir</span>
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
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
            <Flag className="h-8 w-8 text-primary" />
            <span>Gerenciamento de Corridas</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie e organize todas as corridas, campeonatos e eventos de sim racing
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => {
              setEditItem({
                id: '',
                title: '',
                track: '',
                date: new Date().toISOString(),
                time: '20:00',
                laps: '',
                duration: '',
                pilots: 0,
                description: '',
                championship: '',
                trackTemp: 0,
                airTemp: 0,
                windSpeed: 0,
                windDirection: '',
                fuelRecommendation: 0,
                tirePressureFront: 0,
                tirePressureRear: 0,
                brakeBias: 0,
                setupNotes: '',
                participants: 0,
                maxParticipants: 20,
                prize: 0,
                category: 'formula',
                status: 'upcoming',
                createdAt: new Date().toISOString()
              });
              setIsDialogOpen(true);
            }}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Corrida</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <CardTitle className="text-2xl font-bold">{stats.total}</CardTitle>
          <CardDescription>Total de Corridas</CardDescription>
        </Card>
        <Card className="text-center p-4">
          <CardTitle className="text-2xl font-bold text-yellow-600">{stats.byStatus.upcoming}</CardTitle>
          <CardDescription>Próximas</CardDescription>
        </Card>
        <Card className="text-center p-4">
          <CardTitle className="text-2xl font-bold text-blue-600">{stats.byStatus.ongoing}</CardTitle>
          <CardDescription>Em Andamento</CardDescription>
        </Card>
        <Card className="text-center p-4">
          <CardTitle className="text-2xl font-bold text-green-600">{stats.byStatus.completed}</CardTitle>
          <CardDescription>Concluídas</CardDescription>
        </Card>
        <Card className="text-center p-4 md:col-span-2">
          <CardTitle className="text-2xl font-bold text-purple-600">{stats.totalParticipants}</CardTitle>
          <CardDescription>Total de Inscrições</CardDescription>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Buscar Corridas</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por título, pista, campeonato ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Filtrar por Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="upcoming">Próximas</SelectItem>
                <SelectItem value="ongoing">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Filtrar por Categoria</label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione categoria" />
              </SelectTrigger>
              <SelectContent>
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
              {filteredRaces.length} de {races.length} corridas
            </div>
          </Tabs>
        </div>

        <CardContent className="p-6">
          {filteredRaces.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Nenhuma corrida encontrada
              </h3>
              <p className="text-muted-foreground/80">
                Tente ajustar seus filtros ou adicione uma nova corrida
              </p>
            </div>
          ) : activeTab === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRaces.map((race, index) => (
                <div key={race.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  {renderRaceCard(race)}
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
              Tem certeza de que deseja excluir esta corrida?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700 dark:text-gray-200 font-medium mb-2">
              Corrida: <span className="text-primary font-semibold">"{raceToDelete?.title}"</span>
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Esta ação não pode ser desfeita. Todos os dados desta corrida serão permanentemente removidos.
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
        type="races"
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
};

export default RaceManagement;