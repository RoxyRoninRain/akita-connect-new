import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Onboarding } from './pages/Onboarding';
import { Profile } from './pages/Profile';
import { AkitaDetail } from './pages/AkitaDetail';
import { Community } from './pages/Community';
import { Directory } from './pages/Directory';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Marketplace } from './pages/Marketplace';
import { ThreadDetail } from './pages/ThreadDetail';
import { ModeratorDashboard } from './pages/ModeratorDashboard';

function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="messages" element={<Messages />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:id" element={<Profile />} />
            <Route path="akitas/:id" element={<AkitaDetail />} />
            <Route path="akitas" element={<Directory />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="community" element={<Community />} />
            <Route path="community/thread/:id" element={<ThreadDetail />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="directory" element={<Directory />} />
            <Route path="notifications" element={<Notifications />} /> {/* Added Notifications route */}
            <Route path="moderator" element={<ModeratorDashboard />} /> {/* Moderator Dashboard */}
          </Route>
        </Routes>
      </Router>
    </StoreProvider>
  );
}

export default App;
