import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function Cadastro() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'cliente',
    cnpj: '',
    nomeLoja: '',
    descricaoLoja: ''
  });
  const [loading, setLoading] = useState(false);
  const [isVendedor, setIsVendedor] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (isVendedor && !formData.cnpj) {
      toast.error('CNPJ é obrigatório para vendedores');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.senha
      );

      const userData = {
        nome: formData.nome,
        email: formData.email,
        tipo: isVendedor ? 'vendedor' : 'cliente',
        criadoEm: new Date().toISOString(),
        ativo: true
      };

      if (isVendedor) {
        userData.cnpj = formData.cnpj;
        userData.nomeLoja = formData.nomeLoja;
        userData.descricaoLoja = formData.descricaoLoja;
        userData.aprovado = false;
        userData.comissao = 10;
        userData.totalVendas = 0;
        userData.avaliacaoMedia = 0;
        userData.totalAvaliacoes = 0;
      }

      await setDoc(doc(db, 'usuarios', userCredential.user.uid), userData);

      toast.success(
        isVendedor 
          ? 'Cadastro realizado! Aguarde aprovação do admin.' 
          : 'Cadastro realizado com sucesso!'
      );
      
      router.push('/');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este e-mail já está cadastrado');
      } else {
        toast.error('Erro ao cadastrar: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            {isVendedor ? 'Quero vender no RJ Place' : 'Criar conta'}
          </h1>

          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsVendedor(false)}
                className={`px-4 py-2 rounded-lg transition ${
                  !isVendedor ? 'bg-blue-600 text-white' : 'text-gray-600'
                }`}
              >
                Sou cliente
              </button>
              <button
                onClick={() => setIsVendedor(true)}
                className={`px-4 py-2 rounded-lg transition ${
                  isVendedor ? 'bg-blue-600 text-white' : 'text-gray-600'
                }`}
              >
                Quero vender
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-gray-700 mb-2">Nome completo *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-gray-700 mb-2">E-mail *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Senha *</label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Confirmar senha *</label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              {isVendedor && (
                <>
                  <div className="col-span-2">
                    <label className="block text-gray-700 mb-2">CNPJ *</label>
                    <input
                      type="text"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleChange}
                      placeholder="00.000.000/0000-00"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Usado para emissão de nota fiscal</p>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-700 mb-2">Nome da loja *</label>
                    <input
                      type="text"
                      name="nomeLoja"
                      value={formData.nomeLoja}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-700 mb-2">Descrição da loja</label>
                    <textarea
                      name="descricaoLoja"
                      value={formData.descricaoLoja}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Cadastrando...' : isVendedor ? 'Solicitar cadastro como vendedor' : 'Criar conta'}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            Já tem conta?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Faça login
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
