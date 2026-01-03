import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Newspaper } from 'lucide-react';
import { News } from './types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import EditDialog from './EditDialog';

interface NewsManagementProps {
  news: News[];
  setNews: React.Dispatch<React.SetStateAction<News[]>>;
  isLoading: boolean;
}

const NewsManagement: React.FC<NewsManagementProps> = ({ news, setNews, isLoading }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [editItem, setEditItem] = useState<News | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleEdit = useCallback((newsItem: News) => {
    setEditItem(newsItem);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((newsId: string) => {
    const confirmMessage = `Tem certeza de que deseja excluir este artigo de notícia?`;
    
    if (window.confirm(confirmMessage)) {
      setNews(prev => prev.filter(item => item.id !== newsId));
      toast({
        title: "Sucesso",
        description: `Artigo de notícia excluído com sucesso.`,
      });
    }
  }, [setNews, toast]);

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    try {
      // Get current user's display name or username as author
      const authorName = user?.displayName || user?.username || 'Admin';
      
      const savedItem = {
        ...data,
        id: data.id || `news-${Date.now()}`,
        author: authorName, // Automatically set the author
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as News;
       
      setNews(prev => data.id
        ? prev.map(item => item.id === data.id ? savedItem : item)
        : [...prev, savedItem]
      );
       
      setIsDialogOpen(false);
      setEditItem(null);
       
      toast({
        title: "Sucesso",
        description: `Artigo de notícia ${data.id ? 'atualizado' : 'criado'} com sucesso.`,
      });
    } catch (error) {
      console.error(`Error saving news:`, error);
      toast({
        title: "Erro",
        description: `Falha ao salvar artigo de notícia.`,
        variant: "destructive",
      });
    }
  }, [setNews, toast, user]);

  const renderNewsCard = (newsItem: News) => (
    <Card key={newsItem.id} className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Newspaper className="h-5 w-5" />
            <CardTitle className="text-lg">{newsItem.title}</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(newsItem)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(newsItem.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{newsItem.summary}</p>
          
          {/* Tags display */}
          {newsItem.tags && newsItem.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {newsItem.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Badge variant={newsItem.published ? 'default' : 'secondary'}>
              {newsItem.published ? 'Publicado' : 'Rascunho'}
            </Badge>
            {newsItem.category && (
              <Badge variant="secondary" className="text-xs">
                {newsItem.category}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">{newsItem.views || 0} visualizações</span>
          </div>
          
          {/* Author and date info */}
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            {newsItem.author && (
              <span>Por: {newsItem.author}</span>
            )}
            {newsItem.date && (
              <span>Data: {new Date(newsItem.date).toLocaleDateString('pt-BR')}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gerenciamento de Notícias</h2>
        <Button onClick={() => {
          setEditItem({
            id: '',
            title: '',
            content: '',
            summary: '',
            image: '',
            category: '',
            published: false,
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Notícia
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map(renderNewsCard)}
      </div>

      <EditDialog
        item={editItem}
        type="news"
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
};

export default NewsManagement;