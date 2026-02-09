import React from 'react'
import "../style/home.css"
import { HomeNav } from '../components/HomeNav'
import { HomeBody } from '../components/HomeBody'
import { Footer } from '../components/Footer'

export const Home = () => {
  return (
    <div id="homePage">
      <HomeNav/>
      <HomeBody/>
      <Footer/>
    </div>
  )
}
