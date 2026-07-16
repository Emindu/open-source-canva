import { useEffect } from 'react';
import Layout from './components/Layout';
import { useEditorStore } from './store/useEditorStore';

function App() {
  const theme = useEditorStore((state) => state.theme);
  const accentTheme = useEditorStore((state) => state.accentTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentTheme);
  }, [accentTheme]);

  return (
    <Layout />
  );
}

export default App;
