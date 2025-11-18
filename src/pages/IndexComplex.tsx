import { useState, useEffect, useCallback } from "react";
import { AppCardComplex } from "@/components/AppCardComplex";
import { AppItem } from "@/types/app";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { FileOpener } from '@capacitor-community/file-opener';
import { App as CapacitorApp } from '@capacitor/app';
import AppInstallChecker from '@/plugins/AppInstallChecker';
import { Button } from "@/components/ui/button";

// Configure your JSON URL here
const APPS_JSON_URL = "https://raw.githubusercontent.com/pmpp-smcis/apoio/refs/heads/main/apps.json";
const LOCAL_FALLBACK_JSON = "/apps-example.json";

const IndexComplex = () => {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [installedApps, setInstalledApps] = useState<Record<string, boolean>>({});
  const [isCheckingApps, setIsCheckingApps] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApps();
  }, []);

  // Check installed apps after loading the list
  useEffect(() => {
    if (apps.length > 0 && Capacitor.isNativePlatform()) {
      checkInstalledApps();
    }
  }, [apps]);

  // Back button handler
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let backPressCount = 0;
    let backPressTimer: NodeJS.Timeout;

    const setupBackHandler = async () => {
      const backHandler = await CapacitorApp.addListener('backButton', () => {
        backPressCount++;

        if (backPressCount === 1) {
          toast({
            title: "Pressione novamente para sair",
            duration: 2000,
          });

          backPressTimer = setTimeout(() => {
            backPressCount = 0;
          }, 2000);
        } else if (backPressCount === 2) {
          clearTimeout(backPressTimer);
          CapacitorApp.exitApp();
        }
      });

      return () => {
        backHandler.remove();
      };
    };

    let cleanup: (() => void) | undefined;
    setupBackHandler().then(fn => { cleanup = fn; });

    return () => {
      if (cleanup) cleanup();
    };
  }, [toast]);

  const checkInstalledApps = async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('⚠️ Checagem de apps só funciona no Android');
      return;
    }

    try {
      setIsCheckingApps(true);
      console.log('🔍 Verificando apps instalados...');

      const packageNames = apps.map(app => app.packageName);
      
      // Usar o plugin nativo para verificar
      const result = await AppInstallChecker.checkMultipleApps({ packageNames });
      
      console.log('✅ Apps verificados:', result.results);
      setInstalledApps(result.results);

      const installedCount = Object.values(result.results).filter(Boolean).length;
      if (installedCount > 0) {
        toast({
          title: "Apps verificados",
          description: `${installedCount} app(s) já instalado(s)`,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao verificar apps:', error);
      
      // Fallback: verificar localStorage
      console.log('⚠️ Usando fallback (localStorage)');
      const fallbackInstalled: Record<string, boolean> = {};
      apps.forEach(app => {
        fallbackInstalled[app.packageName] = false;
      });
      setInstalledApps(fallbackInstalled);
      
      toast({
        title: "Plugin nativo não disponível",
        description: "Siga as instruções em NATIVE_PLUGIN_SETUP.md para ativar a checagem real",
        duration: 5000,
      });
    } finally {
      setIsCheckingApps(false);
    }
  };

  const fetchApps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔵 Buscando apps de:', APPS_JSON_URL);
      
      if (Capacitor.isNativePlatform()) {
        const response = await CapacitorHttp.get({
          url: APPS_JSON_URL,
          responseType: 'json',
          connectTimeout: 10000,
          readTimeout: 10000,
        });
        
        console.log('🔵 Response status:', response.status);
        
        if (response.status === 200) {
          const data = response.data;
          console.log('🔵 Apps carregados:', data.apps?.length || 0);
          setApps(data.apps || []);
          return;
        }
        
        throw new Error(`HTTP ${response.status}`);
      } else {
        const response = await fetch(APPS_JSON_URL);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setApps(data.apps || []);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar apps:', err);
      
      try {
        console.log('🔵 Tentando fallback local...');
        const fallbackResponse = await fetch(LOCAL_FALLBACK_JSON);
        
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          setApps(data.apps || []);
          toast({
            title: "Modo Offline",
            description: "Usando lista de apps local",
          });
          return;
        }
      } catch (fallbackErr) {
        console.error('❌ Fallback também falhou:', fallbackErr);
      }
      
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao carregar apps",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = useCallback(async (app: AppItem) => {
    if (!Capacitor.isNativePlatform()) {
      window.open(app.apkUrl, "_blank");
      return;
    }

    try {
      console.log('🔵 Iniciando instalação:', app.name);
      
      toast({
        title: "Baixando...",
        description: `Iniciando download de ${app.name}`,
      });

      const response = await CapacitorHttp.get({
        url: app.apkUrl,
        responseType: 'blob',
        connectTimeout: 60000,
        readTimeout: 60000,
      });
      
      if (response.status !== 200) {
        throw new Error(`Erro HTTP ${response.status}`);
      }
      
      const base64 = response.data;
      const fileName = `${app.packageName}.apk`;
      
      try {
        await Filesystem.mkdir({
          path: 'Download',
          directory: Directory.ExternalStorage,
          recursive: true
        });
      } catch (e) {
        console.log('🔵 Diretório Download já existe');
      }
      
      const result = await Filesystem.writeFile({
        path: `Download/${fileName}`,
        data: base64,
        directory: Directory.ExternalStorage,
        recursive: true
      });

      toast({
        title: "Download concluído",
        description: "Abrindo instalador...",
      });
      
      await FileOpener.open({
        filePath: result.uri,
        contentType: 'application/vnd.android.package-archive',
      });
      
      toast({
        title: "Instalador aberto",
        description: `Complete a instalação de ${app.name}`,
      });

      // Aguardar e verificar novamente
      setTimeout(() => {
        checkInstalledApps();
      }, 5000);
      
    } catch (error) {
      console.error('❌ Erro na instalação:', error);
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao baixar/instalar o app",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (apps.length === 0) return;
      
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, apps.length - 1));
          break;
          
        case "ArrowLeft":
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
          
        case "ArrowDown":
          e.preventDefault();
          const cols = Math.floor(window.innerWidth / 320);
          setFocusedIndex((prev) => Math.min(prev + cols, apps.length - 1));
          break;
          
        case "ArrowUp":
          e.preventDefault();
          const colsUp = Math.floor(window.innerWidth / 320);
          setFocusedIndex((prev) => Math.max(prev - colsUp, 0));
          break;
          
        case "Enter":
          e.preventDefault();
          if (apps[focusedIndex]) {
            handleInstall(apps[focusedIndex]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [apps, focusedIndex, handleInstall]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-lg">Carregando apps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-foreground">Erro ao Carregar</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Nenhum app disponível</h2>
          <p className="text-muted-foreground">Adicione apps ao seu arquivo JSON</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-5xl font-bold text-foreground">
            Loja de Apps
          </h1>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold">
            COMPLEXA
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-4">
          Com verificação real de apps instalados
        </p>
        <Button
          onClick={checkInstalledApps}
          disabled={isCheckingApps}
          variant="outline"
          size="sm"
          className="mx-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isCheckingApps ? 'animate-spin' : ''}`} />
          Verificar Apps
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-[1800px] mx-auto">
        {apps.map((app, index) => (
          <AppCardComplex
            key={app.id}
            app={app}
            onInstall={handleInstall}
            isFocused={focusedIndex === index}
            onFocus={() => setFocusedIndex(index)}
            isInstalled={installedApps[app.packageName] || false}
            isChecking={isCheckingApps}
          />
        ))}
      </div>
    </div>
  );
};

export default IndexComplex;
