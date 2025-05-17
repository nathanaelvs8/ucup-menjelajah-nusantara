import React from "react";
import "./Container.css"; // CSS di bawah ini

export default function Container({ children }) {
  return (
    <div className="page-container">
      {children}
    </div>
  );
}
