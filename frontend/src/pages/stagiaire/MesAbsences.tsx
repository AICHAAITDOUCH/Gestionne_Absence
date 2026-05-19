import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Search, Calendar, BookOpen, Clock, Eye, AlertTriangle, CheckCircle, HelpCircle, FileText, ChevronRight, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const MesAbsences = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeAbsence, setActiveAbsence] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch absences
  const { data: absences, isLoading } = useQuery({
    queryKey: ['myStagiaireAbsences'],
    queryFn: async () => (await api.get('/stagiaire/absences')).data
  });

  const filteredAbsences = absences?.filter((a: any) => {
    const matchesSearch = 
      a.seance?.module?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.seance?.formateur?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || a.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const totalPages = Math.ceil(filteredAbsences.length / itemsPerPage);
  const paginatedAbsences = filteredAbsences.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Chargement de votre historique...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mes Absences / Retards</h1>
          <p className="text-muted-foreground mt-1">Consultez et suivez l'ensemble de vos absences, retards et l'état de vos justifications.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par module, formateur..." 
            className="pl-9 bg-card border-border/80 focus:border-primary"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Tous les statuts</option>
            <option value="absent">Absents</option>
            <option value="retard">Retards</option>
            <option value="justifie">Justifiés</option>
            <option value="present">Présents</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <Card className="glass border-none overflow-hidden flex flex-col h-full min-h-[460px]">
        <div className="p-4 border-b flex items-center justify-between bg-card/50">
          <span className="text-sm font-semibold text-foreground">Historique d'assiduité</span>
          <span className="text-sm text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full">{filteredAbsences.length} enregistrement(s)</span>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/80 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Module</th>
                <th className="px-6 py-4 font-semibold">Formateur</th>
                <th className="px-6 py-4 font-semibold">Statut</th>
                <th className="px-6 py-4 font-semibold">Remarque</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedAbsences.map((absence: any) => (
                <tr key={absence.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground font-medium">
                    {moment(absence.seance?.date).format('DD/MM/YYYY')}
                    <span className="block text-[10px] text-muted-foreground mt-0.5">{absence.seance?.heure_debut} - {absence.seance?.heure_fin}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      {absence.seance?.module?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-semibold">
                    {absence.seance?.formateur?.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                      absence.status === 'absent' 
                        ? 'bg-destructive/10 text-destructive'
                        : absence.status === 'retard'
                        ? 'bg-amber-500/10 text-amber-600'
                        : absence.status === 'justifie'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-secondary text-foreground'
                    }`}>
                      {absence.status === 'absent' && <AlertTriangle className="w-3 h-3" />}
                      {absence.status === 'justifie' && <CheckCircle className="w-3 h-3" />}
                      {absence.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground italic text-xs max-w-[180px] truncate">
                    {absence.remarque || 'Aucune'}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-primary/10 hover:text-primary text-primary font-bold" 
                      onClick={() => { setActiveAbsence(absence); setIsDetailOpen(true); }}
                    >
                      <Eye className="w-4 h-4 mr-1.5" /> Détails
                    </Button>
                    
                    {absence.status === 'absent' && !absence.justification && (
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs shadow-sm"
                        onClick={() => navigate('/stagiaire/justifications', { state: { selectedAbsenceId: absence.id } })}
                      >
                        Justifier <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAbsences.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                    Aucune absence ou retard répertorié.
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
              Affichage de {Math.min(filteredAbsences.length, (currentPage - 1) * itemsPerPage + 1)} à {Math.min(filteredAbsences.length, currentPage * itemsPerPage)} sur {filteredAbsences.length} enregistrement(s)
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
      {isDetailOpen && activeAbsence && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-none shadow-2xl glass animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Fiche d'Assiduité
                </CardTitle>
                <CardDescription>Consultez le relevé de cette séance.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setIsDetailOpen(false); setActiveAbsence(null); }} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Module</span>
                  <h3 className="text-base font-extrabold text-foreground">{activeAbsence.seance?.module?.name}</h3>
                  <p className="text-xs text-primary font-semibold">{activeAbsence.seance?.module?.code}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Formateur</span>
                    <p className="text-sm font-semibold text-foreground">{activeAbsence.seance?.formateur?.name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Statut constaté</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase mt-1 ${
                      activeAbsence.status === 'absent' 
                        ? 'bg-destructive/10 text-destructive'
                        : activeAbsence.status === 'retard'
                        ? 'bg-amber-500/10 text-amber-600'
                        : activeAbsence.status === 'justifie'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-secondary text-foreground'
                    }`}>
                      {activeAbsence.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Date</span>
                    <p className="text-sm font-semibold text-foreground">{moment(activeAbsence.seance?.date).format('DD MMMM YYYY')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Horaires</span>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1"><Clock className="w-4 h-4 text-accent" /> {activeAbsence.seance?.heure_debut} - {activeAbsence.seance?.heure_fin}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Remarque du Formateur</span>
                  <p className="text-sm text-foreground/80 italic bg-secondary/40 p-3 rounded-lg border mt-1">
                    {activeAbsence.remarque || "Aucune remarque particulière n'a été saisie."}
                  </p>
                </div>

                {activeAbsence.justification && (
                  <div className="pt-3 border-t">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Justification associée</span>
                    <div className="p-3 bg-emerald-50/50 border border-emerald-500/25 rounded-lg space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-700">Statut : {activeAbsence.justification.status?.toUpperCase()}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{moment(activeAbsence.justification.created_at).format('DD/MM/YYYY')}</span>
                      </div>
                      <a 
                        href={activeAbsence.justification.document_path} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-primary font-bold hover:underline block pt-1"
                      >
                        📄 Consulter le document justificatif
                      </a>
                      {activeAbsence.justification.admin_remarque && (
                        <p className="text-[11px] text-muted-foreground pt-1 border-t italic">
                          Remarque Admin : {activeAbsence.justification.admin_remarque}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MesAbsences;
