const MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Email ou mot de passe incorrect.",
  "User already registered": "Un compte existe déjà avec cet email.",
  "Email not confirmed":
    "Veuillez confirmer votre email avant de vous connecter.",
  "Password should be at least 6 characters":
    "Le mot de passe doit contenir au moins 6 caractères.",
};

export function translateAuthError(message: string) {
  return MESSAGES[message] ?? message;
}
