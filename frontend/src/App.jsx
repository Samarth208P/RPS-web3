import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wagmi'
import { Toaster } from 'react-hot-toast'
import GameContainer from './components/GameContainer'
import ParticleBackground from './components/ParticleBackground'

// Create QueryClient outside component to avoid re-initialization
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

function App() {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <div className="min-h-screen relative">
                    <ParticleBackground />
                    <GameContainer />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            className: 'glass-dark',
                            style: {
                                background: 'rgba(0, 0, 0, 0.8)',
                                color: '#fff',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            },
                            success: {
                                duration: 4000,
                                iconTheme: {
                                    primary: '#10b981',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                duration: 4000,
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                </div>
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default App
