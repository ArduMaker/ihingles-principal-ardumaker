import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { ENV } from './env';
import { useEffect } from 'react';

const AuthHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

	useEffect(() => {
		let mounted = true;

		const syncToken = async () => {
			if (!mounted) return;
			if (isAuthenticated) {
				try {
					const token = await getAccessTokenSilently();
					document.cookie = `Autenticacion=${token}; path=/; max-age=${7*24*60*60}`;
				} catch (e) {
					console.error('Error obteniendo access token:', e);
				}
			} else {
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
			redirect_uri: `${window.location.origin}/dashboard`,
			audience: ENV.okta_audience,
			scope: ENV.okta_scope,
			}}
			onRedirectCallback={(appState?: any) => {
				// Emitimos un evento para que la app (que está dentro de BrowserRouter)
				// pueda usar la navegación del router (useNavigate) en lugar de
				// llamar a window.location desde aquí.
				const returnTo = appState && appState.returnTo;
				window.dispatchEvent(new CustomEvent('auth:redirect', { detail: { returnTo } }));
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
