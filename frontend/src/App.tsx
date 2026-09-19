import { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Library } from './pages/Library';
import { Songs } from './pages/Songs';
import { Albums } from './pages/Albums';
import { Artists } from './pages/Artists';
import { Genres } from './pages/Genres';
import { Playlists } from './pages/Playlists';
import { Queue } from './pages/Queue';
import { Favorites } from './pages/Favorites';
import { History } from './pages/History';
import { Downloads } from './pages/Downloads';
import { Discover } from './pages/Discover';
import { AIMusic } from './pages/AIMusic';
import { Settings } from './pages/Settings';
import { Providers } from './pages/Providers';
import { Stub } from './pages/Stub';
import { useTheme } from './stores/useTheme';
import { db } from './services/db';

export default function App() {
  const { theme } = useTheme();
  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : theme;
    void db.migrate().catch(() => undefined);
  }, [theme]);

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="discover" element={<Discover />} />
          <Route path="search" element={<Search />} />
          <Route path="library" element={<Library />} />
          <Route path="songs" element={<Songs />} />
          <Route path="albums" element={<Albums />} />
          <Route path="artists" element={<Artists />} />
          <Route path="genres" element={<Genres />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="history" element={<History />} />
          <Route path="ai" element={<AIMusic />} />
          <Route path="queue" element={<Queue />} />
          <Route path="providers" element={<Providers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Stub />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
