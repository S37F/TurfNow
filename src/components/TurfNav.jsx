import React, { useState } from "react";
import turfbg from "../images/turfbg.jpg";
import Logo from "./Logo";
import "../style/turf.css";
import { BiFootball } from "react-icons/bi";
import { IoIosBasketball } from "react-icons/io";
import { GiTennisRacket, GiCricketBat } from "react-icons/gi";
import { MdLocationOn } from "react-icons/md";
import { useUserAuth } from "../context/Authcontext";
import { PopoverProfile } from "./Popover";
import { Box, Show, Hide } from "@chakra-ui/react";

export const TurfNav = (prop) => {
  const { setTurf } = prop;
  const [activeSport, setActiveSport] = useState("football");
  const { user, logout } = useUserAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleSportClick = (sport) => {
    setActiveSport(sport);
    setTurf(sport);
  };

  const sports = [
    { id: "football", name: "Football", icon: <BiFootball /> },
    { id: "cricket", name: "Cricket", icon: <GiCricketBat /> },
    { id: "basketball", name: "Basketball", icon: <IoIosBasketball /> },
    { id: "badminton", name: "Badminton", icon: <GiTennisRacket /> },
  ];

  return (
    <header className="turf-header">
      <div className="turf-header-bg">
        <img src={turfbg} alt="Turf background" />
        <div className="turf-header-overlay"></div>
      </div>
      
      <div className="turf-header-content">
        {/* Top Nav */}
        <nav className="turf-top-nav">
          <Hide below="sm">
            <Logo variant="full" size="sm" color="white" />
          </Hide>
          <Show below="sm">
            <Logo variant="icon" size="sm" color="white" />
          </Show>
          <div className="turf-nav-actions">
            <div className="turf-location">
              <MdLocationOn />
              <span>Andheri, Mumbai</span>
            </div>
            <PopoverProfile handleLogout={handleLogout} email={user?.email} />
          </div>
        </nav>

        {/* Hero Text */}
        <div className="turf-hero-text">
          <h1>Find Your Perfect <span>Playing Ground</span></h1>
          <p>Book premium sports facilities near you in just a few clicks</p>
        </div>

        {/* Sport Tabs */}
        <div className="sport-tabs">
          {sports.map((sport) => (
            <button
              key={sport.id}
              className={`sport-tab ${activeSport === sport.id ? "active" : ""}`}
              onClick={() => handleSportClick(sport.id)}
            >
              <span className="sport-icon">{sport.icon}</span>
              <span className="sport-name">{sport.name}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
