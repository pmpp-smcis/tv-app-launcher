# 🔧 Setup do Plugin Nativo - App Install Checker

Este guia mostra como adicionar o código nativo Android para verificar apps instalados.

## ⚠️ Pré-requisitos

1. Exportar o projeto para GitHub (botão "Export to GitHub" no Lovable)
2. Ter Android Studio instalado
3. Git pull do seu repositório

## 📝 Passo a Passo

### 1. Adicionar o Android ao projeto

```bash
cd seu-projeto
npm install
npx cap add android
```

### 2. Criar o Plugin Java

Crie o arquivo: `android/app/src/main/java/app/lovable/your-id/AppInstallCheckerPlugin.java`

```java
package app.lovable.a58af1ad9ef47b4936eda4cb53c5833;

import android.content.pm.PackageManager;
import android.content.pm.ApplicationInfo;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import java.util.List;

@CapacitorPlugin(name = "AppInstallChecker")
public class AppInstallCheckerPlugin extends Plugin {

    @PluginMethod
    public void isAppInstalled(PluginCall call) {
        String packageName = call.getString("packageName");
        
        if (packageName == null) {
            call.reject("Package name is required");
            return;
        }

        PackageManager pm = getContext().getPackageManager();
        boolean installed = false;
        
        try {
            pm.getPackageInfo(packageName, PackageManager.GET_ACTIVITIES);
            installed = true;
        } catch (PackageManager.NameNotFoundException e) {
            installed = false;
        }

        JSObject ret = new JSObject();
        ret.put("installed", installed);
        call.resolve(ret);
    }

    @PluginMethod
    public void checkMultipleApps(PluginCall call) {
        JSONArray packageNamesArray = call.getArray("packageNames");
        
        if (packageNamesArray == null) {
            call.reject("Package names array is required");
            return;
        }

        PackageManager pm = getContext().getPackageManager();
        JSObject results = new JSObject();

        try {
            for (int i = 0; i < packageNamesArray.length(); i++) {
                String packageName = packageNamesArray.getString(i);
                boolean installed = false;
                
                try {
                    pm.getPackageInfo(packageName, PackageManager.GET_ACTIVITIES);
                    installed = true;
                } catch (PackageManager.NameNotFoundException e) {
                    installed = false;
                }
                
                results.put(packageName, installed);
            }
        } catch (JSONException e) {
            call.reject("Error parsing package names", e);
            return;
        }

        JSObject ret = new JSObject();
        ret.put("results", results);
        call.resolve(ret);
    }

    @PluginMethod
    public void getInstalledApps(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        List<ApplicationInfo> packages = pm.getInstalledApplications(PackageManager.GET_META_DATA);
        
        JSONArray packagesArray = new JSONArray();
        for (ApplicationInfo packageInfo : packages) {
            packagesArray.put(packageInfo.packageName);
        }

        JSObject ret = new JSObject();
        ret.put("packages", packagesArray);
        call.resolve(ret);
    }
}
```

### 3. Registrar o Plugin

Edite: `android/app/src/main/java/app/lovable/your-id/MainActivity.java`

```java
package app.lovable.a58af1ad9ef47b4936eda4cb53c5833;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Registrar o plugin
        registerPlugin(AppInstallCheckerPlugin.class);
    }
}
```

### 4. Adicionar Permissão (se necessário)

Edite: `android/app/src/main/AndroidManifest.xml`

Adicione (se ainda não existir):

```xml
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
```

### 5. Compilar e Testar

```bash
npm run build
npx cap sync
npx cap run android
```

## 🎯 Como Usar no App

A versão COMPLEXA (`/complex`) já está configurada para usar o plugin.

Para acessar:
1. Abra o app
2. Navegue para `/complex` (você precisará adicionar uma rota no App.tsx)

## 🐛 Troubleshooting

### Plugin não funciona
- Verifique se o nome do pacote Java está correto
- Confirme que o plugin foi registrado no MainActivity
- Rode `npx cap sync` novamente

### Erro de permissão
- Apps com targetSdk 30+ precisam da permissão QUERY_ALL_PACKAGES
- Adicione no AndroidManifest.xml

### Build falha
- Limpe o cache: `cd android && ./gradlew clean`
- Reconstrua: `cd .. && npx cap sync`

## 📚 Referências

- [Capacitor Plugin Guide](https://capacitorjs.com/docs/plugins/creating-plugins)
- [Android PackageManager](https://developer.android.com/reference/android/content/pm/PackageManager)
