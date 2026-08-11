import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { db, storage } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

export default function PerfilLoja() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perfil, setPerfil] = useState({
    nomeLoja: '',
    descricaoLoja: '',
    logo: '',
    whatsapp: '',
    instagram: ''
  });
  const [arquivo, setArquivo] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    async function carregarPerfil() {
      try {
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPerfil({
            nomeLoja: data.nomeLoja || '',
            descricaoLoja: data.descricaoLoja || '',
            logo: data.logo || '',
            whatsapp: data.whatsapp || '',
            instagram: data.instagram || ''
          });
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast.error('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    }

    carregarPerfil();
  }, [user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfil(prev => ({ ...prev, [name]: value }));
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
      let logoURL = perfil.logo;

      if (arquivo) {
        if (perfil.logo && !perfil.logo.includes('placeholder')) {
          try {
            const oldRef = ref(storage, perfil.logo);
            await deleteObject(oldRef);
          } catch (error) {
            console.log('Erro ao deletar logo antiga:', error);
          }
        }
        
        const storageRef = ref(storage, `logos/${user.uid}-${Date.now()}`);
        await uploadBytes(storageRef, arquivo);
        logoURL = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, 'usuarios', user.uid), {
        nomeLoja: perfil.nomeLoja,
        descricaoLoja: perfil.descricaoLoja,
        logo: logoURL,
        whatsapp: perfil.whatsapp,
        instagram: perfil.instagram
      });

      toast.success('Perfil atualizado com sucesso!');
      router.push('/painel');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
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
          <h1 className="text-2xl font-bold mb-6">⚙️ Perfil da Loja</h1>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nome da loja *</label>
                <input
                  type="text"
                  name="nomeLoja"
                  value={perfil.nomeLoja}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Descrição da loja</label>
                <textarea
                  name="descricaoLoja"
                  value={perfil.descricaoLoja}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Logo da loja</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleArquivo}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Máximo 5MB. Deixe em branco para manter a logo atual.</p>
              </div>

              {perfil.logo && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Logo atual:</p>
                  <img
                    src={perfil.logo}
                    alt="Logo"
                    className="w-24 h-24 object-cover rounded-full border"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/96x96?text=Erro';
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-2">WhatsApp (com DDD)</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={perfil.whatsapp}
                  onChange={handleChange}
                  placeholder="(21) 99999-9999"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Instagram</label>
                <input
                  type="text"
                  name="instagram"
                  value={perfil.instagram}
                  onChange={handleChange}
                  placeholder="@minhaloja"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                />
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
                  onClick={() => router.push('/painel')}
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
