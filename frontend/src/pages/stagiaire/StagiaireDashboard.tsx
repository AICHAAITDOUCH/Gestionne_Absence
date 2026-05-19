import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import moment from 'moment';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))'];

const fetchStagiaireStats = async () => {
  const { data } = await api.get('/dashboard/stagiaire');
  return data;
};

const StagiaireDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stagiaireStats'],
    queryFn: fetchStagiaireStats,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Chargement des statistiques...</div>;
  }

  if (error) {
    return <div className="text-destructive">Erreur lors du chargement des statistiques.</div>;
  }

  const chartData = [
    { name: 'Présences', value: data.presences || 1 }, // Default 1 so chart isn't empty
    { name: 'Absences', value: data.absences || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon Espace</h1>
        <p className="text-muted-foreground mt-1">Suivez votre assiduité et vos prochaines séances.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="glass border-none shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Résumé de l'assiduité</CardTitle>
            <CardDescription>Vue d'ensemble de vos présences (en heures approx)</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium">Présences</p>
                  <p className="text-2xl font-bold">{data.presences}h</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-destructive" />
                <div>
                  <p className="text-sm font-medium">Absences</p>
                  <p className="text-2xl font-bold text-destructive">{data.absences}h</p>
                </div>
              </div>
            </div>
            <div className="h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-sm">
          <CardHeader>
            <CardTitle>Prochaine Séance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.prochaineSeance ? (
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-semibold text-lg text-primary">{data.prochaineSeance.module.name}</h4>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {moment(data.prochaineSeance.date).isSame(moment(), 'day') ? "Aujourd'hui" : moment(data.prochaineSeance.date).format('DD/MM/YYYY')}
                    , {data.prochaineSeance.heure_debut} - {data.prochaineSeance.heure_fin}
                  </span>
                </div>
                <div className="mt-4 text-xs font-medium bg-background px-2 py-1 rounded w-fit text-foreground flex items-center gap-2">
                   Formateur: {data.prochaineSeance.formateur.name}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Aucune séance programmée.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Dernières absences</h2>
        <Card className="glass border-none shadow-sm overflow-hidden">
          {data.dernieresAbsences.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">Aucune absence enregistrée.</div>
          ) : (
            <div className="divide-y">
              {data.dernieresAbsences.map((absence: any) => (
                <div key={absence.id} className="p-4 flex justify-between items-center bg-card">
                  <div className="flex gap-4 items-center">
                    <div className={`p-2 rounded-full ${absence.justification ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
                      {absence.justification ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{absence.seance.module.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {moment(absence.seance.date).format('DD MMMM YYYY')} • {absence.seance.heure_debut} - {absence.seance.heure_fin}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-md border ${
                    absence.justification 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : 'bg-warning/10 text-warning border-warning/20'
                  }`}>
                    {absence.justification ? `Justifiée (${absence.justification.status})` : 'Non justifiée'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StagiaireDashboard;
