import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Zap, Users, Star } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToLeaderboard, UserProfile } from "@/lib/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const badgeIcons = ["🏆", "🥇", "🥈", "🥉", "⭐", "🎯", "🔥", "💎"];

const rankStyles: Record<number, { icon: any; color: string; bg: string; border: string }> = {
  1: { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  2: { icon: Medal, color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/30" },
  3: { icon: Medal, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/30" },
};

function RankBadge({ rank }: { rank: number }) {
  const style = rankStyles[rank];
  if (!style) return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
      <span className="text-xs font-bold text-muted-foreground">{rank}</span>
    </div>
  );
  const Icon = style.icon;
  return (
    <div className={`w-8 h-8 rounded-full ${style.bg} border ${style.border} flex items-center justify-center`}>
      <Icon className={`w-4 h-4 ${style.color}`} />
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLocation("/login"); return; }
    const unsub = subscribeToLeaderboard((data) => {
      setUsers(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            Рейтингийн самбар
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Бодит хугацааны шинэчлэлт · {users.length} суралцагч
          </p>
        </motion.div>

        {/* Top 3 podium */}
        {!loading && topThree.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-4 items-end"
          >
            {/* 2nd place */}
            <PodiumCard user={topThree[1]} rank={2} height="h-36" delay={0.2} />
            {/* 1st place */}
            <PodiumCard user={topThree[0]} rank={1} height="h-48" delay={0.1} highlight />
            {/* 3rd place */}
            <PodiumCard user={topThree[2]} rank={3} height="h-28" delay={0.3} />
          </motion.div>
        )}

        {/* Leaderboard table */}
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-foreground">Дэлгэрэнгүй рейтинг</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Бодит хугацаа
            </div>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Одоогоор мэдээлэл байхгүй</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u, i) => (
                <LeaderboardRow key={u.id} user={u} index={i} isCurrentUser={u.uid === user?.uid} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function PodiumCard({
  user, rank, height, delay, highlight
}: {
  user: UserProfile; rank: number; height: string; delay: number; highlight?: boolean;
}) {
  const colors: Record<number, string> = {
    1: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
    2: "from-gray-400/20 to-slate-400/20 border-gray-400/30",
    3: "from-amber-700/20 to-orange-700/20 border-amber-700/30",
  };
  const textColors: Record<number, string> = {
    1: "text-yellow-500",
    2: "text-gray-400",
    3: "text-amber-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-gradient-to-br ${colors[rank]} border rounded-2xl p-4 flex flex-col items-center justify-end ${height} relative overflow-hidden`}
    >
      {highlight && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-t-2xl" />
      )}
      <Avatar className={`mb-2 ring-2 ${rank === 1 ? "ring-yellow-400 w-14 h-14" : "ring-border w-12 h-12"}`}>
        <AvatarImage src={user.photoURL} />
        <AvatarFallback className="bg-primary/20 text-primary font-bold">
          {user.displayName?.[0] || "?"}
        </AvatarFallback>
      </Avatar>
      <p className="text-xs font-semibold text-foreground text-center truncate w-full px-1">
        {user.displayName}
      </p>
      <div className={`text-sm font-black ${textColors[rank]} mt-1`}>
        {user.points} оноо
      </div>
      <div className={`text-xs font-bold mt-1 ${textColors[rank]}`}>
        #{rank}
      </div>
    </motion.div>
  );
}

function LeaderboardRow({ user, index, isCurrentUser }: { user: UserProfile; index: number; isCurrentUser: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors ${
        isCurrentUser ? "bg-primary/5 border-l-2 border-primary" : ""
      }`}
      data-testid={`leaderboard-row-${user.id}`}
    >
      <RankBadge rank={user.rank || index + 1} />
      <Avatar className="w-10 h-10">
        <AvatarImage src={user.photoURL} />
        <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
          {user.displayName?.[0] || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground text-sm truncate">{user.displayName}</p>
          {isCurrentUser && (
            <Badge className="text-xs bg-primary/15 text-primary border-primary/30 h-5">Та</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Trophy className="w-3 h-3" />{user.participations || 0} тэмцээн
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Star className="w-3 h-3" />{user.wins || 0} ялалт
          </span>
        </div>
      </div>
      {/* Badges */}
      <div className="hidden sm:flex gap-1">
        {(user.badges || []).slice(0, 3).map((b, i) => (
          <span key={i} className="text-base">{badgeIcons[i % badgeIcons.length]}</span>
        ))}
      </div>
      <div className="text-right">
        <div className="font-black gradient-text text-lg">{user.points}</div>
        <div className="text-xs text-muted-foreground">оноо</div>
      </div>
    </motion.div>
  );
}
