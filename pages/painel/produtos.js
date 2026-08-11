import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Layout from '../../components/Layout';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MeusProdutos() {
  const router = useRouter();
  const { user, isVendedor, isAdmin } = useAuth();
  const [produtos, setProdutos] = useState([]);
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

    async function carregarProdutos() {
      try {
        const q = isAdmin
          ? query(collection(db, 'produtos'))
          : query(collection(db, 'produtos'), where('vendedorId', '==', user.uid));
        
        const querySnapshot = await getDocs(q);
        const lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setProdutos(lista);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        toast.error('Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    }

    carregarProdutos();
  }, [user, isVendedor, isAdmin, router]);

  const handleDeletar = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      await deleteDoc(doc(db, 'produtos', id));
      setProdutos(prev => prev.filter(p => p.id !== id));
      toast.success('Produto deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar produto');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📦 Meus Produtos</h1>
          <Link href="/painel/produtos/novo">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              + Novo produto
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : produtos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">Você ainda não tem produtos cadastrados</p>
            <Link href="/painel/produtos/novo">
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Cadastrar primeiro produto
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {produtos.map((produto) => (
                  <tr key={produto.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={produto.foto || 'https://via.placeholder.com/40x40?text=RJ'}
                          alt={produto.nome}
                          className="w-10 h-10 object-cover rounded-lg mr-3"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40x40?text=RJ';
                          }}
                        />
                        <div>
                          <p className="font-medium">{produto.nome}</p>
                          {isAdmin && (
                            <p className="text-xs text-gray-500">
                              Vendedor: {produto.vendedorNome || 'Desconhecido'}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">R$ {produto.preco?.toFixed(2) || '0,00'}</td>
                    <td className="px-6 py-4">{produto.estoque || 0}</td>
                    <td className="px-6 py-4">
                      {produto.ativo !== false ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Ativo</span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Inativo</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link href={`/painel/produtos/editar/${produto.id}`}>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                        </Link>
                        <button
                          onClick={() => handleDeletar(produto.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Deletar
                        </button>
                      </div>
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
