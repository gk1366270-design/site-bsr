import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Trophy, Search, Filter, SortAsc, SortDesc, Medal, Award, Flag, Zap, Target } from 'lucide-react';
import { Achievement } from './types';
import { useToast } from '@/hooks/use-toast';
import EditDialog from './EditDialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface AchievementManagementProps {
  achievements: Achievement[];
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
  isLoading: boolean;
}

const AchievementManagement: React.FC<AchievementManagementProps> = ({ achievements, setAchievements, isLoading }) => {
  const { toast } = useToast();
  const [editItem, setEditItem] = useState<Achievement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'points',
    direction: 'desc'
  });
  const [activeTab, setActiveTab] = useState<string>('grid');

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(achievements.map(a => a.category))];
    return ['all', ...uniqueCategories];
  }, [achievements]);

  // Filtered and sorted achievements
  const filteredAchievements = useMemo(() => {
    let result = [...achievements];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(achievement =>
        achievement.title.toLowerCase().includes(searchLower) ||
        achievement.description.toLowerCase().includes(searchLower) ||
        achievement.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply rarity filter
    if (filterRarity !== 'all') {
      result = result.filter(achievement => achievement.rarity === filterRarity);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      result = result.filter(achievement => achievement.category === filterCategory);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'points') {
        return sortConfig.direction === 'asc'
          ? a.points - b.points
          : b.points - a.points;
      } else if (sortConfig.key === 'title') {
        return sortConfig.direction === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortConfig.key === 'rarity') {
        const rarityOrder = { 'common': 1, 'rare': 2, 'epic': 3, 'legendary': 4 };
        return sortConfig.direction === 'asc'
          ? rarityOrder[a.rarity] - rarityOrder[b.rarity]
          : rarityOrder[b.rarity] - rarityOrder[a.rarity];
      }
      return 0;
    });

    return result;
  }, [achievements, searchTerm, filterRarity, filterCategory, sortConfig]);

  // Statistics
  const stats = useMemo(() => {
    const total = achievements.length;
    const byRarity = {
      common: achievements.filter(a => a.rarity === 'common').length,
      rare: achievements.filter(a => a.rarity === 'rare').length,
      epic: achievements.filter(a => a.rarity === 'epic').length,
      legendary: achievements.filter(a => a.rarity === 'legendary').length
    };
    
    return { total, byRarity };
  }, [achievements]);

  const handleEdit = useCallback((achievement: Achievement) => {
    setEditItem(achievement);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((achievementId: string) => {
    const achievementToDelete = achievements.find(a => a.id === achievementId);
    const confirmMessage = `Tem certeza de que deseja excluir a conquista "${achievementToDelete?.title}"? Esta ação não pode ser desfeita.`;

    if (window.confirm(confirmMessage)) {
      setAchievements(prev => prev.filter(achievement => achievement.id !== achievementId));
      toast({
        title: "Sucesso",
        description: `Conquista "${achievementToDelete?.title}" excluída com sucesso.`,
      });
    }
  }, [setAchievements, toast, achievements]);

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    try {
      const savedItem = { 
        ...data,
        id: data.id || `achievement-${Date.now()}`,
        createdAt: data.createdAt || new Date().toISOString()
      } as Achievement;

      setAchievements(prev => data.id 
        ? prev.map(item => item.id === data.id ? savedItem : item)
        : [...prev, savedItem]
      );

      setIsDialogOpen(false);
      setEditItem(null);

      toast({
        title: "Sucesso",
        description: `Conquista ${data.id ? 'atualizada' : 'criada'} com sucesso.`,
      });
    } catch (error) {
      console.error(`Erro ao salvar conquista:`, error);
      toast({
        title: "Erro",
        description: `Falha ao salvar conquista. Por favor, tente novamente.`,
        variant: "destructive",
      });
    }
  }, [setAchievements, toast]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return '🟢';
      case 'rare': return '🔵';
      case 'epic': return '🟣';
      case 'legendary': return '🟡';
      default: return '⚪';
    }
  };

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'trophy':
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 'medal':
        return <Medal className="h-8 w-8 text-gray-400" />;
      case 'crown':
        return <Award className="h-8 w-8 text-purple-500" />;
      case 'flag':
        return <Flag className="h-8 w-8 text-green-500" />;
      case 'zap':
        return <Zap className="h-8 w-8 text-yellow-500" />;
      case 'target':
        return <Target className="h-8 w-8 text-amber-600" />;
      default:
        return <Trophy className="h-8 w-8" />;
    }
  };

  const renderAchievementCard = (achievement: Achievement) => {
    const rarityColor = getRarityColor(achievement.rarity);
    const rarityIcon = getRarityIcon(achievement.rarity);

    return (
      <Card
        key={achievement.id}
        className="relative group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden w-full h-full"
      >
        <CardHeader className="pb-3">

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${rarityColor} border-2 shadow-md transition-transform duration-300`}>
                {achievement.icon ? getAchievementIcon(achievement.icon) : <Trophy className="h-8 w-8" />}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-3">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{achievement.title}</CardTitle>
                <Badge className={rarityColor.replace('bg-', '').replace('text-', '').replace('border-', '') + ' text-xs font-semibold py-1 px-3'}>
                  {rarityIcon} {achievement.rarity}
                </Badge>
              </div>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                {achievement.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/10 px-2 py-1">
                  {achievement.category}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground flex items-center">
                <span className="mr-2">📅</span>
                {new Date(achievement.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {achievement.requirement && (
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  Requisito: {achievement.requirement}
                </div>
              )}
            </div>

            {/* Action Buttons - Visible below content */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10 border-primary text-primary hover:bg-primary/5 hover:text-primary-dark transition-all duration-200"
                onClick={() => handleEdit(achievement)}
              >
                <Edit className="h-4 w-4 mr-2" />
                <span className="font-medium">Editar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                onClick={() => handleDelete(achievement.id)}
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
              Descrição
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground cursor-pointer hover:bg-muted/70" 
                onClick={() => handleSort('rarity')}>
              <div className="flex items-center space-x-1">
                <span>Raridade</span>
                {sortConfig.key === 'rarity' && (
                  sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </div>
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground cursor-pointer hover:bg-muted/70" 
                onClick={() => handleSort('points')}>
              <div className="flex items-center space-x-1">
                <span>Pontos</span>
                {sortConfig.key === 'points' && (
                  sortConfig.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </div>
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground">
              Categoria
            </th>
            <th className="p-3 text-left text-sm font-semibold text-muted-foreground">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredAchievements.map(achievement => (
            <tr key={achievement.id} className="border-b border-muted/20 hover:bg-muted/50 transition-colors">
              <td className="p-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-sm ${getRarityColor(achievement.rarity)}`}>
                    {getRarityIcon(achievement.rarity)}
                  </div>
                  <span className="font-medium">{achievement.title}</span>
                </div>
              </td>
              <td className="p-3">
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {achievement.description}
                </div>
              </td>
              <td className="p-3">
                <Badge className={getRarityColor(achievement.rarity).replace('bg-', '').replace('text-', '').replace('border-', '') + ' text-xs'}>
                  {achievement.rarity}
                </Badge>
              </td>
              <td className="p-3">
                <span className="font-semibold">{achievement.requirement || 'N/A'}</span>
              </td>
              <td className="p-3">
                <Badge variant="outline" className="text-xs">
                  {achievement.category}
                </Badge>
              </td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 hover:bg-primary/10 hover:text-primary transition-all"
                    onClick={() => handleEdit(achievement)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    <span className="text-xs">Editar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 hover:bg-destructive/10 hover:text-destructive transition-all"
                    onClick={() => handleDelete(achievement.id)}
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
            <span>Gerenciamento de Conquistas</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie e organize todas as conquistas da plataforma de sim racing
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => {
              setEditItem({
                id: '',
                title: '',
                description: '',
                icon: 'trophy',
                category: categories[1] || '',
                rarity: 'common',
                points: 0,
                createdAt: new Date().toISOString()
              });
              setIsDialogOpen(true);
            }}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Conquista</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <CardTitle className="text-2xl font-bold">{stats.total}</CardTitle>
          <CardDescription>Total de Conquistas</CardDescription>
        </Card>
        <Card className="text-center p-4">
          <CardTitle className="text-2xl font-bold text-gray-600">{stats.byRarity.common}</CardTitle>
          <CardDescription>Comuns</CardDescription>
        </Card>
        <Card className="text-center p-4">
          <CardTitle className="text-2xl font-bold text-blue-600">{stats.byRarity.rare}</CardTitle>
          <CardDescription>Raras</CardDescription>
        </Card>
        <Card className="text-center p-4">
          <CardTitle className="text-2xl font-bold text-purple-600">{stats.byRarity.epic}</CardTitle>
          <CardDescription>Épicas</CardDescription>
        </Card>
        <Card className="text-center p-4 md:col-span-2">
          <CardTitle className="text-2xl font-bold text-yellow-600">{stats.byRarity.legendary}</CardTitle>
          <CardDescription>Lendárias</CardDescription>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Buscar Conquistas</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por título, descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Filtrar por Raridade</label>
            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione raridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="common">Comum</SelectItem>
                <SelectItem value="rare">Rara</SelectItem>
                <SelectItem value="epic">Épica</SelectItem>
                <SelectItem value="legendary">Lendária</SelectItem>
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
              {filteredAchievements.length} de {achievements.length} conquistas
            </div>
          </Tabs>
        </div>

        <CardContent className="p-6">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Nenhuma conquista encontrada
              </h3>
              <p className="text-muted-foreground/80">
                Tente ajustar seus filtros ou adicione uma nova conquista
              </p>
            </div>
          ) : activeTab === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement, index) => (
                <div key={achievement.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  {renderAchievementCard(achievement)}
                </div>
              ))}
            </div>
          ) : (
            renderTableView()
          )}
        </CardContent>
      </Card>

      <EditDialog
        item={editItem}
        type="achievements"
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AchievementManagement;