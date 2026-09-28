import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<main>
			<h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
		</main>
	);
}
