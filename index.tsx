import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Safer typing for the root element
const rootElement = document.getElementById('root') as HTMLElement | null;
if (!rootElement) {
  throw new Error('Could not find root element with id="root" to mount to');
}

const root = ReactDOM.createRoot(rootElement);

// small wrapper so we can re-render (useful for HMR or future telemetry)
const render = (Component: React.ComponentType) => {
  try {
    root.render(
      <React.StrictMode>
        <Component />
      </React.StrictMode>
    );
  } catch (err) {
    // Minimal error handling — keep simple and non-invasive
    // You can replace with a more robust logging/reporting solution later
    // eslint-disable-next-line no-console
    console.error('Failed to render app:', err);
    throw err;
  }
};

render(App);

// Optional Hot Module Replacement support (Vite)
if (import.meta && (import.meta as any).hot) {
  (import.meta as any).hot.accept('./App', (module: any) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NextApp = require('./App').default;
    render(NextApp);
  });
}
