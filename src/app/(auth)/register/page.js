import AuthExperience from "@/app/components/auth/AuthExperience";

export const metadata = {
  title: "Créer un compte",
  description: "Créez votre espace personnel New Museum.",
};

export default function RegisterPage() {
  return <AuthExperience mode="register" />;
}
