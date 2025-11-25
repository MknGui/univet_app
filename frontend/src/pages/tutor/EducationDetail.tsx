import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import {
  Heart,
  Pill,
  Droplet,
  Sparkles,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getEducationContent,
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

const EducationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState<EducationContent | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/tutor/education");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const data = await getEducationContent(id);
        setContent(data);
      } catch (error: any) {
        console.error(error);
        toast.error("Conteúdo não encontrado");
        navigate("/tutor/education");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, navigate]);

  if (loading || !content) {
    return (
      <MobileLayout>
        <MobileHeader title="Conteúdo Educacional" showBack />
        <div className="px-6 py-6">
          <div className="mobile-card text-center py-12">
            <p className="text-sm text-muted-foreground">
              Carregando conteúdo...
            </p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const cfg =
    CATEGORY_CONFIG[content.category] ?? CATEGORY_CONFIG["nutrition"];
  const Icon = cfg.icon;
  const categoryLabel = cfg.label;

  return (
    <MobileLayout>
      <MobileHeader title="Conteúdo Educacional" showBack />

      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`w-16 h-16 ${cfg.color} rounded-2xl flex items-center justify-center flex-shrink-0`}
          >
            <Icon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">
              {categoryLabel}
            </p>
            <h1 className="text-2xl font-bold">{content.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {content.readTime || "5 min"} de leitura
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {content.content ? (
          <div
            className="prose prose-sm max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: content.content }}
            style={{
              color: "var(--foreground)",
            }}
          />
        ) : (
          <div className="mobile-card mb-6">
            <p className="text-sm text-muted-foreground">
              Este conteúdo ainda não possui texto cadastrado.
            </p>
          </div>
        )}

        {/* External Link */}
        {content.link && (
          <Button
            onClick={() => window.open(content.link!, "_blank")}
            className="w-full gradient-primary"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ler mais no site oficial
          </Button>
        )}
      </div>
    </MobileLayout>
  );
};

export default EducationDetail;
