import AuthExperience from "@/app/components/auth/AuthExperience";

export const metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace personnel New Museum.",
};

export default function LoginPage() {
  return <AuthExperience mode="login" />;
}
