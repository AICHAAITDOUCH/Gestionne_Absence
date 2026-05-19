import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Trash2, Edit, Search, Upload, FileSpreadsheet, AlertTriangle, X, CheckCircle, Eye } from 'lucide-react';

const AdminStagiaires = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Active student for edit or detail view
  const [activeStudent, setActiveStudent] = useState<any>(null);

  // Form states
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', phone: '', groupe_id: '' });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Queries
  const { data: stagiaires, isLoading } = useQuery({
    queryKey: ['stagiaires'],
    queryFn: async () => (await api.get('/stagiaires')).data
  });

  const { data: groupes } = useQuery({
    queryKey: ['groupes'],
    queryFn: async () => (await api.get('/groupes')).data
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/stagiaires', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stagiaires'] });
      setIsAddOpen(false);
      setStudentForm({ name: '', email: '', password: '', phone: '', groupe_id: '' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/stagiaires/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stagiaires'] });
      setIsEditOpen(false);
      setActiveStudent(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/stagiaires/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stagiaires'] })
  });

  // Form handlers
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(studentForm);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(activeStudent);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setIsImporting(true);
    setImportResults(null);

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const res = await api.post('/stagiaires/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResults(res.data);
      queryClient.invalidateQueries({ queryKey: ['stagiaires'] });
    } catch (err: any) {
      setImportResults({
        errors: [err.response?.data?.message || 'Erreur lors de l\'importation.']
      });
    } finally {
      setIsImporting(false);
    }
  };

  const openEdit = (student: any) => {
    setActiveStudent({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      groupe_id: student.groupe_id || ''
    });
    setIsEditOpen(true);
  };

  const openDetail = (student: any) => {
    setActiveStudent(student);
    setIsDetailOpen(true);
  };

  // Filter students
  const filtered = stagiaires?.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.groupe?.name && s.groupe.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Chargement des stagiaires...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestion des Stagiaires</h1>
          <p className="text-muted-foreground mt-1">Créez, gérez et importez les comptes étudiants de votre établissement.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsImportOpen(true)} variant="outline" className="h-10 hover:bg-secondary/60">
            <Upload className="w-4 h-4 mr-2" /> Importer
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Ajouter un Stagiaire
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="glass border-none overflow-hidden flex flex-col h-full min-h-[500px]">
        <div className="p-4 border-b flex items-center justify-between gap-4 bg-card/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher par nom, email ou groupe..." 
              className="pl-9 bg-background/50 border-border/80 focus:border-primary"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-sm text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full">{filtered.length} stagiaire(s)</span>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/80 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-semibold">Stagiaire</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Groupe</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user: any) => (
                <tr key={user.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-foreground">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground font-medium">{user.email}</span>
                      <span className="text-xs text-muted-foreground/70">{user.phone || 'Non renseigné'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {user.groupe?.name || 'Aucun'}
                    </span>
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
                        if(confirm('Êtes-vous sûr de vouloir supprimer ce stagiaire ?')) deleteMutation.mutate(user.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    Aucun stagiaire trouvé.
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
              <CardTitle className="text-xl font-bold">Ajouter un Stagiaire</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAddOpen(false)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Nom complet</label>
                  <Input value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} required placeholder="John Doe" className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Email</label>
                  <Input type="email" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} required placeholder="john@example.com" className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Mot de passe</label>
                  <Input type="password" value={studentForm.password} onChange={e => setStudentForm({...studentForm, password: e.target.value})} required placeholder="••••••" minLength={6} className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Téléphone</label>
                  <Input value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} placeholder="0600000000" className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Groupe d'affectation</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={studentForm.groupe_id} onChange={e => setStudentForm({...studentForm, groupe_id: e.target.value})} required
                  >
                    <option value="">Sélectionner un groupe</option>
                    {groupes?.map((g: any) => <option key={g.id} value={g.id}>{g.name} - {g.filiere}</option>)}
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
      {isEditOpen && activeStudent && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-none shadow-2xl glass animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Modifier le Stagiaire</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(false)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Nom complet</label>
                  <Input value={activeStudent.name} onChange={e => setActiveStudent({...activeStudent, name: e.target.value})} required placeholder="John Doe" className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Email</label>
                  <Input type="email" value={activeStudent.email} onChange={e => setActiveStudent({...activeStudent, email: e.target.value})} required placeholder="john@example.com" className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Mot de passe (laisser vide pour ne pas modifier)</label>
                  <Input type="password" value={activeStudent.password || ''} onChange={e => setActiveStudent({...activeStudent, password: e.target.value})} placeholder="••••••" minLength={6} className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Téléphone</label>
                  <Input value={activeStudent.phone} onChange={e => setActiveStudent({...activeStudent, phone: e.target.value})} placeholder="0600000000" className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Groupe d'affectation</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={activeStudent.groupe_id} onChange={e => setActiveStudent({...activeStudent, groupe_id: e.target.value})} required
                  >
                    <option value="">Sélectionner un groupe</option>
                    {groupes?.map((g: any) => <option key={g.id} value={g.id}>{g.name} - {g.filiere}</option>)}
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

      {/* Detail Modal */}
      {isDetailOpen && activeStudent && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-none shadow-2xl glass animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Détails Stagiaire</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsDetailOpen(false)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                  {activeStudent.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{activeStudent.name}</h3>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Stagiaire
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground font-semibold">Email:</span>
                  <span className="font-medium text-foreground">{activeStudent.email}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground font-semibold">Téléphone:</span>
                  <span className="font-medium text-foreground">{activeStudent.phone || 'Non spécifié'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground font-semibold">Groupe:</span>
                  <span className="font-bold text-primary">{activeStudent.groupe?.name || 'Aucun'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground font-semibold">Filière:</span>
                  <span className="font-medium text-foreground">{activeStudent.groupe?.filiere || 'Aucune'}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-muted-foreground font-semibold">Date d'inscription:</span>
                  <span className="font-medium text-foreground">{new Date(activeStudent.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Fermer</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-none shadow-2xl glass animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold flex items-center">
                <FileSpreadsheet className="w-5 h-5 mr-2 text-emerald-500" /> Importer la liste
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setIsImportOpen(false); setImportResults(null); setImportFile(null); }} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleImportSubmit} className="space-y-4">
                <div className="p-4 border-2 border-dashed border-border/80 rounded-xl bg-background/50 hover:bg-secondary/20 transition-colors flex flex-col items-center justify-center text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="font-medium text-sm text-foreground">Glissez-déposez ou cliquez pour charger</span>
                  <span className="text-xs text-muted-foreground/75 mt-1">Fichiers acceptés : .xlsx, .csv (Headers requis: Nom, Email, Groupe)</span>
                  <input 
                    type="file" 
                    accept=".csv,.xlsx" 
                    onChange={e => setImportFile(e.target.files?.[0] || null)}
                    className="absolute opacity-0 cursor-pointer h-20 w-80" 
                  />
                  {importFile && (
                    <div className="mt-3 p-2 bg-primary/10 text-primary font-bold text-xs rounded-lg flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-primary" /> {importFile.name}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => { setIsImportOpen(false); setImportResults(null); setImportFile(null); }}>Annuler</Button>
                  <Button type="submit" disabled={isImporting || !importFile} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    {isImporting ? 'Importation...' : 'Lancer l\'importation'}
                  </Button>
                </div>
              </form>

              {importResults && (
                <div className="mt-4 p-4 rounded-xl bg-secondary/30 space-y-2 max-h-60 overflow-y-auto border border-border/60">
                  <h4 className="font-bold text-sm text-foreground border-b pb-1">Résultats de l'importation :</h4>
                  {importResults.message && (
                    <div className="flex items-center text-emerald-600 font-bold text-xs gap-1.5 p-2 bg-emerald-50 rounded-lg">
                      <CheckCircle className="w-4 h-4" /> {importResults.message}
                    </div>
                  )}
                  {importResults.errors && importResults.errors.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Erreurs / Lignes ignorées ({importResults.errors.length}) :
                      </span>
                      <ul className="list-disc pl-5 text-xs text-destructive/80 space-y-1">
                        {importResults.errors.map((err: string, i: number) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminStagiaires;
