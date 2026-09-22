import {
  getObjects,
  getWikimediaThumbnail,
  isWikimediaThumbnail,
} from "@/app/_lib/paintings";
import SingularityExperience from "@/app/components/singularity/SingularityExperience";
import { getI18n } from "@/app/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getI18n();
  return {
    title: "Singularity 031",
    description: t("singularity.description"),
  };
}

function imageSource(src) {
  if (!src) return null;
  return isWikimediaThumbnail(src) ? getWikimediaThumbnail(src, 500) : src;
}

export default async function SingularityPage() {
  let objects = [];

  try {
    objects = (await getObjects()).filter(
      (object) => object.image && object.slug,
    );
  } catch {
    objects = [];
  }

  const works = objects.map((object) => ({
    id: object.id,
    slug: object.slug,
    title: object.title,
    artist: object.artist,
    image: imageSource(object.image),
  }));

  return <SingularityExperience works={works} />;
}
