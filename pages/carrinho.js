import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useCarrinho } from '../hooks/useCarrinho';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Carrinho() {
  const router = useRouter();
  const { itens, total, totalItens, atualizarQuantidade, removerDoCarrinho } = useCarrinho();

  const handleFinalizarCompra = () => {
    if (itens.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }
    router.push('/checkout');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">🛒 Seu Carrinho</h1>

        {itens.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">Seu carrinho está vazio</p>
            <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Continuar comprando
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {itens.map((item) => (
                  <div key={item.id} className="flex p-4 border-b last:border-b-0">
                    <img
                      src={item.foto || 'https://via.placeholder.com/100x100?text=RJ'}
                      alt={item.nome}
                      className="w-24 h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=RJ';
                      }}
                    />
                    
                    <div className="flex-1 ml-4">
                      <h3 className="font-semibold text-gray-800">{item.nome}</h3>
                      <p className="text-sm text-gray-500">{item.vendedorNome || 'Vendedor'}</p>
                      <p className="text-blue-600 font-bold mt-1">
                        R$ {item.preco?.toFixed(2) || '0,00'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removerDoCarrinho(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>

                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                          className="px-2 py-1 border-r hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 w-8 text-center">{item.quantidade}</span>
                        <button
                          onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                          className="px-2 py-1 border-l hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 h-fit">
              <h2 className="text-lg font-bold mb-4">Resumo do pedido</h2>
              
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItens} itens)</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span className="text-green-600">Grátis</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleFinalizarCompra}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Finalizar compra
              </button>

              <Link href="/" className="block text-center text-sm text-gray-500 mt-3 hover:underline">
                Continuar comprando
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
