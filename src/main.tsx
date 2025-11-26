import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { ENV } from './env';
import { useEffect } from 'react';

// Helper component that syncs Auth0 access token into a cookie used by the
// existing API helper. This keeps backward compatibility with `api.ts` which
// reads the `Autenticacion` cookie.
const AuthHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

	useEffect(() => {
		let mounted = true;

		const syncToken = async () => {
			if (!mounted) return;
			if (isAuthenticated) {
				try {
					const token = await getAccessTokenSilently();
					// Guardamos token en cookie para compatibilidad con api.ts
					// Caduca en 7 días
					document.cookie = `Autenticacion=${token}; path=/; max-age=${7*24*60*60}`;
				} catch (e) {
					console.error('Error obteniendo access token:', e);
					// No forzamos logout aquí; el manejo puede hacerse a nivel de UI
				}
			} else {
				// Si no autenticado, limpiamos cookie
				document.cookie = 'Autenticacion=; path=/; max-age=0';
			}
		};

		if (!isLoading) syncToken();

		return () => {
			mounted = false;
		};
	}, [isAuthenticated, isLoading, getAccessTokenSilently]);

	return <>{children}</>;
};

createRoot(document.getElementById("root")!).render(
	<Auth0Provider
		domain={ENV.okta_domain}
		clientId={ENV.okta_clientId}
		authorizationParams={{
			// Al terminar el login, redirigimos a /dashboard para cumplir el requerimiento
			redirect_uri: `${window.location.origin}/dashboard`,
			audience: ENV.okta_audience,
			scope: ENV.okta_scope,
		}}
		useRefreshTokens={true}
		useRefreshTokensFallback={false}
		cacheLocation="localstorage"
	>
		<AuthHandler>
			<App />
		</AuthHandler>
	</Auth0Provider>
);
