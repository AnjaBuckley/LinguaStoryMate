import { Button } from "@/components/ui/button";
import { useInterfaceLanguage } from "@/hooks/use-interface-language";

const FLAGS = {
  en: "🇬🇧",
  de: "🇩🇪"
};

export default function LanguageToggle() {
  const { currentLanguage, toggleLanguage } = useInterfaceLanguage();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleLanguage}
      title={`Switch to ${currentLanguage === 'en' ? 'Deutsch' : 'English'}`}
    >
      <span className="text-lg">{FLAGS[currentLanguage]}</span>
    </Button>
  );
}