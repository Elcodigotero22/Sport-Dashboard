import React from "react";

const CacheStatus = ({cacheInfo, onClearCache}) => {
  return (
    <div className="cache-status-panel">
      {cacheInfo.length > 0 && (
        <div className="cache-details">
          <button onClick={onClearCache} className="btn btn-secondary">
            Limpiar Cache
          </button>
        </div>
      )}
    </div>
  );
};

export default CacheStatus;
