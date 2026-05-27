import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-purple-500/20">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-8xl font-black gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-3">Хуудас олдсонгүй</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Таны хайж буй хуудас байхгүй эсвэл зөөгдсөн байна.
        </p>
        <Link href="/">
          <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <Home className="w-5 h-5" />
            Нүүр хуудас руу буцах
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
