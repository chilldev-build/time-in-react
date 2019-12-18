import React from "react";
import "../../src/nav.css";

const LeftNav = () => {
  return (
    <nav className="menu">
      <div className="smartphone-menu-trigger"></div>
      <ul>
        <li className="icon-dashboard">
          <span>Dashboard</span>
        </li>
        <li className="icon-settings">
          <span>Settings</span>
        </li>
      </ul>
    </nav>
  );
};

export default LeftNav;
