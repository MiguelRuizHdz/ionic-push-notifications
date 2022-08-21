import { EventEmitter, Injectable } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes: OSNotificationPayload[] = [
    // {
    //   title: 'Titulo de la push',
    //   body: 'Este es el body de la push',
    //   date: new Date()
    // }
  ];

  userId: string;

  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor( private oneSignal: OneSignal,
               private storage: Storage ) {
    this.storage.create();
    this.cargarMensajes();
  }

  async getMensajes() {
    await this.cargarMensajes();
    return [...this.mensajes];
  }

  configuracionInicial() {
    this.oneSignal.startInit('a40d80ff-87eb-48b8-a9f3-a91cee4183be', '1082457633224');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe(( noti ) => {
     // do something when notification is received
     console.log('Notificacion recibida', noti);
     this.notificacionRecibida( noti );

    });

    this.oneSignal.handleNotificationOpened().subscribe( async ( noti ) => {
      // do something when a notification is opened
     console.log('Notificacion abierta', noti);
     await this.notificacionRecibida( noti.notification );
    });

    // Obtener ID del subscriptor
    this.oneSignal.getIds().then( info => {
      this.userId = info.userId;
      console.log(this.userId);
    });

    this.oneSignal.endInit();
  }

  async notificacionRecibida( noti: OSNotification ) {

    await this.cargarMensajes();

    const payload = noti.payload;

    const existePush = this.mensajes.find( mensaje => mensaje.notificationID === payload.notificationID );

    if ( existePush ){
      return;
    }

    this.mensajes.unshift( payload );
    this.pushListener.emit( payload );

    await this.guardarMensajes();
  }

  guardarMensajes() {
    this.storage.set('mensajes', this.mensajes );
  }

  async cargarMensajes(){
    this.mensajes = await this.storage.get('mensajes') || [];
    return this.mensajes;
  }

  async borrarMensajes() {
    await this.storage.clear();
    this.mensajes = [];
    this.guardarMensajes();
  }
}
