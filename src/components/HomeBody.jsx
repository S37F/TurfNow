import React from 'react'
import ball from "../images/ball.png"
import { Link } from 'react-router-dom'

export const HomeBody = () => {
  return (
    <>
      <section id='homeBody'>
        <div id='ballImg'>
          <img src={ball} alt="Sports ball" />
        </div>
        <div id='ballingText'>
          <h2 id='bodyheading'>
            WHY CHOOSE <span>TurfNow</span> FOR YOUR GAME?
          </h2>
          <p id='bodyHeading2'>
            Book your favorite sports ground online with ease. Pay securely with Credit Card, Debit Card, Net Banking or Digital Wallets. With TurfNow, enjoy a seamless booking experience that's as exciting as the game itself!
          </p>
          <div id='features'>
            <div className='feature-item'>
              <span className='feature-icon'>⚡</span>
              <span>Instant Booking</span>
            </div>
            <div className='feature-item'>
              <span className='feature-icon'>🔒</span>
              <span>Secure Payment</span>
            </div>
            <div className='feature-item'>
              <span className='feature-icon'>📍</span>
              <span>Multiple Locations</span>
            </div>
          </div>
          <Link to={"/login"}>
            <button id='loginBtn'>GET STARTED</button>
          </Link>
        </div>
      </section>

      {/* Turf Owner CTA Section */}
      <section id='ownerCTA' style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
            fontWeight: '800', 
            marginBottom: '16px',
            fontFamily: "'Poppins', sans-serif"
          }}>
            🏟️ Own a Turf?
          </h2>
          <p style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.2rem)', 
            opacity: 0.9, 
            marginBottom: '24px',
            lineHeight: 1.6
          }}>
            Join TurfNow and reach thousands of players looking for quality sports grounds.
            List your turf, manage bookings, and grow your business!
          </p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px', 
            flexWrap: 'wrap',
            marginBottom: '32px'
          }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '12px 20px', 
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              ✅ Easy Listing
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '12px 20px', 
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              ✅ Manage Bookings
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '12px 20px', 
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              ✅ Track Revenue
            </div>
          </div>
          <Link to="/owner-signup">
            <button style={{
              background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
              color: 'white',
              border: 'none',
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: '700',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Register as Turf Owner →
            </button>
          </Link>
        </div>
      </section>
    </>
  )
}

