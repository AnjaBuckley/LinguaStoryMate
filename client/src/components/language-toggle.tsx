import { Button } from "@/components/ui/button";
import { useInterfaceLanguage } from "@/hooks/use-interface-language";

const FLAGS = {
  en: "🇬🇧",
  de: "🇩🇪"
};

export default function LanguageToggle() {
  const { currentLanguage, toggleLanguage } = useInterfaceLanguage();

  // Show the opposite flag of the current language
  const targetLanguage = currentLanguage === 'en' ? 'de' : 'en';
  const targetLanguageText = currentLanguage === 'en' ? 'Deutsch' : 'English';

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleLanguage}
      title={`Switch to ${targetLanguageText}`}
    >
      <span className="text-lg">{FLAGS[targetLanguage]}</span>
    </Button>
  );
}