import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  margin-right: ${props => props.isSidebarOpen ? '280px' : '0'};
  transition: margin-right 0.3s ease;
  
  @media (max-width: 768px) {
    margin-right: 0;
    padding: 1rem;
  }
`;

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <LayoutContainer>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <MainContent isSidebarOpen={isSidebarOpen}>
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default DashboardLayout; 