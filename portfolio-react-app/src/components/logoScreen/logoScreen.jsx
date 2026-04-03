import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './logoScreen.css';
import winxpLogo from '../../assets/winxp.png';

const LogoScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate('/welcome');
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <div className="screen">
        <div className="boot-content">
          <div className="logo">
            <img src={winxpLogo} alt="Windows XP" />
          </div>
          <div className="loading">
            <div className="bar">
              <div className="indicatorContainer">
                <div className="indicator"></div>
                <div className="indicator"></div>
                <div className="indicator"></div>
              </div>
            </div>
          </div>
        </div>
        <p className="portfolio-watermark">
          Bruno Bacchi — Full stack developer — AI Automation developer
        </p>
      </div>
    </>
  );
}

export default LogoScreen