import Link from 'next/link';

export default function ProdutoCard({ produto }) {
  const imagemPadrao = 'https://via.placeholder.com/300x300?text=RJ+Place';

  return (
    <Link href={`/produtos/${produto.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        <div className="aspect-square bg-gray-100">
          <img
            src={produto.foto || imagemPadrao}
            alt={produto.nome}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = imagemPadrao;
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 line-clamp-2">{produto.nome}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {produto.vendedorNome || 'Vendedor'}
          </p>
          <p className="text-xl font-bold text-blue-600 mt-2">
            R$ {produto.preco?.toFixed(2) || '0,00'}
          </p>
          {produto.estoque > 0 ? (
            <span className="text-xs text-green-600">✅ Em estoque</span>
          ) : (
            <span className="text-xs text-red-600">❌ Esgotado</span>
          )}
        </div>
      </div>
    </Link>
  );
}
