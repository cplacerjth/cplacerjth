import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { db, storage } from '../../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Layout from '../../../components/Layout';
import toast from 'react-hot-toast';

export default function NovoProduto() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [produto, setProduto] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    categoria: '',
    foto: '',
    ativo: true
  });
  const [arquivo, setArquivo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduto(prev => ({ ...prev, [name]: value }));
  };

  const handleArquivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem deve ter no máximo 5MB');
        return;
      }
      setArquivo(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Faça login primeiro');
      router.push('/login');
      return;
    }

    if (!produto.nome || !produto.preco || !produto.estoque) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      let fotoURL = produto.foto;

      if (arquivo) {
        const storageRef = ref(storage, `produtos/${Date.now()}-${arquivo.name}`);
        await uploadBytes(storageRef, arquivo);
        fotoURL = await getDownloadURL(storageRef);
      } else if (!fotoURL) {
        fotoURL = 'https://via.placeholder.com/300x300?text=RJ+Place';
      }

      const produtoData = {
        ...produto,
        preco: parseFloat(produto.preco),
        estoque: parseInt(produto.estoque),
        foto: fotoURL,
        vendedorId: user.uid,
        vendedorNome: userData?.nomeLoja || userData?.nome || 'Vendedor',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'produtos'), produtoData);
      
      toast.success('Produto cadastrado com sucesso!');
      router.push('/painel/produtos');
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      toast.error('Erro ao cadastrar produto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">➕ Novo produto</h1>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nome do produto *</label>
                <input
                  type="text"
                  name="nome"
                  value={produto.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Descrição</label>
                <textarea
                  name="descricao"
                  value={produto.descricao}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Preço (R$) *</label>
                  <input
                    type="number"
                    name="preco"
                    value={produto.preco}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Estoque *</label>
                  <input
                    type="number"
                    name="estoque"
                    value={produto.estoque}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Categoria</label>
                <input
                  type="text"
                  name="categoria"
                  value={produto.categoria}
                  onChange={handleChange}
                  placeholder="Ex: Eletrônicos, Roupas, etc."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Imagem do produto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleArquivo}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Máximo 5MB. Formatos: JPG, PNG, WEBP</p>
              </div>

              {produto.foto && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Imagem atual:</p>
                  <img
                    src={produto.foto}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/128x128?text=Erro';
                    }}
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="ativo"
                  checked={produto.ativo}
                  onChange={(e) => setProduto(prev => ({ ...prev, ativo: e.target.checked }))}
                  className="mr-2"
                />
                <label className="text-gray-700">Produto ativo (visível na loja)</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar produto'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/painel/produtos')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
