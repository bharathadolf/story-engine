import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import AppTest from './AppTest.tsx';
import './index.css';

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (reason && (
    reason.message?.includes('WebSocket') ||
    reason.message?.includes('ws:') ||
    reason.message?.includes('HMR') ||
    reason.toString().includes('WebSocket')
  )) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppTest />
  </StrictMode>,
);
