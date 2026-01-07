import { useEffect, useState } from "react";

const PWA_PROMPT_SHOWN_KEY = "hobhob_pwa_prompt_shown";

export function useFirstTime() {
  const [hasSeenPrompt, setHasSeenPrompt] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPrompt = () => {
      const shown = localStorage.getItem(PWA_PROMPT_SHOWN_KEY);
      setHasSeenPrompt(!!shown);
      setIsLoading(false);
    };

    checkPrompt();
  }, []);

  const markAsSeen = () => {
    localStorage.setItem(PWA_PROMPT_SHOWN_KEY, "true");
    setHasSeenPrompt(true);
  };

  return { hasSeenPrompt, markAsSeen, isLoading };
}
