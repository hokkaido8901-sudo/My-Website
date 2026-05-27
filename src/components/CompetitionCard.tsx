import { motion } from "framer-motion";
import { Calendar, Users, Trophy, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Competition } from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";

const categoryLabels: Record<string, string> = {
  coding: "Програмчлал",
  sports: "Спорт",
  art: "Урлаг",
  science: "Шинжлэх ухаан",
  music: "Хөгжим",
  debate: "Хэлэлцүүлэг",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: "Идэвхтэй", color: "bg-green-500/15 text-green-500 border-green-500/30" },
  upcoming: { label: "Удахгүй", color: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
  ended: { label: "Дууссан", color: "bg-muted text-muted-foreground border-border" },
};

function formatDate(d: Timestamp | Date): string {
  const date = d instanceof Timestamp ? d.toDate() : d;
  return date.toLocaleDateString("mn-MN", { month: "short", day: "numeric", year: "numeric" });
}

function getTimeLeft(endDate: Timestamp | Date): string {
  const end = endDate instanceof Timestamp ? endDate.toDate() : endDate;
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return "Дууссан";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days} өдөр үлдсэн`;
  return `${hours} цаг үлдсэн`;
}

interface Props {
  competition: Competition;
  onRegister?: (comp: Competition) => void;
  isRegistered?: boolean;
  index?: number;
}

export default function CompetitionCard({ competition, onRegister, isRegistered, index = 0 }: Props) {
  const status = statusLabels[competition.status];
  const fillPercent = competition.maxParticipants > 0
    ? Math.min(100, (competition.currentParticipants / competition.maxParticipants) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-card border border-card-border rounded-2xl p-5 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300"
      data-testid={`card-competition-${competition.id}`}
    >
      {/* Gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border badge-${competition.category}`}>
                {categoryLabels[competition.category]}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
                {status.label}
              </span>
            </div>
            <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {competition.title}
            </h3>
          </div>
          {competition.prize && (
            <div className="shrink-0 flex items-center gap-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{competition.prize}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {competition.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{formatDate(competition.startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{getTimeLeft(competition.endDate)}</span>
          </div>
        </div>

        {/* Participants progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Оролцогчид
            </span>
            <span className="text-xs font-medium text-foreground">
              {competition.currentParticipants} / {competition.maxParticipants}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPercent}%` }}
              transition={{ delay: index * 0.07 + 0.3, duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            />
          </div>
        </div>

        {/* Action button */}
        {onRegister && competition.status !== "ended" && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRegister(competition);
            }}
            disabled={isRegistered}
            className={`w-full group/btn text-sm font-medium ${
              isRegistered
                ? "bg-green-500/15 text-green-500 border border-green-500/30 hover:bg-green-500/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
            variant={isRegistered ? "outline" : "default"}
            data-testid={`button-register-${competition.id}`}
          >
            {isRegistered ? (
              "Бүртгэлтэй"
            ) : (
              <>
                Бүртгүүлэх
                <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
