import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, CheckCircle2, Circle } from "lucide-react";
import { AppItem } from "@/types/app";

interface AppCardComplexProps {
  app: AppItem;
  onInstall: (app: AppItem) => void;
  isFocused: boolean;
  onFocus: () => void;
  isInstalled: boolean;
  isChecking: boolean;
}

export const AppCardComplex = ({ 
  app, 
  onInstall, 
  isFocused, 
  onFocus,
  isInstalled,
  isChecking
}: AppCardComplexProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.focus();
    }
  }, [isFocused]);

  return (
    <Card
      ref={cardRef}
      tabIndex={0}
      onFocus={onFocus}
      className={`
        group relative overflow-hidden transition-all duration-300 outline-none
        bg-card hover:bg-secondary focus:bg-secondary
        ${isFocused ? "ring-4 ring-tv-focus shadow-tv-focus scale-105" : ""}
        ${isInstalled ? "border-2 border-green-500/50" : ""}
      `}
    >
      <div className="p-4 flex flex-col items-center text-center space-y-3">
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          {isChecking ? (
            <Circle className="h-5 w-5 text-muted-foreground animate-pulse" />
          ) : isInstalled ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
          <img
            src={app.icon}
            alt={app.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Cpath d='M7 7h.01M7 12h.01M7 17h.01M12 7h5M12 12h5M12 17h5'/%3E%3C/svg%3E";
            }}
          />
        </div>
        
        <div className="flex-1 min-h-[60px]">
          <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-1">{app.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{app.description}</p>
          <p className="text-[10px] text-muted-foreground">v{app.version}</p>
          {isInstalled && (
            <p className="text-xs text-green-500 font-medium mt-1">✓ Instalado</p>
          )}
        </div>

        <Button
          onClick={() => onInstall(app)}
          className={`w-full h-10 ${
            isInstalled 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-primary hover:bg-primary/90"
          } focus:ring-4 focus:ring-tv-focus`}
          size="sm"
          disabled={isChecking}
        >
          <Download className="mr-2 h-4 w-4" />
          {isInstalled ? 'Reinstalar' : 'Instalar'}
        </Button>
      </div>
    </Card>
  );
};
