import { getSafeCallbackUrl } from "@/app/_lib/safe-callback";
import AuthExperience from "@/app/components/auth/AuthExperience";

export const metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace personnel New Museum.",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  return (
    <AuthExperience
      mode="login"
      callbackUrl={getSafeCallbackUrl(params?.callbackUrl)}
    />
  );
}
