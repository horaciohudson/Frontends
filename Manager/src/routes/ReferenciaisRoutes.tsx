// src/routes/ReferenciaisRoutes.tsx
import { Routes, Route } from "react-router-dom";
import ReferenciaisLayout from "../layouts/ReferenceLayout";
import TaxSituationPage from "../pages/taxSituations/TaxSituationPage";
import FormSize from "../pages/sizes/FormSize";

function ReferenciaisRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<ReferenciaisLayout />}></Route>
      <Route path="/referenciais" element={<ReferenciaisLayout />}>
        <Route index element={<div>Bem-vindo aos Cadastros Referenciais</div>} />
        <Route path="grupos" element={<div>Grupos de Produtos</div>} />      
        <Route path="pracas" element={<div>Praca de Clientes</div>} />    
        <Route path="codigos-fiscais" element={<div>Códigos Fiscais</div>} />
        <Route path="tax-situations" element={<TaxSituationPage />} />
        <Route path="tamanhos" element={<FormSize />} />
        <Route path="formas-pagamento" element={<div>Forma de Pagamento</div>} />
        <Route path="historicos" element={<div>Históricos</div>} />
        <Route path="observacoes" element={<div>Observações</div>} />        
        <Route path="bancos" element={<div>Bancos</div>} />        
        <Route path="operacoes-bancarias" element={<div>Operações Bancárias</div>} />
        <Route path="planos-contas" element={<div>Plano de Contas</div>} />
        <Route path="tipos-atividades" element={<div>Tipo de Atividades</div>} />        
        <Route path="tipos-moedas" element={<div>Tipo de Moedas</div>} />
        <Route path="*" element={<div>Rota não encontrada</div>} />
      </Route>
    </Routes>
  );
}


export default ReferenciaisRoutes;
