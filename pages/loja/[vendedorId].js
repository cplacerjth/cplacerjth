import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Layout from '../../components/Layout';
import ProdutoCard from '../../components/ProdutoCard';

export default function LojaPage() {
  const router = useRouter();
  const { vendedorId } = router.query;
  const [vendedor, setVendedor] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarLoja() {
      if (!vendedorId) return;

      try {
        // Buscar dados do vendedor
        const vendedorRef = doc(db, 'usuarios', vendedorId);
        const vendedorSnap = await getDoc(vendedorRef);
        
        if (vendedorSnap.exists()) {
          const data = vendedorSnap.data();
          if (data.tipo !== 'vendedor' || data.aprovado !== true) {
            router.push('/');
            return;
          }
          setVendedor({ id: vendedorSnap.id, ...data });
        } else {
          router.push('/');
          return;
        }

        // Buscar produtos do vendedor
        const q = query(
          collection(db, 'produtos'), 
          where('vendedorId', '==', vendedorId),
          where('ativo', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setProdutos(lista);
      } catch (error) {
        console.error('Erro ao carregar loja:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarLoja();
  }, [vendedorId, router]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!vendedor) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Loja não encontrada</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
              🏪
            </div>
            <div>
              <h1 className="text-2xl font-bold">{vendedor.nomeLoja || vendedor.nome}</h1>
              <p className="text-gray-600">{vendedor.descricaoLoja || 'Loja no RJ Place'}</p>
              <p className="text-sm text-gray-500 mt-1">
                ⭐ {vendedor.avaliacaoMedia?.toFixed(1) || '0'} / 5 
                ({vendedor.totalAvaliacoes || 0} avaliações)
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">📦 Produtos desta loja</h2>

        {produtos.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Esta loja ainda não tem produtos</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {produtos.map((produto) => (
              <ProdutoCard key={produto.id} produto={produto} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
