import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useCarrinho } from '../hooks/useCarrinho';
import { FiShoppingCart, FiUser, FiLogOut, FiBox, FiHome } from 'react-icons/fi';

export default function Header() {
  const { user, logout, isVendedor, isAdmin } = useAuth();
  const { totalItens } = useCarrinho();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            RJ Place
          </Link>

          {/* Navegação */}
          <div className="flex items-center space-x-4">
            <Link href="/carrinho" className="relative">
              <FiShoppingCart size={24} className="text-gray-600 hover:text-blue-600" />
              {totalItens > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItens}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                {(isVendedor || isAdmin) && (
                  <Link href="/painel" className="text-gray-600 hover:text-blue-600">
                    <FiBox size={22} />
                  </Link>
                )}
                <span className="text-sm text-gray-700 hidden sm:inline">
                  {user.email?.split('@')[0]}
                </span>
                <button onClick={logout} className="text-gray-600 hover:text-red-600">
                  <FiLogOut size={20} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FiUser size={18} />
                <span>Entrar</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
