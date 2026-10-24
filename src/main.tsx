import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BoardPage } from './pages/BoardPage'
import { HostPage } from './pages/HostPage'
import { LibraryPage } from './pages/LibraryPage'
import { useRoute } from './router'
import './styles.css'

function App() {
  const route = useRoute()
  if (route === '/board') return <BoardPage />
  if (route === '/host') return <HostPage />
  return <LibraryPage />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
