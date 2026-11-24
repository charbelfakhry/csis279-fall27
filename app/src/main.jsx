import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx';
import store from './store';
import { restoreSession, sessionEnded } from './store/authSlice';
import { SESSION_EXPIRED_EVENT } from './services/apiFetch';
import 'bootstrap/dist/css/bootstrap.min.css';

// graphqlFetch fires this when the API rejects the token
window.addEventListener(SESSION_EXPIRED_EVENT, () => store.dispatch(sessionEnded()));
store.dispatch(restoreSession());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
