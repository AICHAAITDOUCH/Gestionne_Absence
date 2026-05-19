import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Calendar as CalendarIcon, CheckCircle2, Clock, Users, ShieldAlert, Award, ChevronRight, BookOpen, Bell, Trash2, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import moment from 'moment';
import { Button } from '@/components/ui/button';

const fetchStagiaireStats = async () => {
  const { data } = await api.get('/dashboard/stagiaire');
  return data;
};

const fetchNotifications = async () => {
  const { data } = await api.get('/stagiaire/notifications');
  return data;
};

const StagiaireDashboard = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['stagiaireStats'],
    queryFn: fetchStagiaireStats,
  });

  const { data: notifications, isLoading: loadingNotifs } = useQuery({
    queryKey: ['stagiaireNotifications'],
    queryFn: fetchNotifications,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post('/stagiaire/notifications/read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stagiaireNotifications'] });
    }
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.post(`/stagiaire/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stagiaireNotifications'] });
    }
  });

  const deleteNotifMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/stagiaire/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stagiaireNotifications'] });
    }
  });

  if (isLoading || loadingNotifs) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Chargement de votre tableau de bord...</div>;
  }

  if (error || !data) {
    return <div className="text-destructive p-8 text-center font-bold">Erreur lors du chargement de votre tableau de bord.</div>;
  }

  // Pre-calculate SVG Chart dimensions safely
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

  const unreadCount = notifications?.filter((n: any) => !n.read_at).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mon Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Consultez vos statistiques, absences signalées et gérez vos justifications.</p>
        </div>
        <div className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg text-sm flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          Aujourd'hui : {moment().format('DD MMMM YYYY')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
            <p className="text-xs text-muted-foreground mt-1 font-medium">Assiduité globale aux cours</p>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-sm hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-semibold text-muted-foreground">Absences Non Justifiées</p>
              <div className="p-2 bg-destructive/10 rounded-full">
                <ShieldAlert className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <div className="flex items-baseline space-x-3 mt-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-destructive">{data.totalAbsences}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Séances à justifier rapidement</p>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-sm hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-semibold text-muted-foreground">Retards Enregistrés</p>
              <div className="p-2 bg-amber-500/10 rounded-full">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div className="flex items-baseline space-x-3 mt-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-amber-500">{data.totalRetards}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Arrivées tardives aux séances</p>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-sm hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-semibold text-muted-foreground">Séances Présentes</p>
              <div className="p-2 bg-primary/10 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline space-x-3 mt-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">{data.totalPresences}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Présences validées ce semestre</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Chart, Recent Sessions & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: SVG Chart and Recent Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Card */}
          <Card className="glass border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-foreground">Évolution Mensuelle de Vos Absences</CardTitle>
              <CardDescription>Visualisation de vos absences par mois cette année.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex justify-center">
              {chartData.length === 0 ? (
                <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground italic">Aucune donnée disponible pour le graphique.</div>
              ) : (
                <div className="w-full relative bg-card/25 border border-border/20 rounded-xl p-4">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                    <defs>
                      <linearGradient id="svgStagGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0066A6" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#0066A6" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Grid Lines */}
                    <line x1="20" y1="20" x2={chartWidth - 20} y2="20" stroke="#E5E7EB" strokeDasharray="3 3" />
                    <line x1="20" y1={(chartHeight - 40) / 2 + 20} x2={chartWidth - 20} y2={(chartHeight - 40) / 2 + 20} stroke="#E5E7EB" strokeDasharray="3 3" />
                    <line x1="20" y1={chartHeight - 20} x2={chartWidth - 20} y2={chartHeight - 20} stroke="#E5E7EB" strokeWidth="1.5" />

                    {/* Filled Area */}
                    {areaPath && <path d={areaPath} fill="url(#svgStagGrad)" />}
                    
                    {/* Line */}
                    {linePath && <path d={linePath} fill="none" stroke="#0066A6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

                    {/* Points */}
                    {points.map((p: any, i: number) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#0066A6" strokeWidth="2.5" />
                        <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0066A6">
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

          {/* Recent Sessions */}
          <Card className="glass border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground">Vos séances de cours récentes</CardTitle>
              <CardDescription>Liste des derniers cours planifiés ou dispensés pour votre classe.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {data.recentSeances.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground italic text-sm">Aucune séance dans votre agenda.</div>
              ) : (
                <div className="divide-y divide-border/60">
                  {data.recentSeances.map((seance: any) => (
                    <div key={seance.id} className="p-4 flex justify-between items-center hover:bg-secondary/20 transition-colors">
                      <div className="space-y-1">
                        <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                          {seance.module?.name}
                        </h4>
                        <div className="flex text-xs text-muted-foreground gap-3">
                          <span className="font-medium text-accent">Formateur: {seance.formateur?.name}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {moment(seance.date).format('DD/MM/YYYY')} • {seance.heure_debut} - {seance.heure_fin}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        seance.is_validated 
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {seance.is_validated ? 'Validée' : 'En attente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Notifications Feed */}
        <div className="space-y-6">
          <Card className="glass border-none shadow-sm flex flex-col h-full min-h-[460px]">
            <CardHeader className="pb-3 border-b bg-card/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary animate-swing" />
                  Notifications
                </CardTitle>
                <CardDescription>Restez informé de votre assiduité.</CardDescription>
              </div>
              {unreadCount > 0 && (
                <Button 
                  onClick={() => markAllReadMutation.mutate()} 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-[10px] font-bold text-primary hover:bg-primary/10"
                >
                  <Check className="w-3 h-3 mr-1" /> Tout lire
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px]">
              {(!notifications || notifications.length === 0) ? (
                <div className="p-8 text-center text-muted-foreground italic text-sm">Aucune notification pour le moment.</div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notif: any) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 flex gap-3 transition-colors ${
                        notif.read_at ? 'bg-card/30 opacity-75' : 'bg-primary/5 hover:bg-primary/10'
                      }`}
                    >
                      <div className={`p-2 rounded-full h-fit mt-0.5 ${
                        notif.data?.type === 'absence' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {notif.data?.type === 'absence' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className={`text-xs font-bold ${notif.read_at ? 'text-foreground/80' : 'text-foreground'}`}>
                            {notif.data?.title}
                          </h4>
                          <span className="text-[9px] text-muted-foreground font-semibold whitespace-nowrap">
                            {moment(notif.created_at).fromNow()}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {notif.data?.message}
                        </p>
                        
                        <div className="flex items-center justify-end gap-2 pt-2">
                          {!notif.read_at && (
                            <Button 
                              onClick={() => markReadMutation.mutate(notif.id)}
                              variant="ghost" 
                              size="icon" 
                              className="w-6 h-6 rounded-full hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700"
                              title="Marquer comme lu"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button 
                            onClick={() => deleteNotifMutation.mutate(notif.id)}
                            variant="ghost" 
                            size="icon" 
                            className="w-6 h-6 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StagiaireDashboard;
