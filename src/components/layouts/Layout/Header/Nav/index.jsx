import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

import { useAuthContext } from 'hooks/useAuthContext';

import { RiMenuLine } from 'react-icons/ri';
// import { CgSearch } from 'react-icons/cg';

import CartIcon from './CartIcon';

import { Button } from 'components/common';

import LogoNav from 'assets/images/logo-nav.png';

import styles from './index.module.scss';

const Navbar = ({ toggleSideNav, openCartModal }) => {
  const { pathname } = useLocation();

  const { isVerified, isAdmin, name, lastName } = useAuthContext();

  const [hasScrolled, setHasSrolled] = useState(false);

  const resizeHeaderOnScroll = () => {
    setHasSrolled((hasScrolled) => {
      if (
        !hasScrolled &&
        (document.body.scrollTop > 20 ||
          document.documentElement.scrollTop > 20)
      ) {
        return true;
      }

      if (
        hasScrolled &&
        document.body.scrollTop < 4 &&
        document.documentElement.scrollTop < 4
      ) {
        return false;
      }

      return hasScrolled;
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', resizeHeaderOnScroll);

    return () => window.removeEventListener('scroll', resizeHeaderOnScroll);
  }, []);

  const handleOpenCartModal = () => {
    if (pathname !== '/cart') {
      openCartModal();
    }
  };

  const navStyles = hasScrolled
    ? `${styles.nav} ${styles.hasScrolled}`
    : styles.nav;

  return (
    <nav className={navStyles}>
      <div className={styles.container_top}>
        <Button className={`${styles.link} ${styles.info_link}`} type="button">
          Info
        </Button>
        <ul className={styles.info_list}>
          <li>
            <a href="https://www.facebook.com/ngoc.vuong0126" className={styles.link} target="_blank" rel="noreferrer">

              Help Center
            </a>
          </li>
          <li>
            <a href="https://sites.google.com/view/contact-skrt" className={styles.link} target="_blank" rel="noreferrer">

              Contact Us
            </a>
          </li>
          <li>
            <a href="https://ghn.vn/" className={styles.link} target="_blank" rel="noreferrer">

              Shipping Info
            </a>

          </li>
          <li>
            <Link className={styles.link} to="/account">
              Track My Order
            </Link>
          </li>
          <li>
            <a href="mailto: ngocvuong443@gmail.com" className={styles.link} target="_blank" rel="noreferrer">

              Returns & Exchanges
            </a>
          </li>
          <li>
            <Link className={styles.link} to="/">
              About Us
            </Link>
          </li>
          <li>
            <Link className={styles.link} to="/">
              Carreers
            </Link>
          </li>
        </ul>
        {!isVerified && (
          <Link
            to="/account/login"
            className={`${styles.link} ${styles.login_link}`}
          >
            Login
          </Link>
        )}
        {isVerified && (
          <Link to="/account" className={`${styles.link} ${styles.login_link}`}>
            {/* My Account, */}
            {name} {lastName}
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin" className={`${styles.link} ${styles.login_link}`}>
            Admin
          </Link>
        )}
      </div>
      <div className={styles.container_bottom}>
        <Link to="/">
          <img className={styles.logo} src={LogoNav} alt="Logo Nav" />
        </Link>
        <ul className={styles.links}>
          <li>
            <NavLink className={styles.link} to="/collections/phones">
              Phones
            </NavLink>
          </li>
          <li>
            <NavLink
              className={styles.link}
              to="/collections/laptops"
            >
              Laptops
            </NavLink>
          </li>
          <li>
            <NavLink className={styles.link} to="/collections/accessories">
              Accessories
            </NavLink>
          </li>
        </ul>
        <ul className={styles.icons_menu}>

          <li className={styles.cart_icon} onClick={handleOpenCartModal}>
            <CartIcon />
          </li>
          <li className={styles.mobile_icon}>
            <RiMenuLine onClick={toggleSideNav} />
          </li>
        </ul>
      </div>
    </nav >
  );
};

export default Navbar;
