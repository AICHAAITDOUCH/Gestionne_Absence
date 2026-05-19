import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Search, Calendar, BookOpen, Clock, Eye, GraduationCap, X, CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import moment from 'moment';

const MesSeances = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeSeance, setActiveSeance] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch all sessions of the stagiaire's group
  const { data: seances, isLoading } = useQuery({
    queryKey: ['myStagiaireSessions'],
    queryFn: async () => (await api.get('/stagiaire/sessions')).data
  });

  const filteredSeances = seances?.filter((s: any) => 
    s.module?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.formateur?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredSeances.length / itemsPerPage);
  const paginatedSeances = filteredSeances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Chargement de votre agenda...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mes Séances</h1>
          <p className="text-muted-foreground mt-1">Consultez l'historique complet et le calendrier de toutes vos séances de cours.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Rechercher par module, formateur..." 
          className="pl-9 bg-card border-border/80 focus:border-primary"
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Main Table Card */}
      <Card className="glass border-none overflow-hidden flex flex-col h-full min-h-[460px]">
        <div className="p-4 border-b flex items-center justify-between bg-card/50">
          <span className="text-sm font-semibold text-foreground">Séances planifiées</span>
          <span className="text-sm text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full">{filteredSeances.length} séance(s)</span>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/80 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-semibold">Module</th>
                <th className="px-6 py-4 font-semibold">Formateur</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Horaires</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedSeances.map((seance: any) => (
                <tr key={seance.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        {seance.module?.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">{seance.module?.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-semibold">
                    👨‍🏫 {seance.formateur?.name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium">
                    {moment(seance.date).format('DD/MM/YYYY')}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-accent" /> {seance.heure_debut} - {seance.heure_fin}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-foreground border uppercase">
                      {seance.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-primary/10 hover:text-primary text-primary font-bold" 
                      onClick={() => { setActiveSeance(seance); setIsDetailOpen(true); }}
                    >
                      <Eye className="w-4 h-4 mr-1.5" /> Détails
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredSeances.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                    Aucune séance ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between bg-card/30">
            <span className="text-xs text-muted-foreground">
              Affichage de {Math.min(filteredSeances.length, (currentPage - 1) * itemsPerPage + 1)} à {Math.min(filteredSeances.length, currentPage * itemsPerPage)} sur {filteredSeances.length} séance(s)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 text-xs font-bold"
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 text-xs font-bold"
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      {isDetailOpen && activeSeance && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-none shadow-2xl glass animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" /> Détails de la Séance
                </CardTitle>
                <CardDescription>Consultez la fiche complète de ce cours.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setIsDetailOpen(false); setActiveSeance(null); }} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Module / Matière</span>
                  <h3 className="text-base font-extrabold text-foreground">{activeSeance.module?.name}</h3>
                  <p className="text-xs text-primary font-semibold">{activeSeance.module?.code} — Vol. horaire : {activeSeance.module?.volume_horaire}h</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Formateur</span>
                    <p className="text-sm font-semibold text-foreground">{activeSeance.formateur?.name}</p>
                    <p className="text-xs text-muted-foreground">{activeSeance.formateur?.email}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Type de cours</span>
                    <p className="text-sm font-bold text-primary uppercase">{activeSeance.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Date</span>
                    <p className="text-sm font-semibold text-foreground">{moment(activeSeance.date).format('DD MMMM YYYY')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Horaires</span>
                    <p className="text-sm font-bold text-foreground flex items-center gap-1"><Clock className="w-4 h-4 text-accent" /> {activeSeance.heure_debut} - {activeSeance.heure_fin}</p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Statut d'appel</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                    activeSeance.is_validated 
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {activeSeance.is_validated ? 'Fait & Validé' : 'En attente d\'appel'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MesSeances;
