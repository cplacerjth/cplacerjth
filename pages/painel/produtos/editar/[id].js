import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { db, storage } from '../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Layout from '../../../components/Layout';
import toast from 'react-hot-toast';

export default function EditarProduto() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [produto, setProduto] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    categoria: '',
    foto: '',
    ativo: true,
    vendedorId: ''
  });
  const [arquivo, setArquivo] = useState(null);

  useEffect(() => {
    async function carregarProduto() {
      if (!id || !user) return;

      try {
        const docRef = doc(db, 'produtos', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Verificar se o produto pertence ao vendedor ou se é admin
          if (data.vendedorId !== user.uid && !isAdmin) {
            toast.error('Você não tem permissão para editar este produto');
            router.push('/painel/produtos');
            return;
          }
          
          setProduto({ id: docSnap.id, ...data });
        } else {
          toast.error('Produto não encontrado');
          router.push('/painel/produtos');
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        toast.error('Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    }

    carregarProduto();
  }, [id, user, isAdmin, router]);

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
    setSaving(true);

    try {
      let fotoURL = produto.foto;

      // Se tiver novo arquivo, fazer upload e deletar a antiga
      if (arquivo) {
        // Deletar foto antiga se não for a padrão
        if (produto.foto && !produto.foto.includes('placeholder')) {
          try {
            const oldRef = ref(storage, produto.foto);
            await deleteObject(oldRef);
          } catch (error) {
            console.log('Erro ao deletar foto antiga:', error);
          }
        }
        
        const storageRef = ref(storage, `produtos/${Date.now()}-${arquivo.name}`);
        await uploadBytes(storageRef, arquivo);
        fotoURL = await getDownloadURL(storageRef);
      }

      const produtoData = {
        nome: produto.nome,
        descricao: produto.descricao,
        preco: parseFloat(produto.preco),
        estoque: parseInt(produto.estoque),
        categoria: produto.categoria,
        foto: fotoURL,
        ativo: produto.ativo,
        atualizadoEm: new Date().toISOString()
      };

      await updateDoc(doc(db, 'produtos', id), produtoData);
      
      toast.success('Produto atualizado com sucesso!');
      router.push('/painel/produtos');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar produto: ' + error.message);
    } finally {
      setSaving(false);
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">✏️ Editar produto</h1>

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
                <p className="text-xs text-gray-500 mt-1">Máximo 5MB. Deixe em branco para manter a imagem atual.</p>
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
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar alterações'}
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
