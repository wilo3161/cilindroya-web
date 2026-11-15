const cyEl=id=>document.getElementById(id);
function cyMessage(message){cyEl('cy-message').textContent=message;}
async function cyRequest(url,options={}){
 const headers=new Headers(options.headers||{});headers.set('Content-Type','application/json');
 const token=sessionStorage.getItem('cilindroya_admin_token');if(token)headers.set('Authorization','Bearer '+token);
 const res=await fetch(url,{...options,headers,cache:'no-store'});
 const data=await res.json().catch(()=>({detail:'El servidor no respondió correctamente.'}));
 if(!res.ok)throw new Error(typeof data.detail==='string'?data.detail:'Revisa los datos ingresados.');return data;
}
async function cySubmitDriver(event){
 event.preventDefault();const form=event.currentTarget,button=form.querySelector('button[type=submit]');button.disabled=true;
 const body=Object.fromEntries(new FormData(form));body.accept_privacy=!!body.accept_privacy;body.accept_pilot=!!body.accept_pilot;
 try{const result=await cyRequest('/api/distribuidores/registro-chofer',{method:'POST',body:JSON.stringify(body)});cyMessage(result.message);form.reset();if(document.body.dataset.admin==='true')await cyLoadApplications();}
 catch(error){cyMessage(error.message);}finally{button.disabled=false;}
}
async function cyLoadApplications(){
 const data=await cyRequest('/api/admin/choferes/solicitudes');cyEl('cy-mode').textContent=data.routing_mode==='gps'?'Despacho GPS para choferes aprobados':'Prueba exclusiva de Carlos';
 const list=cyEl('cy-applications');list.replaceChildren();
 for(const a of data.applications){
  const card=document.createElement('article');card.className='card';
  const text=document.createElement('p');text.style.whiteSpace='pre-line';text.textContent=[a.full_name+' · '+a.status,'Usuario: '+a.username,'Correo: '+a.email,'Teléfono: '+a.phone,'RUC: '+a.ruc,'Placa: '+a.truck_plate,'Permiso declarado: '+a.permit_reference,'Cobertura: '+a.coverage].join('\n');card.append(text);
  if(a.status==='pending'){
   const labels=['Revisé los permisos y documentos del distribuidor y del vehículo.','El convenio y el aviso de privacidad fueron aceptados y documentados.'];
   const checks=labels.map(label=>{const p=document.createElement('label'),input=document.createElement('input');input.type='checkbox';p.append(input,document.createTextNode(' '+label));card.append(p);return input;});
   const approve=document.createElement('button');approve.textContent='Aprobar y habilitar acceso';approve.onclick=async()=>{
    if(checks.some(c=>!c.checked)){cyMessage('Confirma la revisión de documentos y del convenio.');return;}
    approve.disabled=true;try{await cyRequest('/api/admin/choferes/solicitudes/'+encodeURIComponent(a.id)+'/aprobar',{method:'POST',body:JSON.stringify({documents_verified:true,agreement_verified:true})});cyMessage('Chofer habilitado. Usa la contraseña y PIN que eligió en el registro.');await cyLoadApplications();}catch(e){cyMessage(e.message);approve.disabled=false;}
   };card.append(approve);
   const reason=document.createElement('input');reason.placeholder='Motivo si rechazas la solicitud';reason.setAttribute('aria-label','Motivo del rechazo');card.append(reason);
   const reject=document.createElement('button');reject.textContent='Rechazar solicitud';reject.onclick=async()=>{try{await cyRequest('/api/admin/choferes/solicitudes/'+encodeURIComponent(a.id)+'/rechazar',{method:'POST',body:JSON.stringify({reason:reason.value})});await cyLoadApplications();}catch(e){cyMessage(e.message);}};card.append(reject);
  }list.append(card);
 }if(!data.applications.length)list.textContent='No hay solicitudes pendientes ni choferes registrados por este formulario.';
 const locations=await cyRequest('/api/admin/choferes/ubicaciones');cyEl('cy-locations').textContent=locations.drivers.map(d=>'Chofer '+d.driver_id+': '+(d.active?'GPS actualizado · '+d.lat.toFixed(5)+', '+d.lng.toFixed(5):'Fuera de ruta / señal antigua')).join('\n')||'Aún no hay ubicaciones enviadas desde teléfonos.';
}
async function cyAdminLogin(event){
 event.preventDefault();try{
  const form=event.currentTarget,data=await cyRequest('/api/auth/login',{method:'POST',body:JSON.stringify({username:form.elements.username.value,password:form.elements.password.value})});
  if(data.user.role!=='admin')throw new Error('Esta cuenta no es administradora.');
  sessionStorage.setItem('cilindroya_admin_token',data.access_token);form.elements.password.value='';await cyLoadApplications();cyEl('cy-admin-tools').hidden=false;cyEl('cy-login').hidden=true;cyMessage('Administración de choferes lista.');
 }catch(e){cyMessage(e.message);}
}
async function cySetMode(mode){try{await cyRequest('/api/admin/choferes/despacho',{method:'POST',body:JSON.stringify({mode})});await cyLoadApplications();cyMessage('Modo de despacho actualizado. Los pedidos existentes conservan su chofer.');}catch(e){cyMessage(e.message);}}
document.addEventListener('DOMContentLoaded',()=>{
 localStorage.removeItem('cilindroya_b2b_afiliacion');
 document.querySelectorAll('form[data-driver-register]').forEach(f=>f.addEventListener('submit',cySubmitDriver));
 if(cyEl('cy-login'))cyEl('cy-login').addEventListener('submit',cyAdminLogin);
});
