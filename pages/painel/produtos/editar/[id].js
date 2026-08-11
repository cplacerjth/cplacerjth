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
