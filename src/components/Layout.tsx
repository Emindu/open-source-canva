import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Workspace from './Workspace';
import PropertiesPanel from './PropertiesPanel';

const Layout: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      <Topbar />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <Workspace />
        <PropertiesPanel />
      </div>
    </div>
  );
};

export default Layout;
