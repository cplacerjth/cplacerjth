import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';

export default function PedidoPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarPedido() {
      if (!id || !user) return;

      try {
        const docRef = doc(db, 'pedidos', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.clienteId !== user.uid) {
            router.push('/');
            return;
          }
          setPedido({ id: docSnap.id, ...data });
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Erro ao carregar pedido:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarPedido();
  }, [id, user, router]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!pedido) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Pedido não encontrado</p>
        </div>
      </Layout>
    );
  }

  const statusMap = {
    'Pendente': '🟡 Pendente',
    'Pago': '🟢 Pago',
    'Preparando': '🟠 Preparando',
    'Enviado': '📦 Enviado',
    'Entregue': '✅ Entregue',
    'Cancelado': '❌ Cancelado'
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">📋 Pedido #{pedido.id.slice(0, 8)}</h1>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="font-semibold">Status: </span>
            <span className="text-lg">
              {statusMap[pedido.status] || pedido.status}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2">Itens</h2>
            <div className="space-y-2">
              {pedido.itens.map((item, index) => (
                <div key={index} className="flex justify-between border-b py-2">
                  <div>
                    <span>{item.quantidade}x {item.nome}</span>
                    <span className="text-xs text-gray-500 block">
                      Vendedor: {item.vendedorNome || 'Vendedor'}
                    </span>
                  </div>
                  <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>R$ {pedido.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-bold">Endereço de entrega</h3>
            <p className="text-gray-600">
              {pedido.entrega.endereco}, {pedido.entrega.numero}
              {pedido.entrega.complemento && `, ${pedido.entrega.complemento}`}
            </p>
            <p className="text-gray-600">
              {pedido.entrega.bairro} - {pedido.entrega.cidade}/{pedido.entrega.estado}
            </p>
            <p className="text-gray-600">CEP: {pedido.entrega.cep}</p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="mt-6 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Voltar às compras
          </button>
        </div>
      </div>
    </Layout>
  );
}
