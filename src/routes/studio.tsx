import { createFileRoute } from "@tanstack/react-router";
import { StudioApp } from "@/components/studio/StudioApp";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [{ title: "Menu Studio" }, { name: "robots", content: "noindex" }],
  }),
  component: StudioPage,
});

function StudioPage() {
  return <StudioApp />;
}
