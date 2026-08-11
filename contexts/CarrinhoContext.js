import { createContext, useState, useEffect } from 'react';

export const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalItens, setTotalItens] = useState(0);

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('rjplace_carrinho');
    if (carrinhoSalvo) {
      try {
        const parsed = JSON.parse(carrinhoSalvo);
        setItens(parsed);
      } catch (e) {
        console.error('Erro ao carregar carrinho:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rjplace_carrinho', JSON.stringify(itens));
    
    let totalValor = 0;
    let totalQuantidade = 0;
    itens.forEach(item => {
      totalValor += item.preco * item.quantidade;
      totalQuantidade += item.quantidade;
    });
    
    setTotal(totalValor);
    setTotalItens(totalQuantidade);
  }, [itens]);

  const adicionarAoCarrinho = (produto) => {
    setItens(prev => {
      const existe = prev.find(item => item.id === produto.id);
      if (existe) {
        return prev.map(item => 
          item.id === produto.id 
            ? { ...item, quantidade: item.quantidade + produto.quantidade }
            : item
        );
      }
      return [...prev, { ...produto }];
    });
  };

  const removerDoCarrinho = (id) => {
    setItens(prev => prev.filter(item => item.id !== id));
  };

  const atualizarQuantidade = (id, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(id);
      return;
    }
    setItens(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantidade: novaQuantidade } : item
      )
    );
  };

  const limparCarrinho = () => {
    setItens([]);
    localStorage.removeItem('rjplace_carrinho');
  };

  return (
    <CarrinhoContext.Provider value={{
      itens,
      total,
      totalItens,
      adicionarAoCarrinho,
      removerDoCarrinho,
      atualizarQuantidade,
      limparCarrinho
    }}>
      {children}
    </CarrinhoContext.Provider>
  );
}
