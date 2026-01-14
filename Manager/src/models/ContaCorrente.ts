
export interface ContaCorrente {
  id?: number;
  bancoId: number;
  clienteId: string;
  agencia: string;
  numeroConta: string;
  nomeAgencia: string;
  nomeCorrentista: string;
  nomeContato: string;
  telefone: string;
  saldo: number;      // saldo será armazenado como número na API
  origem: string;
}

  
