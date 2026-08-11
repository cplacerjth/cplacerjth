import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const payment = new Payment(client);

export async function criarPagamento(dados) {
  try {
    const result = await payment.create({
      body: {
        transaction_amount: dados.valorTotal,
        description: `Pedido RJ Place - ${dados.pedidoId}`,
        payment_method_id: dados.metodoPagamento,
        payer: {
          email: dados.emailCliente,
          identification: {
            type: dados.tipoDocumento || 'CPF',
            number: dados.documento
          }
        },
        metadata: {
          pedidoId: dados.pedidoId,
          vendedorId: dados.vendedorId,
          comissao: dados.comissao
        }
      }
    });
    return result;
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    throw error;
  }
}
