import React from 'react';
import './Template.css';

function Template({ children }) {
  return (
    <div className="template-container">
      <header className="header">
        <h1>Centre de Radiologie</h1>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>© 2024 Centre de Radiologie</p>
      </footer>
    </div>
  );
}

export default Template;