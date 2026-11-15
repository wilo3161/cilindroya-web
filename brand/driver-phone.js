/* Only phone readings collected after the driver starts the route are sent. */
let cyGpsGeneration=0,cyGpsTimer=null,cyGpsLastFix=null,cyGpsSentAt=0,cyGpsBusy=false;
const cyGpsText=(id,text)=>{const element=document.getElementById(id);if(element)element.textContent=text;};
function cyGpsNotice(text){cyGpsText('cy-phone-notice',text);}
function cyGpsClear(){
 if(geoWatchId!==null)navigator.geolocation.clearWatch(geoWatchId);
 geoWatchId=null;clearInterval(cyGpsTimer);clearInterval(gpsTransmitInterval);
 cyGpsTimer=null;gpsTransmitInterval=null;cyGpsLastFix=null;latestDriverCoords=null;
 if(driverMarker){driverMarker.remove();driverMarker=null;}
 cyGpsText('gpsCoordsVal','Sin ubicación compartida');cyGpsText('gpsSpeedVal','—');
}
async function cyGpsStop(message='Ruta en pausa. Tu ubicación dejó de compartirse.'){
 const token=authToken||localStorage.getItem('gasazul_token');
 cyGpsGeneration++;isTrackingRoute=false;cyGpsClear();
 cyGpsText('gpsText','GPS detenido');cyGpsText('routeStatusTitle','Fuera de ruta');
 cyGpsText('toggleRouteBtn','INICIAR RUTA CON GPS');cyGpsNotice(message);
 if(token)try{await fetch('/api/chofer/ruta/estado',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({active:false,recorded_at:new Date().toISOString()})});}catch{}
}
async function cyGpsSend(generation){
 const pos=cyGpsLastFix;if(!pos||!isTrackingRoute||generation!==cyGpsGeneration||cyGpsBusy)return;
 if(Date.now()-pos.timestamp>30000){cyGpsNotice('Esperando una lectura GPS nueva. No se envían ubicaciones antiguas.');return;}
 if(!navigator.onLine){cyGpsNotice('Sin internet. No se está actualizando tu ubicación.');return;}
 cyGpsBusy=true;
 try{
  const c=pos.coords;
  const res=await fetch('/api/chofer/ruta/ubicacion',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+authToken},body:JSON.stringify({lat:c.latitude,lng:c.longitude,accuracy:c.accuracy,speed_mps:Number.isFinite(c.speed)?c.speed:null,heading:Number.isFinite(c.heading)?c.heading:null,recorded_at:new Date(pos.timestamp).toISOString()})});
  const data=await res.json();if(!res.ok)throw new Error(typeof data.detail==='string'?data.detail:'No se pudo actualizar el GPS.');
  if(generation!==cyGpsGeneration)return;
  cyGpsSentAt=Date.now();cyGpsText('gpsText','GPS actualizado');cyGpsText('routeStatusTitle','En ruta · ubicación del teléfono');
  cyGpsNotice('Ubicación enviada '+new Date().toLocaleTimeString()+'. Precisión: '+Math.round(c.accuracy)+' m.');
 }catch(error){if(generation===cyGpsGeneration)cyGpsNotice(error.message||'No se pudo actualizar el GPS.');}
 finally{cyGpsBusy=false;}
}
toggleRouteTracking=async function(){
 if(isTrackingRoute){await cyGpsStop();return;}
 if(!window.isSecureContext||!navigator.geolocation){cyGpsNotice('Abre esta página con HTTPS en un teléfono con ubicación disponible.');return;}
 if(!authToken){showLogin();return;}
 const generation=++cyGpsGeneration;isTrackingRoute=true;cyGpsSentAt=0;
 cyGpsText('toggleRouteBtn','PAUSAR RUTA');cyGpsText('gpsText','Solicitando GPS');
 cyGpsNotice('Permite la ubicación en tu teléfono y espera la primera lectura.');
 geoWatchId=navigator.geolocation.watchPosition(pos=>{
  if(generation!==cyGpsGeneration||!isTrackingRoute)return;
  const c=pos.coords;
  if(!Number.isFinite(c.latitude)||!Number.isFinite(c.longitude)||!Number.isFinite(c.accuracy)||c.accuracy<=0||c.accuracy>150||Date.now()-pos.timestamp>30000){cyGpsNotice('Señal GPS imprecisa. Acércate a un lugar abierto y espera.');return;}
  cyGpsLastFix=pos;cyGpsText('gpsCoordsVal',c.latitude.toFixed(5)+', '+c.longitude.toFixed(5));
  cyGpsText('gpsSpeedVal',Number.isFinite(c.speed)?(c.speed*3.6).toFixed(1)+' km/h':'Velocidad no disponible');
  if(driverLeafletMap){if(!driverMarker)driverMarker=L.marker([c.latitude,c.longitude]).addTo(driverLeafletMap).bindPopup('Ubicación de tu teléfono');else driverMarker.setLatLng([c.latitude,c.longitude]);driverLeafletMap.panTo([c.latitude,c.longitude]);}
  if(Date.now()-cyGpsSentAt>=8000)cyGpsSend(generation);
 },error=>{
  if(generation!==cyGpsGeneration)return;
  if(error.code===1)cyGpsStop('Ubicación denegada. Actívala en los permisos del navegador y pulsa Iniciar ruta.');
  else cyGpsNotice('No hay señal GPS suficiente. Comprueba la ubicación del teléfono.');
 },{enableHighAccuracy:true,timeout:20000,maximumAge:0});
 cyGpsTimer=setInterval(()=>{
  if(cyGpsLastFix&&Date.now()-cyGpsLastFix.timestamp>30000)cyGpsText('gpsText','Esperando señal GPS');
  cyGpsSend(generation);
 },10000);
};
// GPS does not use the offline delivery queue: stale positions are never replayed.
syncQueuedLocations=async function(){};
transmitGpsCoordinates=async function(){};
const cyMapInit=initDriverMap;
initDriverMap=function(){cyMapInit();if(!isTrackingRoute)cyGpsClear();};
for(const name of ['logout','pinLogout','cyDriverSessionExpired']){
 const original=window[name];if(typeof original==='function')window[name]=function(...args){if(isTrackingRoute)cyGpsStop();return original.apply(this,args);};
}
window.addEventListener('pagehide',()=>{if(isTrackingRoute)cyGpsStop();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&isTrackingRoute)cyGpsStop('Ruta pausada al salir de la pantalla. Al volver, pulsa Iniciar ruta.');});
document.addEventListener('DOMContentLoaded',()=>{
 cyGpsText('gpsCoordsVal','Sin ubicación compartida');cyGpsText('gpsSpeedVal','—');
 const hint=document.createElement('p');hint.id='cy-phone-notice';hint.setAttribute('role','status');hint.className='text-sm text-slate-300 mt-3';
 hint.textContent='Activa ubicación e internet. Mantén esta pantalla abierta: el navegador puede detener el GPS al bloquear el teléfono. Sin señal reciente dejarás de aparecer disponible.';
 document.getElementById('toggleRouteBtn').after(hint);
});
