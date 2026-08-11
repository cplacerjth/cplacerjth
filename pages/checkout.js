import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useCarrinho } from '../hooks/useCarrinho';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const { itens, total, limparCarrinho } = useCarrinho();
  const [loading, setLoading] = useState(false);
  const [dadosEntrega, setDadosEntrega] = useState({
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDadosEntrega(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalizarPedido = async () => {
    if (!user) {
      toast.error('Faça login para finalizar a compra');
      router.push('/login');
      return;
    }

    for (let campo in dadosEntrega) {
      if (!dadosEntrega[campo] && campo !== 'complemento') {
        toast.error('Preencha todos os campos de endereço');
        return;
      }
    }

    setLoading(true);

    try {
      const pedidoData = {
        clienteId: user.uid,
        clienteEmail: user.email,
        itens: itens.map(item => ({
          produtoId: item.id,
          nome: item.nome,
          preco: item.preco,
          quantidade: item.quantidade,
          vendedorId: item.vendedorId,
          vendedorNome: item.vendedorNome || 'Vendedor'
        })),
        total: total,
        entrega: dadosEntrega,
        status: 'Pendente',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        pagamento: {
          metodo: 'Pendente',
          status: 'Aguardando'
        }
      };

      const docRef = await addDoc(collection(db, 'pedidos'), pedidoData);

      for (let item of itens) {
        const produtoRef = doc(db, 'produtos', item.id);
        await updateDoc(produtoRef, {
          estoque: increment(-item.quantidade)
        });
      }

      limparCarrinho();

      toast.success('Pedido realizado com sucesso!');
      router.push(`/pedidos/${docRef.id}`);
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">📦 Finalizar compra</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Endereço de entrega</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 text-sm mb-1">CEP *</label>
                <input
                  type="text"
                  name="cep"
                  value={dadosEntrega.cep}
                  onChange={handleChange}
                  placeholder="00000-000"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm mb-1">Endereço *</label>
                <input
                  type="text"
                  name="endereco"
                  value={dadosEntrega.endereco}
                  onChange={handleChange}
                  placeholder="Rua, Avenida..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Número *</label>
                  <input
                    type="text"
                    name="numero"
                    value={dadosEntrega.numero}
                    onChange={handleChange}
                    placeholder="123"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Complemento</label>
                  <input
                    type="text"
                    name="complemento"
                    value={dadosEntrega.complemento}
                    onChange={handleChange}
                    placeholder="Apto, bloco..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm mb-1">Bairro *</label>
                <input
                  type="text"
                  name="bairro"
                  value={dadosEntrega.bairro}
                  onChange={handleChange}
                  placeholder="Centro"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Cidade *</label>
                  <input
                    type="text"
                    name="cidade"
                    value={dadosEntrega.cidade}
                    onChange={handleChange}
                    placeholder="Rio de Janeiro"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Estado *</label>
                  <input
                    type="text"
                    name="estado"
                    value={dadosEntrega.estado}
                    onChange={handleChange}
                    placeholder="RJ"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-lg font-bold mb-4">Resumo do pedido</h2>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {itens.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantidade}x {item.nome}
                    <span className="text-xs text-gray-500 block">{item.vendedorNome || 'Vendedor'}</span>
                  </span>
                  <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Frete</span>
                <span>Grátis</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleFinalizarPedido}
              disabled={loading || itens.length === 0}
              className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Finalizar pedido'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              🔒 Sua compra é 100% segura
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
