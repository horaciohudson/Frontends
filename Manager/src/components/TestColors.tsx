import { useEffect, useState } from "react";
import { ColorService } from "../service/Color";
import { Color } from "../models/Color";

export default function TestColors() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testStep, setTestStep] = useState<string>("Iniciando...");

  useEffect(() => {
    const testColors = async () => {
      try {
        console.log("🧪 TESTE: Iniciando teste de cores...");
        setLoading(true);
        setError(null);
        setTestStep("Iniciando teste...");
        
        // Primeiro, testar os dados mock diretamente
        console.log("🧪 TESTE: Testando dados mock...");
        setTestStep("Testando dados mock...");
        
        const mockColors = [
          { id: 1, name: "Branco", hexCode: "#FFFFFF", active: true, displayOrder: 1, sizeId: null },
          { id: 2, name: "Preto", hexCode: "#000000", active: true, displayOrder: 2, sizeId: null },
          { id: 3, name: "Azul", hexCode: "#0066CC", active: true, displayOrder: 3, sizeId: null }
        ];
        
        console.log("🧪 TESTE: Mock direto funcionando:", mockColors);
        setTestStep("Mock direto OK. Testando ColorService...");
        
        // Agora testar o ColorService
        console.log("🧪 TESTE: Chamando ColorService.getGlobalColors()...");
        const globalColors = await ColorService.getGlobalColors();
        
        console.log("🧪 TESTE: Resultado ColorService:", globalColors);
        console.log("🧪 TESTE: Quantidade de cores:", globalColors.length);
        console.log("🧪 TESTE: Tipo do resultado:", typeof globalColors);
        console.log("🧪 TESTE: É array?", Array.isArray(globalColors));
        
        setColors(globalColors);
        setTestStep(`ColorService retornou ${globalColors.length} cores`);
        
      } catch (err: any) {
        console.error("🧪 TESTE: Erro:", err);
        console.error("🧪 TESTE: Stack:", err.stack);
        setError(err.message);
        setTestStep(`Erro: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    testColors();
  }, []);

  if (loading) {
    return <div>🔄 Carregando cores...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>❌ Erro: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>🧪 Teste de Cores ({colors.length} cores encontradas)</h3>
      
      {colors.length === 0 ? (
        <p style={{ color: 'orange' }}>⚠️ Nenhuma cor encontrada</p>
      ) : (
        <div>
          <p style={{ color: 'green' }}>✅ Cores carregadas com sucesso!</p>
          <ul>
            {colors.map((color) => (
              <li key={color.id} style={{ color: color.hexCode }}>
                {color.name} ({color.hexCode}) - ID: {color.id}
              </li>
            ))}
          </ul>
          
          <h4>Combobox de Teste:</h4>
          <select>
            <option value="">Selecione uma cor...</option>
            {colors.map((color) => (
              <option key={color.id} value={color.id}>
                {color.name} {color.sizeId ? '(específica)' : '(global)'}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}