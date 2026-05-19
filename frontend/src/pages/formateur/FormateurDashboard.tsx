import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar as CalendarIcon, Users, Clock, ShieldAlert, Award, ChevronRight, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const fetchFormateurStats = async () => {
  const { data } = await api.get('/dashboard/formateur');
  return data;
};

const FormateurDashboard = () => {
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['formateurStats'],
    queryFn: fetchFormateurStats,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Chargement des statistiques...</div>;
  }

  if (error || !data) {
    return <div className="text-destructive p-8 text-center font-bold">Erreur lors du chargement des statistiques.</div>;
  }

  // Pre-calculate SVG Chart dimensions and paths safely
  const chartData = data.chartData || [];
  const chartWidth = 500;
  const chartHeight = 180;
  const maxVal = Math.max(...chartData.map((d: any) => d.absences), 5);

  const points = chartData.map((d: any, index: number) => {
    const x = chartData.length > 1 ? (index / (chartData.length - 1)) * (chartWidth - 40) + 20 : 20;
    const y = chartHeight - (d.absences / maxVal) * (chartHeight - 40) - 20;
    return { x, y, label: d.name, val: d.absences };
  });

  const linePath = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p: any) => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - 20} L ${points[0].x} ${chartHeight - 20} Z`
    : '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tableau de bord Formateur</h1>
          <p className="text-muted-foreground mt-1">Gérez vos séances, visualisez l'assiduité de vos groupes et marquez les absences.</p>
        </div>
        <div className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg text-sm flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          Aujourd'hui : {moment().format('DD MMMM YYYY')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-none shadow-sm hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-semibold text-muted-foreground">Séances d'aujourd'hui</p>
              <div className="p-2 bg-primary/10 rounded-full">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline space-x-3 mt-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">{data.seancesAujourdhui}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Planifiées pour ce jour</p>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-sm hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-semibold text-muted-foreground">Total Groupes</p>
              <div className="p-2 bg-accent/10 rounded-full">
                <Users className="w-5 h-5 text-accent" />
              </div>
            </div>
            <div className="flex items-baseline space-x-3 mt-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">{data.totalGroupes}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Classes sous votre responsabilité</p>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-sm hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-semibold text-muted-foreground">Taux de Présence</p>
              <div className="p-2 bg-emerald-500/10 rounded-full">
                <Award className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="flex items-baseline space-x-3 mt-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-emerald-600">{data.tauxPresence}%</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Assiduité générale des élèves</p>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-sm hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-semibold text-muted-foreground">Total Absences Marquées</p>
              <div className="p-2 bg-destructive/10 rounded-full">
                <ShieldAlert className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <div className="flex items-baseline space-x-3 mt-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-destructive">{data.totalAbsences}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Absences à justifier en cours</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Chart & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart card */}
        <Card className="glass border-none shadow-sm lg:col-span-2 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-foreground">Évolution des Absences par Mois</CardTitle>
            <CardDescription>Visualisation de l'absentéisme sur vos groupes ce semestre.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex justify-center">
            {chartData.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground italic">Aucune donnée disponible pour le graphique.</div>
            ) : (
              <div className="w-full relative bg-card/25 border border-border/20 rounded-xl p-4">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                  <defs>
                    <linearGradient id="svgAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="20" y1="20" x2={chartWidth - 20} y2="20" stroke="#E5E7EB" strokeDasharray="3 3" />
                  <line x1="20" y1={(chartHeight - 40) / 2 + 20} x2={chartWidth - 20} y2={(chartHeight - 40) / 2 + 20} stroke="#E5E7EB" strokeDasharray="3 3" />
                  <line x1="20" y1={chartHeight - 20} x2={chartWidth - 20} y2={chartHeight - 20} stroke="#E5E7EB" strokeWidth="1.5" />

                  {/* Filled Area */}
                  {areaPath && <path d={areaPath} fill="url(#svgAreaGrad)" />}
                  
                  {/* Line */}
                  {linePath && <path d={linePath} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

                  {/* Intersecting Points */}
                  {points.map((p: any, i: number) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#ef4444" strokeWidth="2.5" className="cursor-pointer hover:r-7 transition-all" />
                      <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ef4444">
                        {p.val}
                      </text>
                      <text x={p.x} y={chartHeight - 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#9CA3AF">
                        {p.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sessions Card */}
        <Card className="glass border-none shadow-sm flex flex-col h-full">
          <CardHeader className="pb-3 border-b bg-card/50">
            <CardTitle className="text-lg font-bold text-foreground">Vos prochaines séances</CardTitle>
            <CardDescription>Cliquez pour faire l'appel et marquer les présences.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto max-h-[310px]">
            {data.prochainesSeances.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground italic text-sm">Aucune séance prévue dans votre agenda.</div>
            ) : (
              data.prochainesSeances.map((seance: any) => (
                <div key={seance.id} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-secondary/40 transition-colors">
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      {seance.module?.name}
                    </h4>
                    <div className="flex flex-col text-xs text-muted-foreground gap-0.5">
                      <span className="font-semibold text-accent">{seance.groupe?.name}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {moment(seance.date).format('DD/MM/YYYY')} • {seance.heure_debut} - {seance.heure_fin}
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate(`/formateur/faire-appel/${seance.id}`)}
                    className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-3 shadow"
                  >
                    Faire l'appel <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
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
