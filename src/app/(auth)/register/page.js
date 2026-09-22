import { getSafeCallbackUrl } from "@/app/_lib/safe-callback";
import AuthExperience from "@/app/components/auth/AuthExperience";

export const metadata = {
  title: "Créer un compte",
  description: "Créez votre espace personnel New Museum.",
};

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  return (
    <AuthExperience
      mode="register"
      callbackUrl={getSafeCallbackUrl(params?.callbackUrl)}
    />
  );
}
