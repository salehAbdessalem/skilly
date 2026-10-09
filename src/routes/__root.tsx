import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { PostHogProvider, usePostHog } from "@posthog/react";
import { useEffect, useRef } from "react";
import Crosshair from "#/components/Crosshair";
import Navbar from "#/components/Navbar";

import { ClerkProvider, useUser } from '@clerk/tanstack-react-start'

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Skild - The Registry for Aggentic Intelligence",
			},
			{
				name: "description",
				content:
					"Discover, publish, and operate reusable agent capabilities from a route-driven workspace.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function PostHogRoot({ children }: { children: React.ReactNode }) {
	const apiKey = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;
	const apiHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

	if (!apiKey || !apiHost) {
		if (import.meta.env.DEV) {
			const missingVariable = !apiKey
				? "VITE_PUBLIC_POSTHOG_PROJECT_TOKEN"
				: "VITE_PUBLIC_POSTHOG_HOST";
			throw new Error(
				`${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
			);
		}

		return children;
	}

	return (
		<PostHogProvider
			apiKey={apiKey}
			options={{
				api_host: apiHost,
				defaults: "2025-05-24",
				capture_exceptions: true,
				debug: import.meta.env.DEV,
				logs: {
					serviceName: "tanstack-skild-web",
					environment: import.meta.env.MODE,
				},
			}}
		>
			{children}
		</PostHogProvider>
	);
}

function PostHogIdentity() {
	const posthog = usePostHog();
	const { isLoaded, isSignedIn, user } = useUser();
	const identifiedUserId = useRef<string | null>(null);

	useEffect(() => {
		if (!isLoaded) return;

		if (!isSignedIn || !user) {
			if (identifiedUserId.current) {
				posthog.reset();
				identifiedUserId.current = null;
			}
			return;
		}

		if (identifiedUserId.current === user.id) return;

		if (identifiedUserId.current) {
			posthog.reset();
		}

		posthog.identify(user.id, {
			email: user.primaryEmailAddress?.emailAddress,
			name: user.fullName ?? undefined,
		});
		identifiedUserId.current = user.id;
	}, [isLoaded, isSignedIn, posthog, user]);

	return null;
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="font-sans antialiased wrap-anywhere">
				<PostHogRoot>
					<ClerkProvider>
						<PostHogIdentity />
						<div id="root-layout">
							<header>
								<div className="frame">
									<Navbar />
									<Crosshair />
									<Crosshair />
								</div>
							</header>

							<main>
								<div className="frame">{children}</div>
							</main>
						</div>
						<TanStackDevtools
							config={{
								position: "bottom-right",
							}}
							plugins={[
								{
									name: "Tanstack Router",
									render: <TanStackRouterDevtoolsPanel />,
								},
								TanStackQueryDevtools,
							]}
						/>
					</ClerkProvider>
				</PostHogRoot>
				<Scripts />
			</body>
		</html>
	);
}
