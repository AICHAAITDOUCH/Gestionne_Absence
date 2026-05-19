import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar as CalendarIcon, Users, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import moment from 'moment';

const fetchFormateurStats = async () => {
  const { data } = await api.get('/dashboard/formateur');
  return data;
};

const FormateurDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['formateurStats'],
    queryFn: fetchFormateurStats,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Chargement des statistiques...</div>;
  }

  if (error) {
    return <div className="text-destructive">Erreur lors du chargement des statistiques.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Formateur</h1>
        <p className="text-muted-foreground mt-1">Gérez vos séances et marquez les présences.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="glass border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Séances d'aujourd'hui</p>
              <div className="p-2 bg-primary/10 rounded-full">
                <CalendarIcon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline space-x-3 mt-2">
              <h2 className="text-3xl font-bold tracking-tight">{data.seancesAujourdhui}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Groupes</p>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline space-x-3 mt-2">
              <h2 className="text-3xl font-bold tracking-tight">{data.totalGroupes}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Heures Dispensées</p>
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline space-x-3 mt-2">
              <h2 className="text-3xl font-bold tracking-tight">{data.heuresDispensees ?? 0}h</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Vos prochaines séances</h2>
        <Card className="glass border-none shadow-sm">
          <CardContent className="p-0">
            {data.prochainesSeances.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">Aucune séance prévue.</div>
            ) : (
              data.prochainesSeances.map((seance: any) => (
                <div key={seance.id} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-secondary/20 transition-colors">
                  <div>
                    <h4 className="font-semibold text-lg">{seance.module.name} ({seance.groupe.name})</h4>
                    <p className="text-sm text-muted-foreground">
                      {moment(seance.date).format('DD/MM/YYYY')} • {seance.heure_debut} - {seance.heure_fin}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                    Faire l'appel
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormateurDashboard;
