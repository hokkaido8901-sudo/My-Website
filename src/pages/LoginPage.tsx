import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Zap, Trophy, Users, Star, ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!loading && user) setLocation("/dashboard");
  }, [user, loading]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      setLocation("/dashboard");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-purple-900/80 to-blue-900/80 relative overflow-hidden p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white">ҮУПК Арга Хэмжээ</span>
          </div>
        </div>
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl font-black text-white leading-tight">
            Авьяасаа илэрхийлж,<br />
            <span className="text-purple-300">ялалтаа тэмдэглэ</span>
          </h2>
          <div className="space-y-4">
            {[
              { icon: Trophy, text: "48+ тэмцээнд оролцох боломж" },
              { icon: Users, text: "1,200+ суралцагчтай холбогдох" },
              { icon: Star, text: "Рейтинг дэх байраа дээшлүүлэх" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-3 text-white/80">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative z-10 text-xs text-white/40">
          © 2025 ҮУПК Арга Хэмжээ · Монголын тэмцээний платформ
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            Нүүр хуудас
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 justify-center mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black gradient-text">ҮУПК Арга Хэмжээ</span>
          </div>

          <div className="bg-card border border-card-border rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-foreground mb-2">Тавтай морил</h1>
              <p className="text-muted-foreground text-sm">
                Google аккаунтаараа нэвтэрч тэмцээнийхэн нэгдэнэ үү
              </p>
            </div>

            <Button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full h-13 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 text-base font-semibold rounded-xl"
              variant="outline"
              data-testid="button-google-signin"
            >
              <FcGoogle className="w-6 h-6 shrink-0" />
              Google-ээр нэвтрэх
            </Button>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Нэвтрэснээр та манай{" "}
                <span className="text-primary font-medium">үйлчилгээний нөхцөл</span>
                {" "}болон{" "}
                <span className="text-primary font-medium">нууцлалын бодлого</span>
                -той зөвшөөрч байна.
              </p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {["Үнэгүй", "Аюулгүй", "Хурдан бүртгэл"].map((tag) => (
              <span key={tag} className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full border border-border">
                ✓ {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
