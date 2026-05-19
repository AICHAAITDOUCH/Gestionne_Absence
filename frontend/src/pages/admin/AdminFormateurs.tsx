import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Trash2, Edit, Search, X, Eye } from 'lucide-react';

const AdminFormateurs = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Active formateur for edit or detail view
  const [activeFormateur, setActiveFormateur] = useState<any>(null);

  // Form states
  const [formateurForm, setFormateurForm] = useState({ name: '', email: '', password: '', phone: '' });

  // Queries
  const { data: formateurs, isLoading } = useQuery({
    queryKey: ['formateurs'],
    queryFn: async () => (await api.get('/formateurs')).data
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/formateurs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formateurs'] });
      setIsAddOpen(false);
      setFormateurForm({ name: '', email: '', password: '', phone: '' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/formateurs/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formateurs'] });
      setIsEditOpen(false);
      setActiveFormateur(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/formateurs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formateurs'] })
  });

  // Form handlers
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formateurForm);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(activeFormateur);
  };

  const openEdit = (formateur: any) => {
    setActiveFormateur({
      id: formateur.id,
      name: formateur.name,
      email: formateur.email,
      phone: formateur.phone || '',
    });
    setIsEditOpen(true);
  };

  const openDetail = (formateur: any) => {
    setActiveFormateur(formateur);
    setIsDetailOpen(true);
  };

  // Filter formateurs
  const filtered = formateurs?.filter((f: any) => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Chargement des formateurs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestion des Formateurs</h1>
          <p className="text-muted-foreground mt-1">Créez et gérez les comptes des formateurs de votre établissement.</p>
        </div>
        <div>
          <Button onClick={() => setIsAddOpen(true)} className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Ajouter un Formateur
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="glass border-none overflow-hidden flex flex-col h-full min-h-[500px]">
        <div className="p-4 border-b flex items-center justify-between gap-4 bg-card/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher par nom ou email..." 
              className="pl-9 bg-background/50 border-border/80 focus:border-primary"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-sm text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full">{filtered.length} formateur(s)</span>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/80 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-semibold">Formateur</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Telephone</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user: any) => (
                <tr key={user.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-sm">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-foreground">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground font-medium">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground font-medium">{user.phone || 'Non renseigné'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary text-muted-foreground" onClick={() => openDetail(user)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-secondary hover:text-foreground text-muted-foreground" onClick={() => openEdit(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
                        if(confirm('Êtes-vous sûr de vouloir supprimer ce formateur ?')) deleteMutation.mutate(user.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                    Aucun formateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-none shadow-2xl glass animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Ajouter un Formateur</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAddOpen(false)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Nom complet</label>
                  <Input value={formateurForm.name} onChange={e => setFormateurForm({...formateurForm, name: e.target.value})} required placeholder="Jane Doe" className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Email</label>
                  <Input type="email" value={formateurForm.email} onChange={e => setFormateurForm({...formateurForm, email: e.target.value})} required placeholder="jane@example.com" className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Mot de passe</label>
                  <Input type="password" value={formateurForm.password} onChange={e => setFormateurForm({...formateurForm, password: e.target.value})} required placeholder="••••••" minLength={6} className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Téléphone</label>
                  <Input value={formateurForm.phone} onChange={e => setFormateurForm({...formateurForm, phone: e.target.value})} placeholder="0600000000" className="bg-background/50 border-border/80" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
                  <Button type="submit" disabled={createMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">Ajouter</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && activeFormateur && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-none shadow-2xl glass animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Modifier le Formateur</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(false)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Nom complet</label>
                  <Input value={activeFormateur.name} onChange={e => setActiveFormateur({...activeFormateur, name: e.target.value})} required placeholder="Jane Doe" className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Email</label>
                  <Input type="email" value={activeFormateur.email} onChange={e => setActiveFormateur({...activeFormateur, email: e.target.value})} required placeholder="jane@example.com" className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Mot de passe (laisser vide pour ne pas modifier)</label>
                  <Input type="password" value={activeFormateur.password || ''} onChange={e => setActiveFormateur({...activeFormateur, password: e.target.value})} placeholder="••••••" minLength={6} className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Téléphone</label>
                  <Input value={activeFormateur.phone} onChange={e => setActiveFormateur({...activeFormateur, phone: e.target.value})} placeholder="0600000000" className="bg-background/50 border-border/80" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
                  <Button type="submit" disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">Sauvegarder</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && activeFormateur && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-none shadow-2xl glass animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Détails Formateur</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsDetailOpen(false)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="w-14 h-14 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xl">
                  {activeFormateur.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{activeFormateur.name}</h3>
                  <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                    Formateur / Enseignant
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground font-semibold">Email:</span>
                  <span className="font-medium text-foreground">{activeFormateur.email}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground font-semibold">Téléphone:</span>
                  <span className="font-medium text-foreground">{activeFormateur.phone || 'Non spécifié'}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-muted-foreground font-semibold">Création du compte:</span>
                  <span className="font-medium text-foreground">{new Date(activeFormateur.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Fermer</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminFormateurs;
