import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login realizado com sucesso!');
      router.push('/');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        toast.error('Usuário não encontrado');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Senha incorreta');
      } else {
        toast.error('Erro ao fazer login: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Login com Google realizado!');
      router.push('/');
    } catch (error) {
      toast.error('Erro ao fazer login com Google');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Entrar no RJ Place</h1>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
            >
              Entrar com Google
            </button>
          </div>

          <p className="mt-4 text-center text-gray-600">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-blue-600 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
