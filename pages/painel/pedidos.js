import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function PainelPedidos() {
  const router = useRouter();
  const { user, isVendedor, isAdmin } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!isVendedor && !isAdmin) {
      router.push('/');
      return;
    }

    async function carregarPedidos() {
      try {
        const pedidosSnap = await getDocs(collection(db, 'pedidos'));
        const lista = [];
        
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
            lista.push({ id: doc.id, ...data });
          }
        });

        lista.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
        setPedidos(lista);
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarPedidos();
  }, [user, isVendedor, isAdmin, router]);

  const statusMap = {
    'Pendente': '🟡 Pendente',
    'Pago': '🟢 Pago',
    'Preparando': '🟠 Preparando',
    'Enviado': '📦 Enviado',
    'Entregue': '✅ Entregue',
    'Cancelado': '❌ Cancelado'
  };

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
        <h1 className="text-2xl font-bold mb-6">📋 Pedidos</h1>

        {pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">Nenhum pedido ainda</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/pedidos/${pedido.id}`)}>
                    <td className="px-6 py-4 font-mono text-sm">#{pedido.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">{pedido.clienteEmail || 'Cliente'}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">R$ {pedido.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        pedido.status === 'Entregue' ? 'bg-green-100 text-green-800' :
                        pedido.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {statusMap[pedido.status] || pedido.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(pedido.criadoEm).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
