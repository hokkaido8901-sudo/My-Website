import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Shield, Users, Trophy, Plus, Pencil, Trash2, Download,
  Search, BarChart3, TrendingUp, Activity, X, Check, StopCircle, Medal
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAllUsers, getCompetitions, createCompetition, updateCompetition,
  deleteCompetition, seedDemoData, setCompetitionWinners,
  Competition, UserProfile, CompetitionCategory, CompetitionStatus, CompetitionWinners
} from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const analyticsData = [
  { name: "1-р сар", оролцогч: 80 },
  { name: "2-р сар", оролцогч: 120 },
  { name: "3-р сар", оролцогч: 95 },
  { name: "4-р сар", оролцогч: 160 },
  { name: "5-р сар", оролцогч: 210 },
  { name: "6-р сар", оролцогч: 180 },
];

const categoryLabels: Record<string, string> = {
  coding: "Програмчлал",
  sports: "Спорт",
  art: "Урлаг",
  science: "Шинжлэх ухаан",
  music: "Хөгжим",
  debate: "Хэлэлцүүлэг",
};

const statusLabels: Record<string, string> = {
  active: "Идэвхтэй",
  upcoming: "Удахгүй",
  ended: "Дууссан",
};

interface CompForm {
  title: string;
  description: string;
  category: CompetitionCategory;
  status: CompetitionStatus;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  prize: string;
  rules: string;
}

const emptyForm: CompForm = {
  title: "",
  description: "",
  category: "coding",
  status: "upcoming",
  startDate: "",
  endDate: "",
  maxParticipants: 100,
  prize: "",
  rules: "",
};

export default function AdminPage() {
  const { user, profile } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editComp, setEditComp] = useState<Competition | null>(null);
  const [form, setForm] = useState<CompForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [winnerDialogOpen, setWinnerDialogOpen] = useState(false);
  const [winnerComp, setWinnerComp] = useState<Competition | null>(null);
  const [winnerForm, setWinnerForm] = useState<CompetitionWinners>({});
  const [savingWinners, setSavingWinners] = useState(false);

  useEffect(() => {
    if (!user) { setLocation("/login"); return; }
    if (profile && profile.role !== "admin") { setLocation("/dashboard"); return; }
    load();
  }, [user, profile]);

  const load = async () => {
    setLoading(true);
    try {
      const [u, c] = await Promise.all([getAllUsers(), getCompetitions()]);
      setUsers(u);
      setCompetitions(c);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditComp(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (comp: Competition) => {
    setEditComp(comp);
    const toInput = (d: Timestamp | Date) => {
      const date = d instanceof Timestamp ? d.toDate() : d;
      return date.toISOString().slice(0, 10);
    };
    setForm({
      title: comp.title,
      description: comp.description,
      category: comp.category,
      status: comp.status,
      startDate: toInput(comp.startDate),
      endDate: toInput(comp.endDate),
      maxParticipants: comp.maxParticipants,
      prize: comp.prize || "",
      rules: comp.rules || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.startDate || !form.endDate) {
      toast({ title: "Шаардлагатай талбарыг бөглөнө үү", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const data = {
        title: form.title,
        description: form.description,
        category: form.category,
        status: form.status,
        startDate: Timestamp.fromDate(new Date(form.startDate)),
        endDate: Timestamp.fromDate(new Date(form.endDate)),
        maxParticipants: Number(form.maxParticipants),
        currentParticipants: editComp?.currentParticipants || 0,
        createdBy: user!.uid,
        prize: form.prize,
        rules: form.rules,
      };
      if (editComp?.id) {
        await updateCompetition(editComp.id, data);
        toast({ title: "Тэмцээн шинэчлэгдлээ" });
      } else {
        await createCompetition(data);
        toast({ title: "Тэмцээн үүслээ" });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast({ title: "Алдаа гарлаа", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openWinners = (comp: Competition) => {
    setWinnerComp(comp);
    setWinnerForm(comp.winners || {});
    setWinnerDialogOpen(true);
  };

  const handleSaveWinners = async () => {
    if (!winnerComp?.id) return;
    setSavingWinners(true);
    try {
      await setCompetitionWinners(winnerComp.id, winnerComp.title, winnerForm, winnerComp.winners);
      toast({ title: "Ялагчид тохируулагдлаа", description: "Оноо, badge автоматаар нэмэгдлээ." });
      setWinnerDialogOpen(false);
      load();
    } catch (e: any) {
      toast({ title: "Алдаа гарлаа", description: e.message, variant: "destructive" });
    } finally {
      setSavingWinners(false);
    }
  };

  const handleEnd = async (id: string, title: string) => {
    if (!confirm(`"${title}" тэмцээнийг дуусгах уу?`)) return;
    try {
      await updateCompetition(id, { status: "ended" });
      toast({ title: "Тэмцээн дууслаа", description: `"${title}" амжилттай дуусгагдлаа.` });
      load();
    } catch (e: any) {
      toast({ title: "Алдаа гарлаа", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" тэмцээнийг устгах уу?`)) return;
    try {
      await deleteCompetition(id);
      toast({ title: "Тэмцээн устгагдлаа" });
      load();
    } catch (e: any) {
      toast({ title: "Алдаа", description: e.message, variant: "destructive" });
    }
  };

  const handleSeed = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      await seedDemoData(user.uid);
      toast({ title: "Жишээ өгөгдөл нэмэгдлээ" });
      load();
    } catch (e: any) {
      toast({ title: "Алдаа", description: e.message, variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Нэр", "И-мэйл", "Оноо", "Оролцолт", "Ялалт", "Үүрэг"].join(","),
      ...users.map((u) =>
        [u.displayName, u.email, u.points, u.participations, u.wins, u.role].join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eduquest_users.csv";
    a.click();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: "Нийт хэрэглэгч", value: users.length, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Нийт тэмцээн", value: competitions.length, icon: Trophy, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Идэвхтэй", value: competitions.filter((c) => c.status === "active").length, icon: Activity, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Нийт оролцолт", value: competitions.reduce((s, c) => s + c.currentParticipants, 0), icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3">
                <Shield className="w-7 h-7 text-primary" />
                Админ панел
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">Системийн удирдлага</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeed}
              disabled={seeding}
              className="gap-2 text-muted-foreground"
              data-testid="button-seed"
            >
              <Plus className="w-4 h-4" />
              {seeding ? "Нэмж байна..." : "Жишээ өгөгдөл"}
            </Button>
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
                className="bg-card border border-card-border rounded-2xl p-5"
              >
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Analytics chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-card-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Оролцогчдын динамик
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">2025 оны өгөгдөл</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={analyticsData}>
              <defs>
                <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(262 83% 65%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(262 83% 65%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="оролцогч" stroke="hsl(262 83% 65%)" strokeWidth={2.5} fill="url(#adminGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="competitions">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="competitions" className="gap-2">
              <Trophy className="w-4 h-4" />
              Тэмцээнүүд
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Хэрэглэгчид
            </TabsTrigger>
          </TabsList>

          {/* Competitions Tab */}
          <TabsContent value="competitions" className="mt-4">
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-3">
                <h3 className="font-bold text-foreground">Тэмцээн удирдах</h3>
                <Button size="sm" onClick={openCreate} className="gap-2 bg-primary" data-testid="button-create-competition">
                  <Plus className="w-4 h-4" />
                  Шинэ тэмцээн
                </Button>
              </div>
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {competitions.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                      data-testid={`admin-comp-row-${c.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{c.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full badge-${c.category}`}>
                            {categoryLabels[c.category]}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            c.status === "active" ? "bg-green-500/15 text-green-500 border-green-500/30" :
                            c.status === "upcoming" ? "bg-blue-500/15 text-blue-500 border-blue-500/30" :
                            "bg-muted text-muted-foreground border-border"
                          }`}>
                            {statusLabels[c.status]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {c.currentParticipants}/{c.maxParticipants} оролцогч
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {c.status === "ended" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`w-8 h-8 ${c.winners?.first ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`}
                            title="Ялагч сонгох"
                            onClick={() => openWinners(c)}
                            data-testid={`button-winners-${c.id}`}
                          >
                            <Medal className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {c.status !== "ended" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-orange-500"
                            title="Тэмцээн дуусгах"
                            onClick={() => handleEnd(c.id!, c.title)}
                            data-testid={`button-end-${c.id}`}
                          >
                            <StopCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(c)}
                          data-testid={`button-edit-${c.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(c.id!, c.title)}
                          data-testid={`button-delete-${c.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-4">
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Хэрэглэгч хайх..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-muted/50 border-border h-9"
                    data-testid="input-user-search"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2" data-testid="button-export">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">CSV татах</span>
                </Button>
              </div>
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredUsers.map((u, i) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                      data-testid={`admin-user-row-${u.id}`}
                    >
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={u.photoURL} />
                        <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                          {u.displayName?.[0] || "У"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{u.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{u.points} оноо</span>
                        <span>{u.participations} оролцолт</span>
                        <span>{u.wins} ялалт</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-xs ${
                          u.role === "admin"
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {u.role === "admin" ? "Админ" : "Суралцагч"}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Competition Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-card-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editComp ? "Тэмцээн засварлах" : "Шинэ тэмцээн үүсгэх"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 block">Тэмцээний нэр *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Тэмцээний нэр"
                className="bg-muted/50"
                data-testid="input-comp-title"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 block">Тайлбар</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Тэмцээний дэлгэрэнгүй тайлбар"
                className="bg-muted/50 resize-none"
                rows={3}
                data-testid="input-comp-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">Ангилал</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as CompetitionCategory })}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">Статус</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as CompetitionStatus })}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">Эхлэх огноо *</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="bg-muted/50"
                  data-testid="input-comp-start"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">Дуусах огноо *</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="bg-muted/50"
                  data-testid="input-comp-end"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">Хамгийн их оролцогч</Label>
                <Input
                  type="number"
                  value={form.maxParticipants}
                  onChange={(e) => setForm({ ...form, maxParticipants: Number(e.target.value) })}
                  className="bg-muted/50"
                  min={1}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">Шагнал</Label>
                <Input
                  value={form.prize}
                  onChange={(e) => setForm({ ...form, prize: e.target.value })}
                  placeholder="500,000₮"
                  className="bg-muted/50"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 block">Дүрэм журам</Label>
              <Textarea
                value={form.rules}
                onChange={(e) => setForm({ ...form, rules: e.target.value })}
                placeholder="Тэмцээний дүрэм журам..."
                className="bg-muted/50 resize-none"
                rows={2}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
                <X className="w-4 h-4 mr-2" />
                Цуцлах
              </Button>
              <Button
                className="flex-1 bg-primary"
                onClick={handleSave}
                disabled={saving}
                data-testid="button-save-competition"
              >
                <Check className="w-4 h-4 mr-2" />
                {saving ? "Хадгалж байна..." : editComp ? "Шинэчлэх" : "Үүсгэх"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Winner Selection Dialog */}
      <Dialog open={winnerDialogOpen} onOpenChange={setWinnerDialogOpen}>
        <DialogContent className="bg-card border-card-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Ялагч сонгох
            </DialogTitle>
          </DialogHeader>
          {winnerComp && (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">"{winnerComp.title}"</span> тэмцээний ялагчдыг сонгоно уу.
                Оноо автоматаар нэмэгдэнэ: 🥇 300, 🥈 200, 🥉 100
              </p>

              {(["first", "second", "third"] as const).map((place) => {
                const labels = { first: "🥇 1-р байр", second: "🥈 2-р байр", third: "🥉 3-р байр" };
                return (
                  <div key={place}>
                    <Label className="text-sm font-medium text-foreground mb-1.5 block">
                      {labels[place]}
                    </Label>
                    <Select
                      value={winnerForm[place] || "none"}
                      onValueChange={(v) => setWinnerForm({ ...winnerForm, [place]: v === "none" ? undefined : v })}
                    >
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue placeholder="Хэрэглэгч сонгоно уу..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— Сонгоогүй —</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.uid} value={u.uid}>
                            <div className="flex items-center gap-2">
                              <span>{u.displayName}</span>
                              <span className="text-muted-foreground text-xs">({u.email})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setWinnerDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Цуцлах
                </Button>
                <Button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                  onClick={handleSaveWinners}
                  disabled={savingWinners}
                >
                  <Medal className="w-4 h-4 mr-2" />
                  {savingWinners ? "Хадгалж байна..." : "Ялагч тохируулах"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
