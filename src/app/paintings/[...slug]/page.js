import Image from "next/image";
import Link from "next/link";
import {
	getObject,
	getObjects,
	getWikimediaThumbnail,
	isWikimediaThumbnail,
} from "../../_lib/paintings";

function getImageSource(src, width = 1920) {
	if (!src) return null;

	return isWikimediaThumbnail(src) ? getWikimediaThumbnail(src, width) : src;
}

export default async function PaintingPage({ params }) {
	const { slug } = await params;
	const [painting, objects] = await Promise.all([
		getObject(slug.join("/")),
		getObjects(),
	]);
	const gallery = painting.gallery?.filter(Boolean) ?? [];
	const otherPaintings = objects
		.filter((object) => object.id !== painting.id && object.slug)
		.slice(0, 3);

	return (
		<main className="min-h-screen bg-background px-4 text-foreground">
			<div className="flex w-full flex-col gap-2">
				<section className="relative h-180 overflow-hidden rounded-3xl bg-foreground">
					<Image
						src={getImageSource(painting.image)}
						alt={painting.title}
						fill
						priority
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-foreground/35" />
					<div className="relative z-10 flex h-full flex-col justify-end p-6 text-background md:p-10">
						<p className="mb-3 text-sm uppercase tracking-[0.25em] text-background/75">
							{painting.type ?? "Œuvre"}
						</p>
						<h1 className="max-w-4xl text-5xl font-semibold leading-none md:text-8xl">
							{painting.title}
						</h1>
						<p className="mt-4 text-xl text-background/85 md:text-2xl">
							{painting.artist} · {painting.year}
						</p>
					</div>
				</section>

				<section className="grid gap-2 lg:grid-cols-[1.4fr_0.6fr]">
					<div className="rounded-3xl bg-cream p-6 md:p-10">
						<p className="mb-6 text-sm uppercase tracking-[0.2em] text-foreground/60">
							À propos de l’œuvre
						</p>
						<div
							className="prose max-w-none text-lg leading-relaxed text-foreground"
							dangerouslySetInnerHTML={{
								__html: painting.description ?? "Aucune description disponible.",
							}}
						/>
					</div>

					<div className="rounded-3xl bg-bordo p-6 text-background md:p-10">
						<p className="mb-6 text-sm uppercase tracking-[0.2em] text-background/70">
							Informations
						</p>
						<dl className="space-y-5">
							<Info label="Artiste" value={painting.artist} />
							<Info label="Année" value={painting.year} />
							<Info label="Type" value={painting.type} />
							<Info label="Mouvement" value={painting.movement} />
							<Info label="Couleur" value={painting.color} />
							<Info label="Lieu" value={painting.location} />
						</dl>
						{painting.locationLink && (
							<a
								href={painting.locationLink}
								target="_blank"
								rel="noreferrer"
								className="mt-8 inline-block border-b border-background pb-1 text-sm"
							>
								Visiter le musée
							</a>
						)}
					</div>
				</section>

				{gallery.length > 0 && (
					<section className="rounded-3xl bg-cream p-6 md:p-10">
						<div className="mb-6 flex items-end justify-between gap-4">
							<h2 className="text-3xl font-semibold md:text-5xl">Galerie</h2>
							<Link
								href="/paintings"
								className="text-sm text-foreground/70 underline underline-offset-4"
							>
								Toutes les œuvres
							</Link>
						</div>
						<div className="grid gap-2 md:grid-cols-2">
							{gallery.map((image, index) => (
								<div
									key={`${image}-${index}`}
									className="relative aspect-4/3 overflow-hidden rounded-2xl bg-foreground/10"
								>
									<Image
										src={getImageSource(image, 960)}
										alt={`${painting.title}, vue ${index + 1}`}
										fill
										className="object-cover"
									/>
								</div>
							))}
						</div>
					</section>
				)}

				<section className="rounded-3xl bg-foreground p-6 text-background md:p-10">
					<div className="mb-6 flex items-end justify-between gap-4">
						<div>
							<p className="mb-2 text-sm uppercase tracking-[0.2em] text-background/65">
								Collection
							</p>
							<h2 className="text-3xl font-semibold md:text-5xl">
								Découvrez d’autres œuvres
							</h2>
						</div>
						<Link
							href="/paintings"
							className="shrink-0 text-sm text-background/75 underline underline-offset-4"
						>
							Voir toute la collection
						</Link>
					</div>

					<div className="grid gap-2 md:grid-cols-3">
						{otherPaintings.map((object) => (
							<Link
								key={object.id}
								href={`/paintings/${object.slug}`}
								className="group overflow-hidden rounded-2xl bg-cream text-foreground"
							>
								<div className="relative aspect-4/5 overflow-hidden bg-foreground/10">
									<Image
										src={getImageSource(object.image, 960)}
										alt={object.title}
										fill
										className="object-cover transition duration-500 group-hover:scale-105"
									/>
								</div>
								<div className="p-5">
									<p className="text-sm text-foreground/60">{object.artist}</p>
									<h3 className="mt-2 text-xl font-semibold">{object.title}</h3>
								</div>
							</Link>
						))}
					</div>
				</section>
			</div>
		</main>
	);
}

function Info({ label, value }) {
	if (!value) return null;

	return (
		<div className="border-b border-background/20 pb-3">
			<dt className="text-xs uppercase tracking-[0.15em] text-background/65">{label}</dt>
			<dd className="mt-1 text-lg">{value}</dd>
		</div>
	);
}
