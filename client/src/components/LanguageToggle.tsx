import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  return (
    <Button 
      variant="ghost" 
      onClick={() => setLanguage(language === "es" ? "en" : "es")}
      className="font-medium text-xs rounded-full px-3"
    >
      {language === "es" ? "EN" : "ES"}
    </Button>
  );
}
