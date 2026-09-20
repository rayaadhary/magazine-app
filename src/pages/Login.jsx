import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Selamat datang, ${user.label || user.email}`);
      navigate(user.role === "siswa" ? "/" : "/admin");
    } catch (err) {
      setError(err.message || "Login gagal");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-navy text-white">
      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[1fr_0.8fr]">
        {/* Left decorative panel */}
        <div className="relative hidden overflow-hidden border-r border-admin-border lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(212,175,55,.24),transparent_35%)]" />
          <div className="absolute left-16 top-20 text-[10px] uppercase tracking-[0.3em] text-gold">
            Sittah Magazine / 06
          </div>
          <div className="absolute bottom-20 left-16 max-w-[440px]">
            <h1 className="font-heading text-8xl leading-[0.8] tracking-tight">
              Ruang<br />
              <em className="text-gold">Redaksi.</em>
            </h1>
            <p className="mt-10 max-w-[300px] text-sm leading-6 text-white/60">
              Tempat ide, cerita, dan halaman baru dipersiapkan untuk pembaca.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex flex-col justify-between px-7 py-8 sm:px-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 hover:text-gold transition-colors self-start"
          >
            <ArrowLeft size={15} />
            Kembali ke reader
          </Link>

          <div className="mx-auto w-full max-w-[340px] my-auto">
            <h2 className="font-heading text-4xl tracking-tight mb-2">Masuk</h2>
            <p className="text-sm text-white/50 mb-10">
              Gunakan akun redaksi untuk masuk.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-danger/15 text-danger px-4 py-2.5 rounded-md text-sm font-medium border border-danger/15">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="nama@sekolah.sch.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-transparent border border-admin-border rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors font-body"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-transparent border border-admin-border rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors font-body"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gold text-navy border-none rounded-md text-sm font-bold cursor-pointer hover:bg-gold-rich transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body"
              >
                {loading ? "Masuk..." : "Masuk"}
              </button>
            </form>
          </div>

          <div className="text-[10px] text-white/25 text-center">
            &copy; Humas SMP Muhammadiyah 6 Surabaya
          </div>
        </div>
      </div>
    </div>
  );
}
