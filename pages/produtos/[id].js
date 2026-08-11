import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '../../components/Layout';
import { useCarrinho } from '../../hooks/useCarrinho';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProdutoPage() {
  const router = useRouter();
  const { id } = router.query;
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantidade, setQuantidade] = useState(1);
  const { adicionarAoCarrinho } = useCarrinho();

  useEffect(() => {
    async function carregarProduto() {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'produtos', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          if (data.vendedorId) {
            const vendedorRef = doc(db, 'usuarios', data.vendedorId);
            const vendedorSnap = await getDoc(vendedorRef);
            if (vendedorSnap.exists()) {
              const vendedorData = vendedorSnap.data();
              data.vendedorNome = vendedorData.nomeLoja || vendedorData.nome;
              data.vendedorAprovado = vendedorData.aprovado;
            }
          }
          
          setProduto({ id: docSnap.id, ...data });
        } else {
          toast.error('Produto não encontrado');
          router.push('/');
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        toast.error('Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    }
    
    carregarProduto();
  }, [id, router]);

  const handleAdicionarCarrinho = () => {
    if (!produto) return;
    
    if (produto.estoque <= 0) {
      toast.error('Produto esgotado');
      return;
    }

    adicionarAoCarrinho({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      foto: produto.foto,
      quantidade: quantidade,
      vendedorId: produto.vendedorId,
      vendedorNome: produto.vendedorNome || 'Vendedor',
      estoque: produto.estoque
    });
    
    toast.success(`${produto.nome} adicionado ao carrinho!`);
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

  if (!produto) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Produto não encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={produto.foto || 'https://via.placeholder.com/500x500?text=RJ+Place'}
                alt={produto.nome}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x500?text=RJ+Place';
                }}
              />
            </div>

            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-gray-800">{produto.nome}</h1>
              
              <Link href={`/loja/${produto.vendedorId}`}>
                <span className="text-sm text-blue-600 hover:underline mt-1 cursor-pointer">
                  {produto.vendedorNome || 'Vendedor'}
                </span>
              </Link>

              <p className="text-3xl font-bold text-blue-600 mt-4">
                R$ {produto.preco?.toFixed(2) || '0,00'}
              </p>

              <div className="mt-2">
                {produto.estoque > 0 ? (
                  <span className="text-green-600">✅ {produto.estoque} unidades em estoque</span>
                ) : (
                  <span className="text-red-600">❌ Esgotado</span>
                )}
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-700">Descrição</h3>
                <p className="text-gray-600 mt-1">{produto.descricao || 'Sem descrição'}</p>
              </div>

              {produto.categoria && (
                <div className="mt-2">
                  <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                    {produto.categoria}
                  </span>
                </div>
              )}

              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                    className="px-3 py-2 border-r hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 w-12 text-center">{quantidade}</span>
                  <button
                    onClick={() => setQuantidade(Math.min(produto.estoque, quantidade + 1))}
                    className="px-3 py-2 border-l hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdicionarCarrinho}
                  disabled={produto.estoque <= 0}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {produto.estoque > 0 ? 'Adicionar ao carrinho' : 'Esgotado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
