import logo from "../../../assets/images/logo.png";
import { useAuth } from "../../../context/AuthContext";
import UserMenu from "./UserMenu";
import LoginButton from "./LoginButton";

export default function TopBar({ onOpenMenu }) {
  const { user } = useAuth();

  return (
    <div className="w-full bg-white border-b border-neutral-200">
      <div className="w-full flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img src={logo} alt="Inspira" width="320" height="107" className="h-9 w-auto object-contain" />
        </a>

        {/* Right Desktop */}
        <div className="hidden items-center gap-3 md:flex">
          {!user && <LoginButton />}
          {user && <UserMenu user={user} />}
        </div>

        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="md:hidden rounded-md p-2 hover:bg-neutral-200"
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </div>
    </div>
  );
}
