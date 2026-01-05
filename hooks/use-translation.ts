import { useLanguageStore } from "@/store/use-language-store";
import { translations, type TranslationKey } from "@/lib/i18n/translations";

/**
 * Get a nested value from an object using a dot notation path
 */
function getNestedValue<T extends Record<string, any>>(
  obj: T,
  path: string
): string | T {
  return path.split(".").reduce((current, key) => {
    return current?.[key];
  }, obj as any);
}

/**
 * Hook to get translation function
 */
export function useTranslation() {
  const { language } = useLanguageStore();

  /**
   * Get translation by key (supports dot notation for nested keys)
   * @example
   * t("common.save") // "Save"
   * t("nav.today") // "Today"
   */
  const t = (key: string): string => {
    const translation = getNestedValue(translations[language], key);
    if (typeof translation === "string") {
      return translation;
    }
    // If the result is an object, return the key as fallback
    return key;
  };

  /**
   * Get translation with parameters
   * @example
   * tp("stats.ofDays", { total: 7 }) // "of 7 days"
   */
  const tp = (key: string, params: Record<string, string | number> = {}): string => {
    let translation = getNestedValue(translations[language], key) as string;

    if (typeof translation !== "string") {
      return key;
    }

    // Replace placeholders like {total}, {completed}, etc.
    Object.keys(params).forEach((param) => {
      translation = translation.replace(
        new RegExp(`\\{${param}\\}`, "g"),
        String(params[param])
      );
    });

    return translation;
  };

  return {
    t,
    tp,
    language,
  };
}
