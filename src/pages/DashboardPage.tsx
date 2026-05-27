import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Trophy, Users, Zap, TrendingUp, Calendar, Star,
  ArrowUpRight, Clock, Activity
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import Layout from "@/components/Layout";
import CompetitionCard from "@/components/CompetitionCard";
import { useAuth } from "@/contexts/AuthContext";
import {
  getActiveCompetitions, getRecentActivity, getUserRegistrations,
  registerForCompetition, addActivity, Competition, ActivityItem
} from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Timestamp } from "firebase/firestore";

const chartData = [
  { name: "Даваа", оноо: 40 },
  { name: "Мягмар", оноо: 80 },
  { name: "Лхагва", оноо: 60 },
  { name: "Пүрэв", оноо: 120 },
  { name: "Баасан", оноо: 90 },
  { name: "Бямба", оноо: 150 },
  { name: "Ням", оноо: 130 },
];

const barData = [
  { name: "Програм", тоо: 3 },
  { name: "Шинжлэх", тоо: 2 },
  { name: "Урлаг", тоо: 1 },
  { name: "Хөгжим", тоо: 2 },
  { name: "Спорт", тоо: 0 },
  { name: "Хэлэлц", тоо: 1 },
];

function timeAgo(ts?: Timestamp): string {
  if (!ts) return "";
  const diff = Date.now() - ts.toDate().getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} минутын өмнө`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} цагийн өмнө`;
  return `${Math.floor(h / 24)} өдрийн өмнө`;
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLocation("/login"); return; }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const [comps, acts, regs] = await Promise.all([
        getActiveCompetitions(),
        getRecentActivity(),
        user ? getUserRegistrations(user.uid) : Promise.resolve([]),
      ]);
      setCompetitions(comps);
      setActivity(acts);
      setRegisteredIds(new Set(regs.map((r) => r.competitionId)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (comp: Competition) => {
    if (!user || !profile || !comp.id) return;
    if (registeredIds.has(comp.id)) return;
    try {
      await registerForCompetition(user.uid, comp.id);
      await addActivity({
        userId: user.uid,
        userName: profile.displayName,
        userPhoto: profile.photoURL,
        type: "registration",
        description: `"${comp.title}" тэмцээнд бүртгүүллээ`,
        competitionId: comp.id,
        competitionTitle: comp.title,
      });
      setRegisteredIds((prev) => new Set([...prev, comp.id!]));
      toast({ title: "Амжилттай бүртгэгдлээ!", description: comp.title });
    } catch (e: any) {
      toast({ title: "Алдаа гарлаа", description: e.message, variant: "destructive" });
    }
  };

  const statCards = [
    {
      label: "Нийт оноо", value: profile?.points || 0, icon: Zap,
      color: "from-purple-500 to-blue-500", bg: "bg-purple-500/10", textColor: "text-purple-400",
    },
    {
      label: "Оролцолт", value: profile?.participations || 0, icon: Trophy,
      color: "from-amber-500 to-orange-500", bg: "bg-amber-500/10", textColor: "text-amber-400",
    },
    {
      label: "Ялалт", value: profile?.wins || 0, icon: Star,
      color: "from-green-500 to-emerald-500", bg: "bg-green-500/10", textColor: "text-green-400",
    },
    {
      label: "Бүртгэлтэй", value: registeredIds.size, icon: Calendar,
      color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10", textColor: "text-blue-400",
    },
  ];

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground">
                Сайн байна уу, {profile?.displayName?.split(" ")[0] || "Суралцагч"} 👋
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Өнөөдөр ямар тэмцээнд оролцох вэ?
              </p>
            </div>
            <Badge className="hidden md:flex gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border-primary/20">
              <TrendingUp className="w-3.5 h-3.5" />
              {profile?.role === "admin" ? "Админ" : "Суралцагч"}
            </Badge>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-card-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                data-testid={`stat-${s.label}`}
              >
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${s.textColor}`} />
                </div>
                <div className={`text-2xl font-black ${s.textColor}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-card-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-foreground">Онооны өсөлт</h3>
                <p className="text-xs text-muted-foreground mt-0.5">7 хоногийн дүн</p>
              </div>
              <div className="flex items-center gap-1.5 text-green-500 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                +24%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262 83% 65%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(262 83% 65%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="оноо" stroke="hsl(262 83% 65%)" strokeWidth={2.5} fill="url(#scoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card border border-card-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-foreground">Ангиллаар оролцолт</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Нийт тэмцээн</p>
              </div>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="тоо" fill="hsl(217 91% 65%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Competitions + Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active competitions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground text-lg">Идэвхтэй тэмцээнүүд</h2>
              <button onClick={() => setLocation("/competitions")} className="text-sm text-primary hover:underline flex items-center gap-1">
                Бүгдийг үзэх <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {loading ? (
              [...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-2xl" />
              ))
            ) : competitions.length === 0 ? (
              <div className="bg-card border border-card-border rounded-2xl p-12 text-center text-muted-foreground">
                <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Одоогоор идэвхтэй тэмцээн байхгүй</p>
              </div>
            ) : (
              competitions.slice(0, 2).map((c, i) => (
                <CompetitionCard
                  key={c.id}
                  competition={c}
                  onRegister={handleRegister}
                  isRegistered={registeredIds.has(c.id!)}
                  index={i}
                />
              ))
            )}
          </div>

          {/* Activity feed */}
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Сүүлийн үйл явдал
            </h3>
            {loading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl mb-3" />)
            ) : activity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Үйл явдал байхгүй</p>
            ) : (
              <div className="space-y-3">
                {activity.slice(0, 6).map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    data-testid={`activity-item-${i}`}
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={a.userPhoto} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {a.userName?.[0] || "У"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground leading-tight">{a.userName}</p>
                      <p className="text-xs text-muted-foreground leading-tight mt-0.5 line-clamp-2">{a.description}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(a.createdAt)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
