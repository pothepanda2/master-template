import { createFileRoute } from "@tanstack/react-router";
import { MenuExperience } from "@/components/MenuExperience";
import { loadPublishedMenu } from "@/lib/menu-actions";
import { themeColorMeta } from "@/lib/theme";

export const Route = createFileRoute("/")({
  loader: () => loadPublishedMenu(),
  staleTime: 0,
  gcTime: 0,
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.settings.name ?? "Digital Menu" },
      {
        name: "description",
        content:
          loaderData?.settings.tagline ??
          "Scan the table QR and browse the menu.",
      },
      {
        name: "theme-color",
        content: themeColorMeta(
          loaderData?.settings.themeId,
          loaderData?.settings.accentColor,
        ),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const data = Route.useLoaderData();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: data.settings.name,
    description: data.settings.tagline,
    address: data.settings.address,
    url: data.settings.googleMapsUrl,
    servesCuisine: "Cafe",
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: data.categories.map((category) => ({
        "@type": "MenuSection",
        name: category.title,
        hasMenuItem: data.items
          .filter((item) => item.categoryId === category._id)
          .map((item) => ({
            "@type": "MenuItem",
            name: item.name,
            description: item.description,
            offers: {
              "@type": "Offer",
              price: item.price,
              priceCurrency: "INR",
              availability: item.available
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          })),
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MenuExperience initial={data} />
    </>
  );
}
