import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Trophy } from "lucide-react";
import Layout from "@/components/Layout";
import CompetitionCard from "@/components/CompetitionCard";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeToCompetitions, getUserRegistrations, registerForCompetition,
  addActivity, Competition
} from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  { value: "all", label: "Бүгд" },
  { value: "coding", label: "Програмчлал" },
  { value: "sports", label: "Спорт" },
  { value: "art", label: "Урлаг" },
  { value: "science", label: "Шинжлэх ухаан" },
  { value: "music", label: "Хөгжим" },
  { value: "debate", label: "Хэлэлцүүлэг" },
];

const STATUSES = [
  { value: "all", label: "Бүгд" },
  { value: "active", label: "Идэвхтэй" },
  { value: "upcoming", label: "Удахгүй" },
  { value: "ended", label: "Дууссан" },
];

export default function CompetitionsPage() {
  const { user, profile } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    if (!user) { setLocation("/login"); return; }
    loadRegistrations();
    const unsub = subscribeToCompetitions((comps) => {
      setCompetitions(comps);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const loadRegistrations = async () => {
    if (!user) return;
    const regs = await getUserRegistrations(user.uid);
    setRegisteredIds(new Set(regs.map((r) => r.competitionId)));
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

  const filtered = competitions.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || c.category === category;
    const matchStatus = status === "all" || c.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">Тэмцээнүүд</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {competitions.length} тэмцээнээс {filtered.length} харагдаж байна
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-card-border rounded-2xl p-4 space-y-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Тэмцээн хайх..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-muted/50 border-border"
              data-testid="input-search"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
            {CATEGORIES.map((c) => (
              <Button
                key={c.value}
                variant={category === c.value ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c.value)}
                className={`text-xs h-8 ${category === c.value ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}
                data-testid={`filter-category-${c.value}`}
              >
                {c.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground shrink-0 w-4" />
            {STATUSES.map((s) => (
              <Button
                key={s.value}
                variant={status === s.value ? "secondary" : "outline"}
                size="sm"
                onClick={() => setStatus(s.value)}
                className={`text-xs h-8 ${status === s.value ? "bg-secondary/20 text-secondary border-secondary/30" : "bg-muted/50"}`}
                data-testid={`filter-status-${s.value}`}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-card border border-card-border rounded-2xl"
          >
            <Trophy className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-bold text-foreground mb-2">Тэмцээн олдсонгүй</h3>
            <p className="text-sm text-muted-foreground">Шүүлтүүрийг өөрчилж үзнэ үү</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c, i) => (
              <CompetitionCard
                key={c.id}
                competition={c}
                onRegister={handleRegister}
                isRegistered={registeredIds.has(c.id!)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
