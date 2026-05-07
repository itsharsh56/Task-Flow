import { useAuthBootstrap } from './hooks/useAuthBootstrap'
import { AppRouter } from './routes/AppRouter'

function App() {
  useAuthBootstrap()

  return <AppRouter />
}

export default App
