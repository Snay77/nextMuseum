import { getSafeCallbackUrl } from "@/app/_lib/safe-callback";
import AuthExperience from "@/app/components/auth/AuthExperience";
import { getI18n } from "@/app/i18n/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return {
    title: t("auth.registerTitle"),
    description: t("auth.registerDescription"),
  };
}

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  return (
    <AuthExperience
      mode="register"
      callbackUrl={getSafeCallbackUrl(params?.callbackUrl)}
    />
  );
}
