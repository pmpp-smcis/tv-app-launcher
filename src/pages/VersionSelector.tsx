import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Zap, Cpu } from "lucide-react";

const VersionSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-2">Loja de Apps</h1>
        <p className="text-muted-foreground text-center mb-12">
          Escolha a versão que deseja usar
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Versão Realista */}
          <Card className="p-6 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Realista</h2>
                <span className="text-sm text-green-500">Recomendado</span>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Versão simples e funcional. Baixa e instala apps do seu JSON.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span>Listar apps do JSON</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span>Baixar e instalar APKs</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span>Navegação por setas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>✗</span>
                <span>Verificação de instalados</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate("/")}
              className="w-full"
              size="lg"
            >
              Usar Versão Realista
            </Button>
          </Card>

          {/* Versão Complexa */}
          <Card className="p-6 hover:border-purple-500 transition-colors border-2 border-purple-500/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Cpu className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Complexa</h2>
                <span className="text-sm text-purple-500">Avançado</span>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Versão com plugin nativo. Verifica apps realmente instalados no sistema.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span>Tudo da versão Realista</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-purple-500">✓</span>
                <span>Verificação real de instalados</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-purple-500">✓</span>
                <span>Status visual de instalação</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-amber-500">
                <span>⚠</span>
                <span>Requer setup nativo (veja docs)</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate("/complex")}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              Usar Versão Complexa
            </Button>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 <strong>Dica:</strong> Para a versão Complexa funcionar, você precisa adicionar código nativo Android.
            <br />
            Veja o arquivo <code className="bg-muted px-2 py-1 rounded">NATIVE_PLUGIN_SETUP.md</code> para instruções.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VersionSelector;
