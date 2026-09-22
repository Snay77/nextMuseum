import { getSafeCallbackUrl } from "@/app/_lib/safe-callback";
import AuthExperience from "@/app/components/auth/AuthExperience";
import { getI18n } from "@/app/i18n/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return {
    title: t("auth.loginTitle"),
    description: t("auth.loginDescription"),
  };
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  return (
    <AuthExperience
      mode="login"
      callbackUrl={getSafeCallbackUrl(params?.callbackUrl)}
    />
  );
}
