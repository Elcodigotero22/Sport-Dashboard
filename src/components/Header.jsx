import React from "react";
import "../styles/Components.css";

const Header = ({title, subtitle}) => {
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-text">
          <h1>{title}</h1>
        </div>
      </div>
      <div className="header-stats">
        <span className="stat-badge">Análiticas en vivo</span>
        <span className="stat-badge">Múltiples ligas</span>
      </div>
    </header>
  );
};

export default Header;
