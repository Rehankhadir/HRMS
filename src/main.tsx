import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LeaveProvider } from '@/contexts/leave-context'
import { AnnouncementProvider } from '@/contexts/announcement-context'
import { OnboardingProvider } from '@/contexts/onboarding-context'
import { ExitProvider } from '@/contexts/exit-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LeaveProvider>
      <AnnouncementProvider>
        <OnboardingProvider>
          <ExitProvider>
            <App />
          </ExitProvider>
        </OnboardingProvider>
      </AnnouncementProvider>
    </LeaveProvider>
  </StrictMode>,
)
