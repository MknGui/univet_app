import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Pill, Droplet, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  listEducationContents,
  type EducationContent,
} from "@/api/education";

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  nutrition: {
    label: "Alimentação",
    icon: Heart,
    color: "bg-red-500/10 text-red-600",
  },
  vaccination: {
    label: "Vacinação",
    icon: Pill,
    color: "bg-blue-500/10 text-blue-600",
  },
  hygiene: {
    label: "Higiene",
    icon: Droplet,
    color: "bg-cyan-500/10 text-cyan-600",
  },
  wellbeing: {
    label: "Bem-estar",
    icon: Sparkles,
    color: "bg-purple-500/10 text-purple-600",
  },
};

const Education = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [contents, setContents] = useState<EducationContent[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = Object.entries(CATEGORY_CONFIG).map(([id, cfg]) => ({
    id,
    label: cfg.label,
    icon: cfg.icon,
  }));

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await listEducationContents();
        setContents(data);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.message || "Erro ao carregar conteúdos educacionais."
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredContents = selectedCategory
    ? contents.filter((c) => c.category === selectedCategory)
    : contents;

  return (
    <MobileLayout>
      <MobileHeader title="Conteúdo Educacional" />

      <div className="px-6 py-6 space-y-6">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? "gradient-primary" : ""}
          >
            Todos
          </Button>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={selectedCategory === cat.id ? "gradient-primary" : ""}
              >
                <Icon className="w-4 h-4 mr-2" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="space-y-4">
          {loading && contents.length === 0 ? (
            <div className="mobile-card text-center py-12">
              <p className="text-sm text-muted-foreground">
                Carregando conteúdos...
              </p>
            </div>
          ) : filteredContents.length > 0 ? (
            filteredContents.map((content) => {
              const cfg =
                CATEGORY_CONFIG[content.category] ??
                CATEGORY_CONFIG["nutrition"];
              const Icon = cfg.icon;

              return (
                <button
                  key={content.id}
                  onClick={() => navigate(`/tutor/education/${content.id}`)}
                  className="w-full mobile-card text-left hover:shadow-lg transition-all active:scale-95"
                >
                  <div className="flex gap-4">
                    <div
                      className={`w-14 h-14 ${cfg.color} rounded-2xl flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 line-clamp-1">
                        {content.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {content.summary}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {content.readTime || "5 min"} de leitura
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="mobile-card text-center py-12">
              <p className="text-sm text-muted-foreground">
                Nenhum conteúdo encontrado para esta categoria.
              </p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Education;
