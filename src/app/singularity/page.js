import {
  getObjects,
  getWikimediaThumbnail,
  isWikimediaThumbnail,
} from "../_lib/paintings";
import SingularityExperience from "../components/singularity/SingularityExperience";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Singularity 031",
  description:
    "Une expérience audiovisuelle où la collection du New Museum entre en fusion.",
};

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
