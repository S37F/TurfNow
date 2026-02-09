import React from "react";
import homebg from "../images/bgimg.png";
import Logo from "./Logo";
import { Link } from "react-router-dom";
import { Button, Box, Show, Hide, HStack, Text } from "@chakra-ui/react";
import { useUserAuth } from "../context/Authcontext";

export const HomeNav = () => {
  const { user } = useUserAuth();

  return (
    <div id="heroSection">
      <div id="bgImg">
        <img src={homebg} alt="homebg" />
      </div>
      <nav id="homenav">
        <div id="navLogo">
          <Hide below="sm">
            <Logo variant="full" size="md" color="white" />
          </Hide>
          <Show below="sm">
            <Logo variant="full" size="sm" color="white" />
          </Show>
        </div>
        <div id="loginSignupBtn">
          {user ? (
            <Link to="/turf">
              <Button 
                colorScheme="red" 
                size={{ base: 'sm', md: 'lg' }}
                fontSize={{ base: 'xs', md: 'md' }}
                px={{ base: 3, md: 6 }}
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.3s"
              >
                BROWSE TURFS
              </Button>
            </Link>
          ) : (
            <Link to={"/login"}>
              <Button 
                colorScheme="red" 
                size={{ base: 'sm', md: 'lg' }}
                fontSize={{ base: 'xs', md: 'md' }}
                px={{ base: 3, md: 6 }}
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.3s"
              >
                LOGIN/SIGNUP
              </Button>
            </Link>
          )}
        </div>
      </nav>
      <div id="homeTxt">
        <h1>
          FIND AND BOOK YOUR NEAREST{" "}
          <span>TURF</span> JUST A CLICK AWAY!
        </h1>
      </div>
    </div>
  );
};
