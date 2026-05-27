import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  User,
  Trophy,
  Star,
  Target,
  Edit3,
  Check,
  X,
  Award,
  Calendar,
  TrendingUp,
  Zap,
  Medal,
  Activity,
} from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  getUserRegistrations,
  getCompetitions,
  updateUserProfile,
  getRecentActivity,
  type Competition,
  type ActivityItem,
} from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";

function fmt(ts: Timestamp | Date | undefined): string {
  if (!ts) return "";
  const d = ts instanceof Timestamp ? ts.toDate() : ts;
  return d.toLocaleDateString("mn-MN", { year: "numeric", month: "short", day: "numeric" });
}

const categoryColors: Record<string, string> = {
  coding: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  sports: "bg-green-500/20 text-green-400 border-green-500/30",
  art: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  science: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  music: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  debate: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const categoryLabels: Record<string, string> = {
  coding: "Програмчлал",
  sports: "Спорт",
  art: "Урлаг",
  science: "Шинжлэх ухаан",
  music: "Хөгжим",
  debate: "Хэлэлцүүлэг",
};

const statusLabels: Record<string, string> = {
  upcoming: "Удахгүй",
  active: "Идэвхтэй",
  ended: "Дууссан",
};

const statusColors: Record<string, string> = {
  upcoming: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  ended: "bg-muted text-muted-foreground border-border",
};

const activityIcons: Record<string, string> = {
  registration: "📝",
  win: "🏆",
  achievement: "⭐",
  competition_created: "🎯",
};

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [myComps, setMyComps] = useState<Competition[]>([]);
  const [myActivity, setMyActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLocation("/login"); return; }
    load();
  }, [user]);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const [regs, allComps, allActivity] = await Promise.all([
        getUserRegistrations(user.uid),
        getCompetitions(),
        getRecentActivity(50),
      ]);
      const compMap = new Map(allComps.map((c) => [c.id!, c]));
      const joined = regs
        .map((r) => compMap.get(r.competitionId))
        .filter(Boolean) as Competition[];
      setMyComps(joined);
      const mine = allActivity.filter((a) => a.userId === user.uid).slice(0, 10);
      setMyActivity(mine);
    } finally {
      setLoading(false);
    }
  }

  const startEditName = () => {
    setNameInput(profile?.displayName || "");
    setEditingName(true);
  };

  const saveName = async () => {
    if (!user || !nameInput.trim()) return;
    setSavingName(true);
    try {
      await updateUserProfile(user.uid, { displayName: nameInput.trim() });
      await refreshProfile();
      toast({ title: "Нэр шинэчлэгдлээ", description: "Таны дэлгэцийн нэр амжилттай өөрчлөгдлөө." });
      setEditingName(false);
    } catch (e: any) {
      toast({ title: "Алдаа гарлаа", description: e.message, variant: "destructive" });
    } finally {
      setSavingName(false);
    }
  };

  const stats = [
    { label: "Нийт оноо", value: profile?.points ?? 0, icon: Zap, color: "text-purple-400" },
    { label: "Ялалт", value: profile?.wins ?? 0, icon: Trophy, color: "text-yellow-400" },
    { label: "Оролцсон", value: profile?.participations ?? myComps.length, icon: Target, color: "text-blue-400" },
    { label: "Badge", value: (profile?.badges ?? []).length, icon: Award, color: "text-pink-400" },
  ];

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar className="w-20 h-20 ring-4 ring-primary/30 shrink-0">
              <AvatarImage src={profile?.photoURL} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-bold">
                {profile?.displayName?.[0] || "У"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2 mb-1">
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="h-9 text-lg font-bold bg-muted/50 max-w-xs"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                  />
                  <Button size="icon" variant="ghost" className="w-8 h-8 text-green-500" onClick={saveName} disabled={savingName}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground" onClick={() => setEditingName(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-foreground">{profile?.displayName || "Хэрэглэгч"}</h2>
                  <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-foreground" onClick={startEditName}>
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-2">{profile?.email}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={profile?.role === "admin" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}>
                  <User className="w-3 h-3 mr-1" />
                  {profile?.role === "admin" ? "Админ" : "Суралцагч"}
                </Badge>
                {profile?.rank && (
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="w-3 h-3" />
                    #{profile.rank} байр
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-4 text-center"
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-yellow-400" />
              Миний Badge-үүд
            </h3>
            {(profile?.badges ?? []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Одоогоор badge байхгүй байна</p>
                <p className="text-xs mt-1">Тэмцээнд оролцоод ялалт байгуулаарай!</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(profile?.badges ?? []).map((badge, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-3 py-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-sm font-medium text-yellow-400"
                  >
                    {badge}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-blue-400" />
              Сүүлийн үйл ажиллагаа
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-lg bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : myActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Үйл ажиллагаа байхгүй байна</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {myActivity.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-lg shrink-0 mt-0.5">{activityIcons[a.type] || "📌"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{a.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{fmt(a.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Competition history */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-5"
        >
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
            <Medal className="w-4 h-4 text-purple-400" />
            Тэмцээний түүх
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : myComps.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Одоогоор тэмцээнд оролцоогүй байна</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setLocation("/competitions")}
              >
                Тэмцээн харах
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {myComps.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{c.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{fmt(c.startDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${categoryColors[c.category] || ""}`}>
                      {categoryLabels[c.category] || c.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[c.status] || ""}`}>
                      {statusLabels[c.status] || c.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
