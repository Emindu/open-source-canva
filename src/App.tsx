import { useEffect } from 'react';
import Layout from './components/Layout';
import { useEditorStore } from './store/useEditorStore';

function App() {
  const theme = useEditorStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Layout />
  );
}

export default App;
