import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// 1. Declaración global para la API de Reconocimiento de Voz
declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

@Injectable({
  providedIn: 'root'
})
export class Microphone {
  // Objeto para manejar el reconocimiento
  private recognition: any;
  // Subject para emitir el texto reconocido de forma reactiva
  public recognizedText$: Subject<string> = new Subject<string>();
  // Subject para emitir errores de reconocimiento
  public recognitionError$: Subject<string> = new Subject<string>();

  constructor(private ngZone: NgZone) {
    this.initializeRecognition();
  }
  /**
   * Solicita al usuario permiso para acceder al micrófono.
   * @returns Observable<MediaStream> El stream de audio si se concede el permiso.
   * Emite un error si se deniega el permiso o si ocurre un problema.
   */
  requestMicrophonePermission(): Observable<MediaStream> {
    
    // Verifica si la API MediaDevices está disponible en el navegador
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return throwError(() => new Error('MediaDevices API o getUserMedia no soportado en este navegador.'));
    }

    const constraints: MediaStreamConstraints = {
      audio: true, // Solicita acceso al micrófono
      video: false // No solicita acceso a la cámara
    };

    // navigator.mediaDevices.getUserMedia devuelve una Promesa,
    // que se convierte a un Observable con la función 'from' de RxJS.
    return from(navigator.mediaDevices.getUserMedia(constraints)).pipe(
      catchError(error => {
        let errorMessage: string;
        
        switch (error.name) {
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            errorMessage = 'Permiso de micrófono denegado por el usuario. Por favor, revísalo en la configuración del navegador.';
            break;
          case 'NotFoundError':
          case 'DevicesNotFoundError':
            errorMessage = 'Micrófono no encontrado.';
            break;
          case 'NotReadableError':
            errorMessage = 'El micrófono está en uso por otra aplicación.';
            break;
          default:
            errorMessage = `Error al acceder al micrófono: ${error.message || error.name}`;
        }
        
        console.error('Error en getUserMedia:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Cierra y detiene las pistas de un stream de audio.
   * Esto es crucial para liberar el micrófono después de usarlo.
   */
  stopStream(stream: MediaStream): void {
    stream.getTracks().forEach(track => track.stop());
  }
  /**
   * Inicializa la interfaz de Reconocimiento de Voz.
   */
  private initializeRecognition(): void {
    // 2. Determinar la clase SpeechRecognition disponible
    const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.warn('La API de Reconocimiento de Voz no está soportada en este navegador.');
      return;
    }

    this.recognition = new SpeechRecognitionAPI();

    // 3. Configurar opciones
    this.recognition.continuous = true; // Detener la escucha tras una pausa
    this.recognition.interimResults = true; // No mostrar resultados parciales
    this.recognition.lang = 'es-ES'; // Configura el idioma

    // 4. Manejo de eventos del Reconocimiento de Voz

    this.recognition.onresult = (event: any) => {
      // Necesario para notificar a Angular de los cambios, ya que el evento es externo
      this.ngZone.run(() => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        this.recognizedText$.next(text);
      });
    };

    this.recognition.onerror = (event: any) => {
      this.ngZone.run(() => {
        this.recognitionError$.next(`Error de reconocimiento: ${event.error}`);
      });
    };

    this.recognition.onend = () => {
        console.log('Reconocimiento de voz finalizado.');
    };
  }

  /**
   * Comienza a escuchar el micrófono y a transformar el audio en texto.
   * Requiere que el permiso del micrófono ya haya sido concedido.
   */
  startListening(): void {
    if (this.recognition) {
        try {
            this.recognition.start();
            console.log('Comenzando a escuchar...');
        } catch(e) {
            console.error('Error al iniciar el reconocimiento de voz. Asegúrate de que el micrófono esté activo y de que no haya otro proceso de reconocimiento en curso.', e);
        }
    } else {
      this.recognitionError$.next('API de Reconocimiento de Voz no inicializada.');
    }
  }

  /**
   * Detiene el proceso de escucha.
   */
  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      console.log('Deteniendo la escucha.');
    }
  }
}