import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LoadingInterceptor } from './Interceptors/loading.interceptor';
import { provideServerRendering } from '@angular/platform-server'; // <-- Importación clave
import { routes } from './app.routes';

  export function HttpLoaderFactory(httpClient: HttpClient) {
    return  new  TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
  };

  export const provideTranslation = () => ({
    //defaultLanguage: 'es',
    fallbackLang: 'es',
    loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient],
    },
  });
  
  export const appConfig: ApplicationConfig = {
    providers: [
      provideServerRendering(),
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideAnimations(), // required animations providers
      { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
      //provideHttpClient(),
      importProvidersFrom([
        HttpClientModule, 
        TranslateModule.forRoot(provideTranslation())
      ]),
      provideHttpClient(
        withFetch() // Habilita la implementación de 'fetch' para SSR
      ),
      provideRouter(routes),
      provideClientHydration(), provideClientHydration(withEventReplay()),
      //LoginGuardian
    ]
};
