import Link from 'next/link';
import LoginForm from './LoginForm';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link href="/dashboard" className="link dashboard-link">
          Dashboard
        </Link>
        <Link href="/" className="link add-link">
          Add
        </Link>
      </div>
      <div className="navbar-login">
        <LoginForm />
      </div>
    </nav>
  );
};

export default Navbar;
