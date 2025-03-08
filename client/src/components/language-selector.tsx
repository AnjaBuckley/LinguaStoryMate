import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Korean",
  "Turkish",
  "Swedish",
  "Russian",
];

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LanguageSelector({
  value,
  onChange,
}: LanguageSelectorProps) {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {lang}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}