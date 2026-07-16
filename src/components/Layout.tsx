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
      {/* Workspace is the only in-flow child; the dock, tool panel, and
          properties panel float above it as absolutely-positioned cards. */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        <Workspace />
        <Sidebar />
        <PropertiesPanel />
      </div>
    </div>
  );
};

export default Layout;
