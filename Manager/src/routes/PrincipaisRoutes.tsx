// src/routes/PrincipaisRoutes.tsx
import { Routes, Route } from "react-router-dom";
import PrincipaisLayout from "../layouts/MainLayout";
import FormCompositionPage from "../pages/compositions/FormCompositionPage";



function PrincipaisRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<PrincipaisLayout />}></Route>
      <Route path="/referenciais" element={<PrincipaisLayout />}>      
        <Route index element={<div>Bem-vindo aos Cadastros Principais</div>} />        
        <Route path="clientes" element={<div>Cadastro de Clientes</div>} />      
        <Route path="contas-correntes" element={<div>Contas Correntes</div>} />    
        <Route path="fornecedores" element={<div>Fornecedores</div>} />
        <Route path="produtos-categorias" element={<div>Categoria de Produtos </div>} />       
        <Route path="produtos" element={<div>Cadastro de Produtos </div>} /> 
        
        <Route path="empresas" element={<div>Empresas</div>} />
        <Route path="serviçoes" element={<div>Serviços</div>} />        
        <Route path="trasportadores" element={<div>Transpoertadores</div>} />        
        <Route path="colaboradores" element={<div>Colaboradores</div>} />
        <Route path="materias-prima" element={<div>Matéria Prima</div>} />
        <Route path="modulos" element={<div>Módulos</div>} />        
        <Route path="compositions" element={<FormCompositionPage />} />
        <Route path="*" element={<div>Rota não encontrada</div>} />
      </Route>
    </Routes>
  );
}


export default PrincipaisRoutes;
