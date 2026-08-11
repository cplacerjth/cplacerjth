import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import Layout from '../../../components/Layout';
import toast from 'react-hot-toast';

export default function AdminVendedores() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      router.push('/painel');
      return;
    }

    async function carregarVendedores() {
      try {
        const q = query(collection(db, 'usuarios'), where('tipo', '==', 'vendedor'));
        const querySnapshot = await getDocs(q);
        const lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setVendedores(lista);
      } catch (error) {
        console.error('Erro ao carregar vendedores:', error);
        toast.error('Erro ao carregar vendedores');
      } finally {
        setLoading(false);
      }
    }

    carregarVendedores();
  }, [user, isAdmin, router]);

  const handleAprovar = async (id, aprovado) => {
    try {
      await updateDoc(doc(db, 'usuarios', id), {
        aprovado: aprovado
      });
      
      setVendedores(prev => 
        prev.map(v => 
          v.id === id ? { ...v, aprovado: aprovado } : v
        )
      );
      
      toast.success(`Vendedor ${aprovado ? 'aprovado' : 'reprovado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar vendedor:', error);
      toast.error('Erro ao atualizar vendedor');
    }
  };

  const handleToggleAdmin = async (id, isAdminUser) => {
    try {
      const novoTipo = isAdminUser ? 'vendedor' : 'admin';
      await updateDoc(doc(db, 'usuarios', id), {
        tipo: novoTipo
      });
      
      setVendedores(prev => 
        prev.map(v => 
          v.id === id ? { ...v, tipo: novoTipo } : v
        )
      );
      
      toast.success(`Usuário agora é ${novoTipo === 'admin' ? 'Administrador' : 'Vendedor'}`);
    } catch (error) {
      console.error('Erro ao alterar permissão:', error);
      toast.error('Erro ao alterar permissão');
    }
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
        <h1 className="text-2xl font-bold mb-6">👥 Gerenciar Vendedores</h1>

        {vendedores.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">Nenhum vendedor cadastrado ainda</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loja</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendedores.map((vendedor) => (
                  <tr key={vendedor.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{vendedor.nome || 'Sem nome'}</p>
                        <p className="text-sm text-gray-500">{vendedor.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{vendedor.nomeLoja || 'Sem nome da loja'}</td>
                    <td className="px-6 py-4">{vendedor.cnpj || 'Não informado'}</td>
                    <td className="px-6 py-4">
                      {vendedor.aprovado === false ? (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Aguardando</span>
                      ) : vendedor.aprovado === true ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Aprovado</span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Pendente</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        vendedor.tipo === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {vendedor.tipo === 'admin' ? '👑 Admin' : 'Vendedor'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {vendedor.aprovado !== true && (
                          <button
                            onClick={() => handleAprovar(vendedor.id, true)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Aprovar
                          </button>
                        )}
                        {vendedor.aprovado !== false && vendedor.aprovado !== undefined && (
                          <button
                            onClick={() => handleAprovar(vendedor.id, false)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Reprovar
                          </button>
                        )}
                        {vendedor.id !== user.uid && (
                          <button
                            onClick={() => handleToggleAdmin(vendedor.id, vendedor.tipo === 'admin')}
                            className={`px-3 py-1 rounded text-sm ${
                              vendedor.tipo === 'admin' 
                                ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                          >
                            {vendedor.tipo === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                          </button>
                        )}
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
