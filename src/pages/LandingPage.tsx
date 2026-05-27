import { useRef } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Trophy, Zap, Users, Star, ArrowRight, ChevronDown,
  Code2, Palette, Music, FlaskConical, Dumbbell, MessageSquare,
  Shield, BarChart3, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

const categories = [
  { icon: Code2, label: "Програмчлал", color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10" },
  { icon: Palette, label: "Урлаг", color: "from-pink-500 to-rose-500", bg: "bg-pink-500/10" },
  { icon: Music, label: "Хөгжим", color: "from-amber-500 to-orange-500", bg: "bg-amber-500/10" },
  { icon: FlaskConical, label: "Шинжлэх ухаан", color: "from-green-500 to-emerald-500", bg: "bg-green-500/10" },
  { icon: Dumbbell, label: "Спорт", color: "from-purple-500 to-violet-500", bg: "bg-purple-500/10" },
  { icon: MessageSquare, label: "Хэлэлцүүлэг", color: "from-red-500 to-rose-500", bg: "bg-red-500/10" },
];

const stats = [
  { value: "1,200+", label: "Оролцогч" },
  { value: "48", label: "Тэмцээн" },
  { value: "6", label: "Ангилал" },
  { value: "₮5сая+", label: "Нийт шагнал" },
];

const features = [
  { icon: Trophy, title: "Тэмцээн удирдах", desc: "Тэмцээнийг үүсгэж, бүртгэл хийж, үр дүнг шалгаарай" },
  { icon: BarChart3, title: "Аналитик самбар", desc: "Оролцогчдын дэлгэрэнгүй статистик, дүн шинжилгээ" },
  { icon: Bell, title: "Мэдэгдэл систем", desc: "Тэмцээний бүртгэл, шагнал, зарлалын мэдэгдэл" },
  { icon: Shield, title: "Админ удирдлага", desc: "Хэрэглэгч, тэмцээн бүхнийг нэг дор удирдах" },
];

const testimonials = [
  { name: "Батхүү Д.", role: "Програмчлалын ангиллын тэргүүн", text: "ҮУПК Арга Хэмжээ маш хялбар бөгөөд хурдан. Тэмцээнд оролцох бүртгэл хийхэд ердөө 2 минут хангалттай!" },
  { name: "Номин О.", role: "Шинжлэх ухааны тэмцээний ялагч", text: "Рейтинг, оноо бүхнийг нэг дороос харах боломжтой. Системийн дизайн маш тааламжтай." },
  { name: "Анхбаяр Т.", role: "Урлагийн тэмцээний оролцогч", text: "Монгол хэл дээр ийм сайн платформ байхгүй байсан. ҮУПК Арга Хэмжээ бол жинхэнэ шийдэл!" },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight gradient-text">ҮУПК Арга Хэмжээ</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-landing">
            {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Link href="/login">
            <Button variant="outline" size="sm" className="hidden sm:flex" data-testid="link-login">
              Нэвтрэх
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25" data-testid="link-register">
              Эхлэх
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full mb-8"
          >
            <Star className="w-4 h-4" />
            Монголын хамгийн дэвшилтэт тэмцээний платформ
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.05]"
          >
            Авьяасаа{" "}
            <span className="gradient-text">нотол</span>,{" "}
            <br className="hidden md:block" />
            <span className="gradient-text">ялалт</span>аа тэмдэглэ
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Програмчлал, шинжлэх ухаан, урлаг, хөгжим зэрэг олон ангиллын тэмцээнд оролцож,
            рейтингдээ дэвшиж, шагналаа хамгаар ав.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/login">
              <Button
                size="lg"
                className="h-12 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-xl shadow-purple-500/30 text-base font-semibold"
                data-testid="button-get-started"
              >
                Одоо эхлэх
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold" data-testid="link-leaderboard">
                Рейтинг харах
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black gradient-text">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Тэмцээний <span className="gradient-text">ангиллууд</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Таны авьяасыг илэрхийлэх 6 ангиллын тэмцээн танийг хүлээж байна
          </p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`${cat.bg} border border-border rounded-2xl p-6 md:p-8 cursor-pointer group hover:border-primary/30 transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground text-lg">{cat.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">Тэмцээнд оролцох</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 md:px-12 bg-card/50 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Платформын <span className="gradient-text">давуу тал</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-5 p-6 bg-card border border-card-border rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Оролцогчдын <span className="gradient-text">сэтгэгдэл</span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-card-border rounded-2xl p-6 hover:border-primary/30 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{t.text}"</p>
              <div>
                <p className="font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-primary/20 rounded-3xl p-12 md:p-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Өнөөдөр эхлэхэд <span className="gradient-text">бэлэн үү?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Google аккаунтаараа нэвтрэн тэмцээнийхэн тэргүүлэх тавд орно уу.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="h-14 px-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-2xl shadow-purple-500/30 text-lg font-bold"
                data-testid="button-cta"
              >
                <Zap className="w-5 h-5 mr-2" />
                Google-ээр нэвтрэх
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">ҮУПК Арга Хэмжээ</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © 2025 ҮУПК Арга Хэмжээ. Монголын сургуулийн тэмцээний платформ.
          </p>
          <div className="flex items-center gap-4">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">1,200+ оролцогч</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
