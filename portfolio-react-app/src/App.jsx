import { Routes, Route } from 'react-router-dom';
import LogoScreen from './components/logoScreen/LogoScreen';
import StartDesktop from './components/startDesktop/StartDesktop.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';
import AdminPanel from './components/admin/AdminPanel.jsx';
import LogOffScreen from './components/systemXp/LogOffScreen.jsx';
import ShutdownScreen from './components/systemXp/ShutdownScreen.jsx';
import PowerOffScreen from './components/systemXp/PowerOffScreen.jsx';
import XpWelcomeScreen from './components/welcome/XpWelcomeScreen.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LogoScreen />} />
      <Route path="/welcome" element={<XpWelcomeScreen />} />
      <Route path="/start" element={<StartDesktop />} />
      <Route path="/logoff" element={<LogOffScreen />} />
      <Route path="/shutdown" element={<ShutdownScreen />} />
      <Route path="/power-off" element={<PowerOffScreen />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
}

export default App;