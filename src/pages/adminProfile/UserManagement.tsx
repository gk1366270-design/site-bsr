import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users, RefreshCw, User, Mail, Calendar, Trophy } from 'lucide-react';
import { User as UserType } from './types';
import { useToast } from '@/hooks/use-toast';
import EditDialog from './EditDialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserManagementProps {
  users: UserType[];
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
  isLoading: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, isLoading }) => {
  const { toast } = useToast();
  const [editItem, setEditItem] = useState<UserType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Load users from accounts.json
  const fetchUsers = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/data/accounts.json');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const accounts = await response.json();
      
      // Convert accounts to UserType format
      const usersData: UserType[] = accounts.map((account: {
        username: string;
        displayName?: string;
        email?: string;
        role?: string;
        createdAt?: string;
        lastLogin?: string;
        steam?: {
          id?: string;
          displayName?: string;
          avatar?: string;
        };
        stats?: {
          wins: number;
          podiums: number;
          points: number;
        };
      }) => ({
        id: account.username || `user-${Date.now()}`,
        username: account.username,
        displayName: account.displayName || account.username,
        email: account.email || '',
        role: account.role || 'user',
        createdAt: account.createdAt || new Date().toISOString(),
        isActive: true,
        lastLogin: account.lastLogin || new Date().toISOString(),
        steam: account.steam || {},
        stats: account.stats || { wins: 0, podiums: 0, points: 0 }
      }));
      
      setUsers(usersData);
      
      toast({
        title: "Success",
        description: `Users loaded successfully. Found ${usersData.length} users.`,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: `Failed to load users.`,
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [setUsers, toast]);

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = useCallback((user: UserType) => {
    setEditItem(user);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((userId: string) => {
    const confirmMessage = `Are you sure you want to delete user ${users.find(u => u.id === userId)?.username || userId}?`;
    
    if (window.confirm(confirmMessage)) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast({
        title: "Success",
        description: `User deleted successfully.`,
      });
    }
  }, [setUsers, toast, users]);

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    try {
      const savedItem: UserType = { 
        id: data.id as string || `user-${Date.now()}`,
        username: data.username as string || `user${Date.now()}`,
        displayName: data.displayName as string || data.username as string,
        email: data.email as string || '',
        role: data.role as 'admin' | 'user' | 'premium' || 'user',
        createdAt: data.createdAt as string || new Date().toISOString(),
        isActive: data.isActive === 'true',
        lastLogin: data.lastLogin as string || new Date().toISOString(),
        steam: editItem?.steam || {},
        stats: editItem?.stats || { wins: 0, podiums: 0, points: 0 }
      };
      
      setUsers(prev => data.id 
        ? prev.map(item => item.id === data.id ? savedItem : item)
        : [...prev, savedItem]
      );
      
      setIsDialogOpen(false);
      setEditItem(null);
      
      toast({
        title: "Success",
        description: `User ${data.id ? 'updated' : 'created'} successfully.`,
      });
    } catch (error) {
      console.error(`Error saving user:`, error);
      toast({
        title: "Error",
        description: `Failed to save user.`,
        variant: "destructive",
      });
    }
  }, [setUsers, toast, editItem]);

  const renderUserCard = (user: UserType) => (
    <Card className="glass-card overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 hover:-translate-y-2 transform-gpu">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            {user.steam?.avatar ? (
              <AvatarImage src={user.steam.avatar} alt={user.displayName || user.username} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                {user.displayName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold truncate">
              {user.displayName || user.username}
            </CardTitle>
            <CardDescription className="truncate">@{user.username}</CardDescription>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline" className="text-xs border-primary/30">
                {(user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1)}
              </Badge>
              {user.role === 'admin' && (
                <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {user.email && (
            <div className="flex items-center space-x-3 p-2 bg-accent/50 rounded-lg">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground truncate">{user.email}</span>
            </div>
          )}

          <div className="flex items-center space-x-3 p-2 bg-accent/50 rounded-lg">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Joined: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>

          {user.stats && (
            <div className="pt-4 border-t border-border/50">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Statistics</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div key="wins" className="flex flex-col items-center">
                  <Trophy className="h-6 w-6 text-yellow-500 mb-2" />
                  <span className="text-2xl font-bold">{user.stats.wins}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Wins</span>
                </div>
                <div key="podiums" className="flex flex-col items-center">
                  <Trophy className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-2xl font-bold">{user.stats.podiums}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Podiums</span>
                </div>
                <div key="points" className="flex flex-col items-center">
                  <Users className="h-6 w-6 text-blue-500 mb-2" />
                  <span className="text-2xl font-bold">{user.stats.points}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Points</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Moved below stats as requested */}
          <div className="pt-4 border-t border-border/50 flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(user)}
              className="flex-1 hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(user.id)}
              className="flex-1 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary" />
            <span>Gerenciamento de Usuários</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Gerencie todos os usuários da plataforma e suas contas</p>
          <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{users.length} usuários</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className={`h-2 w-2 rounded-full ${isRefreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
              <span>{isRefreshing ? 'Atualizando...' : 'Dados carregados'}</span>
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={fetchUsers}
            disabled={isRefreshing || isLoading}
            className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Usuários'}</span>
          </Button>
          <Button onClick={() => {
            setEditItem({
              id: '',
              username: `user${Date.now()}`,
              displayName: '',
              role: 'user',
              createdAt: new Date().toISOString(),
              isActive: true,
              lastLogin: new Date().toISOString(),
              stats: { wins: 0, podiums: 0, points: 0 }
            });
            setIsDialogOpen(true);
          }} className="flex items-center space-x-2 bg-primary hover:bg-primary/90 transition-all">
            <Plus className="h-4 w-4" />
            <span>Adicionar Usuário</span>
          </Button>
        </div>
      </div>

      {users.length === 0 ? (
        <Card className="text-center py-16 bg-accent/20 border-dashed border-2 border-primary/30">
          <CardContent>
            <div className="mb-4">
              <Users className="h-12 w-12 text-primary/50 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Nenhum usuário encontrado</h3>
            <p className="text-muted-foreground/80 mb-4">Clique em "Atualizar Usuários" para carregar dados de accounts.json</p>
            <Button
              variant="outline"
              onClick={fetchUsers}
              disabled={isRefreshing}
              className="flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Carregar Usuários</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <div key={user.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              {renderUserCard(user)}
            </div>
          ))}
        </div>
      )}

      <EditDialog
        item={editItem}
        type="users"
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
};

export default UserManagement;