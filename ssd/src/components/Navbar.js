import React, { useState } from "react";
import "./Navbar.css";
import defaultProfile from "../assets/profile-photo.png";

const Navbar = ({ handleLogout, employeeDetails }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Text2Query</div>
      <div className="profile-container">
        <img
          src={employeeDetails?.profilePhoto || defaultProfile}
          alt="Profile"
          className="profile-photo"
          onClick={toggleProfileMenu}
        />
        {isProfileOpen && (
          <div className="profile-menu">
            <p><strong>{employeeDetails?.username || "User"}</strong></p>
            <p>{employeeDetails?.designation || "Designation"}</p>
            <button className="logout-button" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
