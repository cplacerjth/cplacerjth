import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { FiPackage, FiDollarSign, FiShoppingBag, FiUsers } from 'react-icons/fi';

export default function Painel() {
  const router = useRouter();
  const { user, userData, isVendedor, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState({
    totalProdutos: 0,
    totalPedidos: 0,
    totalVendas: 0,
    totalClientes: 0
  });
  const [pedidosRecentes, setPedidosRecentes] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!isVendedor && !isAdmin) {
      router.push('/');
      return;
    }

    async function carregarDados() {
      try {
        const produtosQuery = isAdmin
          ? query(collection(db, 'produtos'))
          : query(collection(db, 'produtos'), where('vendedorId', '==', user.uid));
        
        const produtosSnap = await getDocs(produtosQuery);
        const totalProdutos = produtosSnap.size;

        const pedidosSnap = await getDocs(collection(db, 'pedidos'));
        let totalPedidos = 0;
        let totalVendas = 0;
        const pedidosLista = [];
        
        pedidosSnap.forEach((doc) => {
          const data = doc.data();
          let pertence = false;
          
          if (isAdmin) {
            pertence = true;
          } else {
            data.itens?.forEach(item => {
              if (item.vendedorId === user.uid) pertence = true;
            });
          }
          
          if (pertence) {
            totalPedidos++;
            totalVendas += data.total || 0;
            pedidosLista.push({ id: doc.id, ...data });
          }
        });

        pedidosLista.sort((a, b) => 
          new Date(b.criadoEm) - new Date(a.criadoEm)
        );

        setEstatisticas({
          totalProdutos,
          totalPedidos,
          totalVendas,
          totalClientes: 0
        });
        setPedidosRecentes(pedidosLista.slice(0, 5));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [user, isVendedor, isAdmin, router]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          🏠 Painel {isAdmin ? 'Administrativo' : 'do Vendedor'}
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Produtos</p>
                <p className="text-2xl font-bold">{estatisticas.totalProdutos}</p>
              </div>
              <FiPackage size={32} className="text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pedidos</p>
                <p className="text-2xl font-bold">{estatisticas.totalPedidos}</p>
              </div>
              <FiShoppingBag size={32} className="text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Faturamento</p>
                <p className="text-2xl font-bold">R$ {estatisticas.totalVendas.toFixed(2)}</p>
              </div>
              <FiDollarSign size={32} className="text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Clientes</p>
                <p className="text-2xl font-bold">{estatisticas.totalClientes}</p>
              </div>
              <FiUsers size={32} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/painel/produtos/novo">
            <div className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700">
              ➕ Novo produto
            </div>
          </Link>
          <Link href="/painel/produtos">
            <div className="bg-gray-600 text-white p-4 rounded-lg text-center hover:bg-gray-700">
              📦 Meus produtos
            </div>
          </Link>
          <Link href="/painel/pedidos">
            <div className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700">
              📋 Pedidos
            </div>
          </Link>
          <Link href="/painel/perfil">
            <div className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700">
              ⚙️ Perfil
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">📋 Pedidos recentes</h2>
          {pedidosRecentes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum pedido ainda</p>
          ) : (
            <div className="space-y-3">
              {pedidosRecentes.map((pedido) => (
                <Link key={pedido.id} href={`/pedidos/${pedido.id}`}>
                  <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-semibold">#{pedido.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(pedido.criadoEm).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">R$ {pedido.total.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        pedido.status === 'Entregue' ? 'bg-green-100 text-green-800' :
                        pedido.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pedido.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
