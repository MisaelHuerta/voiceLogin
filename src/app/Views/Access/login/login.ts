import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
/**Angular Material */
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Microphone } from '../../../Services/Functions/microphone';
//import { MediaStream } from 'rxjs/internal/observable/from';
import { Subscription } from 'rxjs';
import { Access } from '../../../Services/Access/access';
import { Message } from '../../../Components/General/message/message';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnDestroy {

  public form: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
  });


  public micPermissionGranted: boolean = false;
  public isListening: boolean = false;
  public micStatus: string = 'Inactivo';
  public iconAux: string = 'mic_off';
  public iconHint: string = 'Permiso inhabilitado';
  public transcription: string = '';
  public limit: number = 15;
  private audioStream: MediaStream | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private micService: Microphone,
    private route: Router, 
    private aroute: ActivatedRoute,
    private Service: Access,
    private dialog: MatDialog
  ) {
    this.requestInitialPermission();
    
    // 1. Suscribirse a los resultados del reconocimiento
    this.subscriptions.add(this.micService.recognizedText$.subscribe(text => {
      this.transcription = text;
      this.form.value.name = text;
      this.form.patchValue({
        name: text,
      });
      if(this.transcription.length > this.limit){
        const auxName = this.transcription.slice(0,15);
        this.form.patchValue({
          name: auxName,
        });
        // Puedes detener la escucha automáticamente aquí si 'continuous' es false
        this.isListening = true; 
        this.toggleListening();
      }
      // Puedes detener la escucha automáticamente aquí si 'continuous' es false
      //this.isListening = true; 
      //this.toggleListening();
    }));
    
    // 2. Suscribirse a los errores de reconocimiento
    this.subscriptions.add(this.micService.recognitionError$.subscribe(error => {
      this.micStatus = `Error: ${error}`;
      this.isListening = false;
    }));
  }
  
  // Paso 1: Obtener el permiso del micrófono
  requestInitialPermission(): void {
      this.micService.requestMicrophonePermission().subscribe({
          next: (stream) => {
              this.audioStream = stream;
              this.micPermissionGranted = true;
              this.micStatus = 'Permiso concedido. Listo para escuchar.';
              // Detenemos el stream de audio inmediatamente después de obtener el permiso 
              // para no mantener la luz del micrófono encendida innecesariamente.
              // La API de Web Speech se encarga de reabrirlo cuando se llama a start().
              this.micService.stopStream(stream); 
              this.audioStream = null;
              this.iconAux = 'mic';
          },
          error: (err) => {
              this.micStatus = `${err.message}`;
              this.micPermissionGranted = false;
              this.iconAux = 'mic_off';
          }
      });
  }

  // Paso 2: Alternar la escucha (transformación de voz a texto)
  toggleListening(): void {
    if (this.isListening) {
      this.micService.stopListening();
      this.isListening = false;
      this.micStatus = 'Detenido';
      this.iconAux = 'mic';
    } else {
      this.transcription = 'Escuchando... Hable ahora.';
      this.micService.startListening();
      this.isListening = true;
      this.micStatus = 'Grabando';
      this.iconAux = 'mic_none';
    }
  }

  submit(){
    if (this.isListening){
      this.toggleListening();
    }
    if(this.form.valid){
      const data = {
        name : this.form.value.name
      }
      this.Service.encryptUserName(data).subscribe(
        res => {
          console.log("res",res);
          const data = {
            message: "¡Operación exitosa!" ,
            aditionalInfo: res.message
          };
          this.openDialog(data);
        },
        error => {
          console.log("res",error);
        }
      );
    }
  };

  openDialog(dataMessage: any){
    let dialogRef = this.dialog.open(Message, {
      width: '650px',
      //height: '300px',
      data: dataMessage,
      panelClass: 'age-dialog-container',
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data === 'aceptar') {
      }
      dialogRef.close();
    });
  };

  ngOnDestroy(): void {
    this.micService.stopListening();
    this.subscriptions.unsubscribe();
  }

}
