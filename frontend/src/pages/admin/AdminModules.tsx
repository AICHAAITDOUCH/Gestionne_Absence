import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Trash2, Edit, X, BookOpen, User, Users } from 'lucide-react';

const AdminModules = () => {
  const queryClient = useQueryClient();
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form States
  const [newModule, setNewModule] = useState({ name: '', code: '', volume_horaire: '', formateur_id: '', groupe_id: '' });
  const [editModule, setEditModule] = useState({ id: 0, name: '', code: '', volume_horaire: '', formateur_id: '', groupe_id: '' });

  // Fetch modules
  const { data: modules, isLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => (await api.get('/modules')).data
  });

  // Fetch all formateurs
  const { data: formateurs } = useQuery({
    queryKey: ['formateurs'],
    queryFn: async () => (await api.get('/formateurs')).data
  });

  // Dependent query for creating new module: groups taught by selected formateur
  const { data: addFormateurGroupes, isLoading: loadingAddGroupes } = useQuery({
    queryKey: ['formateurGroupes', newModule.formateur_id],
    queryFn: async () => {
      if (!newModule.formateur_id) return [];
      return (await api.get(`/formateurs/${newModule.formateur_id}/groupes`)).data;
    },
    enabled: !!newModule.formateur_id
  });

  // Dependent query for editing module: groups taught by selected formateur
  const { data: editFormateurGroupes, isLoading: loadingEditGroupes } = useQuery({
    queryKey: ['formateurGroupes', editModule.formateur_id],
    queryFn: async () => {
      if (!editModule.formateur_id) return [];
      return (await api.get(`/formateurs/${editModule.formateur_id}/groupes`)).data;
    },
    enabled: !!editModule.formateur_id
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/modules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      setIsAddOpen(false);
      setNewModule({ name: '', code: '', volume_horaire: '', formateur_id: '', groupe_id: '' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/modules/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      setIsEditOpen(false);
      setEditModule({ id: 0, name: '', code: '', volume_horaire: '', formateur_id: '', groupe_id: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/modules/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modules'] })
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newModule);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(editModule);
  };

  const handleOpenEdit = (mod: any) => {
    setEditModule({
      id: mod.id,
      name: mod.name,
      code: mod.code,
      volume_horaire: mod.volume_horaire || '',
      formateur_id: mod.formateur_id || '',
      groupe_id: mod.groupe_id || ''
    });
    setIsEditOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Chargement des modules...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestion des Modules</h1>
          <p className="text-muted-foreground mt-1">Créez, gérez et affectez les modules aux formateurs et groupes.</p>
        </div>
        <div>
          <Button onClick={() => setIsAddOpen(true)} className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Nouveau Module
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="glass border-none overflow-hidden flex flex-col h-full min-h-[500px]">
        <div className="p-4 border-b flex items-center justify-between bg-card/50">
          <span className="text-sm font-semibold text-foreground">Modules de formation</span>
          <span className="text-sm text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full">{modules?.length || 0} module(s)</span>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/80 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Nom du Module</th>
                <th className="px-6 py-4 font-semibold">Volume Horaire</th>
                <th className="px-6 py-4 font-semibold">Formateur affecté</th>
                <th className="px-6 py-4 font-semibold">Groupe associé</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {modules?.map((mod: any) => (
                <tr key={mod.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">{mod.code}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">{mod.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{mod.volume_horaire ? `${mod.volume_horaire}h` : 'Non spécifié'}</td>
                  <td className="px-6 py-4">
                    {mod.formateur ? (
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                        {mod.formateur.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/60 italic">Non affecté</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {mod.groupe ? (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {mod.groupe.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/60 italic">Non associé</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="hover:bg-accent/10 hover:text-accent text-accent" onClick={() => handleOpenEdit(mod)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => {
                        if(confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) deleteMutation.mutate(mod.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!modules || modules.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Aucun module trouvé.
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
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Nouveau Module
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAddOpen(false)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Nom du module</label>
                  <Input value={newModule.name} onChange={e => setNewModule({...newModule, name: e.target.value})} required placeholder="Développement Front-end" className="bg-background/50 border-border/80" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-1 block">Code</label>
                    <Input value={newModule.code} onChange={e => setNewModule({...newModule, code: e.target.value})} required placeholder="M201" className="bg-background/50 border-border/80" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-1 block">Volume Horaire</label>
                    <Input type="number" value={newModule.volume_horaire} onChange={e => setNewModule({...newModule, volume_horaire: e.target.value})} placeholder="120" className="bg-background/50 border-border/80" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> 1. Formateur
                  </label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newModule.formateur_id} 
                    onChange={e => setNewModule({...newModule, formateur_id: e.target.value, groupe_id: ''})} 
                    required
                  >
                    <option value="">Sélectionner un formateur...</option>
                    {formateurs?.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> 2. Groupe {newModule.formateur_id && <span className="text-[10px] text-primary font-bold">(filtré par formateur)</span>}
                  </label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newModule.groupe_id} 
                    onChange={e => setNewModule({...newModule, groupe_id: e.target.value})} 
                    required
                    disabled={loadingAddGroupes}
                  >
                    <option value="">
                      {loadingAddGroupes ? 'Chargement des groupes...' : 'Sélectionner un groupe...'}
                    </option>
                    {addFormateurGroupes?.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.name} - {g.filiere}</option>
                    ))}
                  </select>
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
      {isEditOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-none shadow-2xl glass animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Modifier le Module
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(false)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Nom du module</label>
                  <Input value={editModule.name} onChange={e => setEditModule({...editModule, name: e.target.value})} required className="bg-background/50 border-border/80" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-1 block">Code</label>
                    <Input value={editModule.code} onChange={e => setEditModule({...editModule, code: e.target.value})} required className="bg-background/50 border-border/80" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-1 block">Volume Horaire</label>
                    <Input type="number" value={editModule.volume_horaire} onChange={e => setEditModule({...editModule, volume_horaire: e.target.value})} className="bg-background/50 border-border/80" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> 1. Formateur
                  </label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editModule.formateur_id} 
                    onChange={e => setEditModule({...editModule, formateur_id: e.target.value, groupe_id: ''})} 
                    required
                  >
                    <option value="">Sélectionner un formateur...</option>
                    {formateurs?.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> 2. Groupe {editModule.formateur_id && <span className="text-[10px] text-primary font-bold">(filtré par formateur)</span>}
                  </label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editModule.groupe_id} 
                    onChange={e => setEditModule({...editModule, groupe_id: e.target.value})} 
                    required
                    disabled={loadingEditGroupes}
                  >
                    <option value="">
                      {loadingEditGroupes ? 'Chargement des groupes...' : 'Sélectionner un groupe...'}
                    </option>
                    {editFormateurGroupes?.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.name} - {g.filiere}</option>
                    ))}
                  </select>
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
    </div>
  );
};

export default AdminModules;
