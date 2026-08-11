import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Layout from '../components/Layout';
import ProdutoCard from '../components/ProdutoCard';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const q = query(collection(db, 'produtos'), where('ativo', '==', true));
        const querySnapshot = await getDocs(q);
        const lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setProdutos(lista);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    }
    carregarProdutos();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🛍️ RJ Place
        </h1>
        
        {/* Banner promocional */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold">Bem-vindo ao RJ Place!</h2>
          <p className="mt-2">O marketplace onde você encontra de tudo</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : produtos.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Nenhum produto disponível no momento</p>
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
