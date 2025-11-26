import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/layout/Layout';
import { PageLoader } from './components/common/LoadingSpinner';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Messages = React.lazy(() => import('./pages/Messages').then(module => ({ default: module.Messages })));
const Notifications = React.lazy(() => import('./pages/Notifications').then(module => ({ default: module.Notifications })));
const Login = React.lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Signup = React.lazy(() => import('./pages/Signup').then(module => ({ default: module.Signup })));
const Onboarding = React.lazy(() => import('./pages/Onboarding').then(module => ({ default: module.Onboarding })));
const Profile = React.lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const AkitaDetail = React.lazy(() => import('./pages/AkitaDetail').then(module => ({ default: module.AkitaDetail })));
const Community = React.lazy(() => import('./pages/Community').then(module => ({ default: module.Community })));
const CommunityHub = React.lazy(() => import('./pages/CommunityHub').then(module => ({ default: module.CommunityHub })));
const Directory = React.lazy(() => import('./pages/Directory').then(module => ({ default: module.Directory })));
const Events = React.lazy(() => import('./pages/Events').then(module => ({ default: module.Events })));
const EventDetail = React.lazy(() => import('./pages/EventDetail').then(module => ({ default: module.EventDetail })));
const Marketplace = React.lazy(() => import('./pages/Marketplace').then(module => ({ default: module.Marketplace })));
const ThreadDetail = React.lazy(() => import('./pages/ThreadDetail').then(module => ({ default: module.ThreadDetail })));
const ModeratorDashboard = React.lazy(() => import('./pages/ModeratorDashboard').then(module => ({ default: module.ModeratorDashboard })));
const Landing = React.lazy(() => import('./pages/Landing').then(module => ({ default: module.Landing })));
const Contact = React.lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));

function App() {
  return (
    <StoreProvider>
      <Router>
        <Suspense fallback={<PageLoader text="Loading Akita Connect..." />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<Onboarding />} />

            <Route path="/landing" element={<Landing />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:id" element={<Profile />} />
              <Route path="akitas/:id" element={<AkitaDetail />} />
              <Route path="akitas" element={<Directory />} />
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="hub" element={<CommunityHub />} />
              <Route path="community" element={<Community />} />
              <Route path="community/thread/:id" element={<ThreadDetail />} />
              <Route path="thread/:id" element={<ThreadDetail />} />
              <Route path="events" element={<Events />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="directory" element={<Directory />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="moderator" element={<ModeratorDashboard />} />
              <Route path="contact" element={<Contact />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </StoreProvider>
  );
}

export default App;
