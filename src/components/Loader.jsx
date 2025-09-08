import React from "react";
import "../styles/Components.css";

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader"></div>
      <p>Cargando datos...</p>
    </div>
  );
};

export default Loader;
