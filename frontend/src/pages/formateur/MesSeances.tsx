import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Trash2, Calendar, Clock, Edit, X, ShieldAlert, CheckCircle, GraduationCap } from 'lucide-react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const MesSeances = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form States
  const [newSeance, setNewSeance] = useState({
    module_id: '',
    groupe_id: '',
    date: '',
    heure_debut: '',
    heure_fin: '',
    type: 'cours'
  });

  const [editSeance, setEditSeance] = useState({
    id: 0,
    module_id: '',
    groupe_id: '',
    date: '',
    heure_debut: '',
    heure_fin: '',
    type: 'cours'
  });

  // Fetch groups affected to formateur
  const { data: groupes } = useQuery({
    queryKey: ['myGroupes'],
    queryFn: async () => (await api.get('/formateur/groupes')).data
  });

  // Fetch modules belonging to formateur
  const { data: modules } = useQuery({
    queryKey: ['myModules'],
    queryFn: async () => (await api.get('/formateur/modules')).data
  });

  // Fetch all séances taught by current formateur
  const { data: seances, isLoading } = useQuery({
    queryKey: ['mySeances'],
    queryFn: async () => (await api.get('/formateur/seances')).data
  });

  // Dynamic filter for modules based on selected group in creation form
  const addGroupModules = newSeance.groupe_id 
    ? modules?.filter((m: any) => m.groupe_id?.toString() === newSeance.groupe_id.toString()) || []
    : modules || [];

  // Dynamic filter for modules based on selected group in edit form
  const editGroupModules = editSeance.groupe_id 
    ? modules?.filter((m: any) => m.groupe_id?.toString() === editSeance.groupe_id.toString()) || []
    : modules || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => {
      // Find the currently authenticated user's ID
      return api.get('/user').then(({ data: user }) => {
        return api.post('/seances', { ...data, formateur_id: user.id });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySeances'] });
      setIsAddOpen(false);
      setNewSeance({ module_id: '', groupe_id: '', date: '', heure_debut: '', heure_fin: '', type: 'cours' });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Erreur lors de la création de la séance.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      return api.get('/user').then(({ data: user }) => {
        return api.put(`/seances/${data.id}`, { ...data, formateur_id: user.id });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySeances'] });
      setIsEditOpen(false);
      setEditSeance({ id: 0, module_id: '', groupe_id: '', date: '', heure_debut: '', heure_fin: '', type: 'cours' });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Erreur lors de la modification de la séance.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/seances/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySeances'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Vous ne pouvez pas supprimer une séance validée.");
    }
  });

  const checkConflict = (date: string, start: string, end: string, idToIgnore: number = 0) => {
    return seances?.some((s: any) => {
      if (s.id === idToIgnore) return false;
      if (s.date !== date) return false;
      // Check for overlap
      const sStart = s.heure_debut;
      const sEnd = s.heure_fin;
      return (start >= sStart && start < sEnd) || (end > sStart && end <= sEnd) || (start <= sStart && end >= sEnd);
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkConflict(newSeance.date, newSeance.heure_debut, newSeance.heure_fin)) {
      alert("⚠️ Conflit d'horaire ! Vous avez déjà une séance planifiée sur cette plage horaire.");
      return;
    }
    createMutation.mutate(newSeance);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkConflict(editSeance.date, editSeance.heure_debut, editSeance.heure_fin, editSeance.id)) {
      alert("⚠️ Conflit d'horaire ! Vous avez déjà une séance planifiée sur cette plage horaire.");
      return;
    }
    updateMutation.mutate(editSeance);
  };

  const handleOpenEdit = (seance: any) => {
    if (seance.is_validated) {
      alert("Cette séance est validée et verrouillée. Seul un administrateur peut modifier ses détails.");
      return;
    }
    setEditSeance({
      id: seance.id,
      module_id: seance.module_id?.toString() || '',
      groupe_id: seance.groupe_id?.toString() || '',
      date: seance.date || '',
      heure_debut: seance.heure_debut || '',
      heure_fin: seance.heure_fin || '',
      type: seance.type || 'cours'
    });
    setIsEditOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Chargement de vos séances...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mes Séances</h1>
          <p className="text-muted-foreground mt-1">Planifiez de nouvelles séances et gérez la feuille d'appel de vos cours.</p>
        </div>
        <div>
          <Button onClick={() => setIsAddOpen(true)} className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Nouvelle Séance
          </Button>
        </div>
      </div>

      {/* Seances table card */}
      <Card className="glass border-none overflow-hidden animate-in fade-in duration-300">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/80 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Horaire</th>
                  <th className="px-6 py-4 font-semibold">Module</th>
                  <th className="px-6 py-4 font-semibold">Groupe</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {seances?.map((seance: any) => (
                  <tr key={seance.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-4">
                      {seance.is_validated ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                          <CheckCircle className="w-3.5 h-3.5" /> Validée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600">
                          <ShieldAlert className="w-3.5 h-3.5" /> En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary/70" />
                        {moment(seance.date).format('DD/MM/YYYY')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/75" />
                        {seance.heure_debut} - {seance.heure_fin}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground">{seance.module?.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                        {seance.groupe?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-secondary/80 text-muted-foreground">
                        {seance.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          onClick={() => navigate(`/formateur/faire-appel/${seance.id}`)}
                          className="h-8 text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary"
                        >
                          {seance.is_validated ? "Voir l'appel" : "Faire l'appel"}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover:bg-accent/10 hover:text-accent text-accent" 
                          onClick={() => handleOpenEdit(seance)}
                          disabled={seance.is_validated}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10" 
                          onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) deleteMutation.mutate(seance.id);
                          }}
                          disabled={seance.is_validated}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {seances?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Aucune séance planifiée dans votre espace.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-none shadow-2xl glass animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Nouvelle Séance
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAddOpen(false)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">1. Groupe</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newSeance.groupe_id} 
                    onChange={e => setNewSeance({...newSeance, groupe_id: e.target.value, module_id: ''})} 
                    required
                  >
                    <option value="">Sélectionner votre groupe...</option>
                    {groupes?.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.name} - {g.filiere}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">
                    2. Module {newSeance.groupe_id && <span className="text-[10px] text-primary font-bold">(filtré par groupe)</span>}
                  </label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newSeance.module_id} 
                    onChange={e => setNewSeance({...newSeance, module_id: e.target.value})} 
                    required
                  >
                    <option value="">Sélectionner un module...</option>
                    {addGroupModules.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Date de la séance</label>
                  <Input type="date" value={newSeance.date} onChange={e => setNewSeance({...newSeance, date: e.target.value})} required className="bg-background/50 border-border/80" />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="text-sm font-semibold text-muted-foreground mb-1 block">Heure début</label>
                    <Input type="time" value={newSeance.heure_debut} onChange={e => setNewSeance({...newSeance, heure_debut: e.target.value})} required className="bg-background/50 border-border/80" />
                  </div>
                  <div className="w-1/2">
                    <label className="text-sm font-semibold text-muted-foreground mb-1 block">Heure fin</label>
                    <Input type="time" value={newSeance.heure_fin} onChange={e => setNewSeance({...newSeance, heure_fin: e.target.value})} required className="bg-background/50 border-border/80" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Type de séance</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newSeance.type} 
                    onChange={e => setNewSeance({...newSeance, type: e.target.value})} 
                    required
                  >
                    <option value="cours">Cours théorique</option>
                    <option value="tp">Travaux Pratiques (TP)</option>
                    <option value="td">Travaux Dirigés (TD)</option>
                    <option value="examen">Contrôle / Examen</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
                  <Button type="submit" disabled={createMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">Planifier</Button>
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
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Modifier la Séance
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(false)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">1. Groupe</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editSeance.groupe_id} 
                    onChange={e => setEditSeance({...editSeance, groupe_id: e.target.value, module_id: ''})} 
                    required
                  >
                    <option value="">Sélectionner votre groupe...</option>
                    {groupes?.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.name} - {g.filiere}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">
                    2. Module {editSeance.groupe_id && <span className="text-[10px] text-primary font-bold">(filtré par groupe)</span>}
                  </label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editSeance.module_id} 
                    onChange={e => setEditSeance({...editSeance, module_id: e.target.value})} 
                    required
                  >
                    <option value="">Sélectionner un module...</option>
                    {editGroupModules.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Date de la séance</label>
                  <Input type="date" value={editSeance.date} onChange={e => setEditSeance({...editSeance, date: e.target.value})} required className="bg-background/50 border-border/80" />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="text-sm font-semibold text-muted-foreground mb-1 block">Heure début</label>
                    <Input type="time" value={editSeance.heure_debut} onChange={e => setEditSeance({...editSeance, heure_debut: e.target.value})} required className="bg-background/50 border-border/80" />
                  </div>
                  <div className="w-1/2">
                    <label className="text-sm font-semibold text-muted-foreground mb-1 block">Heure fin</label>
                    <Input type="time" value={editSeance.heure_fin} onChange={e => setEditSeance({...editSeance, heure_fin: e.target.value})} required className="bg-background/50 border-border/80" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Type de séance</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editSeance.type} 
                    onChange={e => setEditSeance({...editSeance, type: e.target.value})} 
                    required
                  >
                    <option value="cours">Cours théorique</option>
                    <option value="tp">Travaux Pratiques (TP)</option>
                    <option value="td">Travaux Dirigés (TD)</option>
                    <option value="examen">Contrôle / Examen</option>
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

export default MesSeances;
