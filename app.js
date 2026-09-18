const STORAGE_KEY = 'gestioneTrasferteWorkbookV1';
const MONTHS = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const LISTS = {
  yesNo: ['Sì','No'],
  requestStatus: ['Da inserire','Inserita','Non necessaria','Annullata'],
  carStatus: ['Non richiesta','Da richiedere','Richiesta','Confermata'],
  authorization: ['In attesa','Ricevuta','Non necessaria']
};
const OVERALL_STATUSES = ['PROGRAMMATA','IN CORSO','DA CHIUDERE','CHIUSA','RICHIESTA DA COMPLETARE','ANNULLATA'];
const ALERT_LEGEND = [
  ['SCADUTA','La data limite è superata e la richiesta non risulta inserita'],
  ['ENTRO 7 GG','Inserire la richiesta entro una settimana'],
  ['DA PROGRAMMARE','La scadenza è oltre una settimana'],
  ['OK','Richiesta inserita, non necessaria o trasferta annullata']
];
const CALENDAR_LEGEND = [
  ['red','Richiesta non inserita'],['green','Richiesta inserita / non necessaria'],
  ['violet','Da chiudere'],['blue','Completamente chiusa'],['gray','Annullata']
];

const INITIAL_TRIPS = [
  {id:1,destination:'Sede Cliente Nord',departureDate:'2026-09-07',returnDate:'2026-09-11',requestStatus:'Inserita',requestInsertedDate:'2026-07-29',flight:'Volo A/R — orari da confermare',hotel:'Hotel Demo Centro',flightCode:'DEMO01',carStatus:'Richiesta',onlineReceipts:'No',authorization:'In attesa',printedForm:'No',digitalCopy:'No',singleFile:'No',companyEmail:'No',dataManagementPackage:'No',notes:''},
  {id:2,destination:'Filiale Ovest',departureDate:'2026-09-14',returnDate:'2026-09-18',requestStatus:'Inserita',requestInsertedDate:'2026-08-28',flight:'Treno A/R — prenotato',hotel:'Residence Demo',flightCode:'DEMO02',carStatus:'Non richiesta',onlineReceipts:'No',authorization:'In attesa',printedForm:'No',digitalCopy:'No',singleFile:'No',companyEmail:'No',dataManagementPackage:'No',notes:''},
  {id:3,destination:'Stabilimento Est',departureDate:'2026-09-23',returnDate:'2026-09-25',requestStatus:'Inserita',requestInsertedDate:'2026-09-09',flight:'Volo A/R — prenotato',hotel:'Hotel Demo Business',flightCode:'DEMO03',carStatus:'Richiesta',onlineReceipts:'',authorization:'In attesa',printedForm:'No',digitalCopy:'No',singleFile:'No',companyEmail:'No',dataManagementPackage:'No',notes:''},
  {id:4,destination:'Ufficio Centrale',departureDate:'2026-09-29',returnDate:'2026-10-02',requestStatus:'Inserita',requestInsertedDate:'2026-09-16',flight:'Treno A/R — orari da confermare',hotel:'Hotel Demo Centro',flightCode:'DEMO04',carStatus:'Non richiesta',onlineReceipts:'',authorization:'',printedForm:'',digitalCopy:'',singleFile:'',companyEmail:'',dataManagementPackage:'',notes:'Esempio dimostrativo: verificare agenda e date definitive.'},
  {id:5,destination:'Sede Cliente Sud',departureDate:'2026-10-04',returnDate:'2026-10-07',requestStatus:'Da inserire',requestInsertedDate:'',flight:'Volo A/R — da prenotare',hotel:'',flightCode:'',carStatus:'',onlineReceipts:'',authorization:'',printedForm:'',digitalCopy:'',singleFile:'',companyEmail:'',dataManagementPackage:'',notes:'Esempio dimostrativo: completare i dettagli della trasferta.'}
];

const $ = id => document.getElementById(id);
const el = {
  pageTitle:$('pageTitle'),todayLabel:$('todayLabel'),heroTrips:$('heroTrips'),heroMessage:$('heroMessage'),
  expiredCount:$('expiredCount'),dueSoonCount:$('dueSoonCount'),toCloseCount:$('toCloseCount'),plannedCount:$('plannedCount'),
  priorityList:$('priorityList'),summaryBody:$('summaryBody'),alertLegend:$('alertLegend'),calendarMonth:$('calendarMonth'),
  calendarYear:$('calendarYear'),calendarGrid:$('calendarGrid'),calendarLegend:$('calendarLegend'),tripsList:$('tripsList'),
  tripSearch:$('tripSearch'),statusFilter:$('statusFilter'),referenceLists:$('referenceLists'),modalBackdrop:$('modalBackdrop'),
  tripSheet:$('tripSheet'),tripForm:$('tripForm'),editTripId:$('editTripId'),tripSheetEyebrow:$('tripSheetEyebrow'),
  destination:$('destination'),departureDate:$('departureDate'),returnDate:$('returnDate'),requestDeadline:$('requestDeadline'),
  requestAlert:$('requestAlert'),requestStatus:$('requestStatus'),requestInsertedDate:$('requestInsertedDate'),flight:$('flight'),
  hotel:$('hotel'),flightCode:$('flightCode'),carStatus:$('carStatus'),onlineReceipts:$('onlineReceipts'),authorization:$('authorization'),
  printedForm:$('printedForm'),digitalCopy:$('digitalCopy'),singleFile:$('singleFile'),companyEmail:$('companyEmail'),
  dataManagementPackage:$('dataManagementPackage'),notes:$('notes'),previewCompletion:$('previewCompletion'),
  previewProgress:$('previewProgress'),previewOverallStatus:$('previewOverallStatus'),formMessage:$('formMessage'),
  deleteTripButton:$('deleteTripButton'),toast:$('toast')
};

function clone(value){return JSON.parse(JSON.stringify(value))}
function initialState(){return{version:1,trips:clone(INITIAL_TRIPS),calendar:{month:8,year:2026}}}
function loadState(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved&&Array.isArray(saved.trips))return{version:1,trips:saved.trips,calendar:saved.calendar||{month:8,year:2026}};
  }catch(error){console.warn('Impossibile leggere i dati salvati',error)}
  return initialState();
}
let state=loadState();

function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderAll()}
function esc(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]))}
function slug(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}
function parseDate(iso){if(!iso)return null;const [year,month,day]=iso.split('-').map(Number);return new Date(year,month-1,day,12)}
function toIso(date){if(!date)return'';return`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function todayIso(){return toIso(new Date())}
function addDays(iso,amount){const date=parseDate(iso);if(!date)return'';date.setDate(date.getDate()+amount);return toIso(date)}
function dayDiff(from,to){const a=parseDate(from),b=parseDate(to);return a&&b?Math.round((b-a)/86400000):0}
function formatDate(iso,short=false){const date=parseDate(iso);if(!date)return'—';return new Intl.DateTimeFormat('it-IT',short?{day:'2-digit',month:'2-digit',year:'2-digit'}:{day:'numeric',month:'short',year:'numeric'}).format(date)}
function dateRange(start,end){return`${formatDate(start,true)} → ${formatDate(end,true)}`}
function setOptions(select,values,emptyLabel='— Non impostato —'){select.innerHTML=`<option value="">${emptyLabel}</option>`+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')}

function completion(trip){
  if(!trip.departureDate)return 0;
  const checks=[trip.onlineReceipts==='Sì',['Ricevuta','Non necessaria'].includes(trip.authorization),trip.printedForm==='Sì',trip.digitalCopy==='Sì',trip.singleFile==='Sì',trip.companyEmail==='Sì',trip.dataManagementPackage==='Sì'];
  return checks.filter(Boolean).length/7;
}
function requestAlert(trip,reference=todayIso()){
  if(!trip.departureDate)return'';
  if(['Inserita','Non necessaria','Annullata'].includes(trip.requestStatus))return'OK';
  const deadline=addDays(trip.departureDate,-14);
  if(reference>deadline)return'SCADUTA';
  if(dayDiff(reference,deadline)<=7)return'ENTRO 7 GG';
  return'DA PROGRAMMARE';
}
function overallStatus(trip,reference=todayIso()){
  if(!trip.departureDate)return'';
  if(trip.requestStatus==='Annullata')return'ANNULLATA';
  if(reference<trip.departureDate)return trip.requestStatus==='Inserita'?'PROGRAMMATA':'RICHIESTA DA COMPLETARE';
  if(completion(trip)===1)return'CHIUSA';
  return reference<=trip.returnDate?'IN CORSO':'DA CHIUDERE';
}
function computed(trip){return{...trip,requestDeadline:addDays(trip.departureDate,-14),alert:requestAlert(trip),completion:completion(trip),overallStatus:overallStatus(trip)}}
function calendarColor(trip){
  const status=overallStatus(trip);
  if(trip.requestStatus==='Annullata')return'gray';
  if(status==='CHIUSA')return'blue';
  if(trip.returnDate&&trip.returnDate<todayIso())return'violet';
  if(['Inserita','Non necessaria'].includes(trip.requestStatus))return'green';
  return'red';
}
function statusClass(status){return`status-${slug(status)}`}
function alertClass(alert){return`alert-${slug(alert)}`}
function accentForStatus(status){return{'PROGRAMMATA':'#70a360','IN CORSO':'#5b91b6','DA CHIUDERE':'#cb6868','CHIUSA':'#5b91b6','RICHIESTA DA COMPLETARE':'#d39a37','ANNULLATA':'#8a909b'}[status]||'#94a3b8'}

function renderDashboard(){
  const trips=state.trips.map(computed);
  const expired=trips.filter(t=>t.alert==='SCADUTA').length;
  const soon=trips.filter(t=>t.alert==='ENTRO 7 GG').length;
  const close=trips.filter(t=>t.overallStatus==='DA CHIUDERE').length;
  const planned=trips.filter(t=>t.overallStatus==='PROGRAMMATA').length;
  el.heroTrips.textContent=trips.length;el.expiredCount.textContent=expired;el.dueSoonCount.textContent=soon;el.toCloseCount.textContent=close;el.plannedCount.textContent=planned;
  const open=expired+soon+close;
  el.heroMessage.textContent=open?`${open} ${open===1?'attività richiede':'attività richiedono'} attenzione.`:'Nessuna urgenza rilevata.';
  const priority=trips.filter(t=>t.alert!=='OK'||t.overallStatus==='DA CHIUDERE').sort((a,b)=>priorityRank(a)-priorityRank(b)||a.departureDate.localeCompare(b.departureDate)).slice(0,4);
  el.priorityList.innerHTML=priority.map(tripCard).join('')||emptyState('Nessuna priorità aperta','Le richieste e le chiusure sono sotto controllo.');
  el.summaryBody.innerHTML=[...trips].sort(sortByDeparture).slice(0,25).map(t=>`<tr>
    <td>${formatDate(t.departureDate,true)}</td><td>${formatDate(t.returnDate,true)}</td><td><strong>${esc(t.destination)}</strong></td>
    <td>${formatDate(t.requestDeadline,true)}</td><td><span class="alert-pill ${alertClass(t.alert)}">${esc(t.alert)}</span></td>
    <td class="cell-wrap">${esc(t.flight||'—')}</td><td class="cell-wrap">${esc(t.hotel||'—')}</td><td>${esc(t.carStatus||'—')}</td>
    <td>${Math.round(t.completion*100)}%</td><td><span class="status-pill ${statusClass(t.overallStatus)}">${esc(t.overallStatus)}</span></td></tr>`).join('')||'<tr><td colspan="10" class="cell-muted">Nessuna trasferta inserita.</td></tr>';
  el.alertLegend.innerHTML=ALERT_LEGEND.map(([label,description])=>`<div class="legend-row"><span class="alert-pill ${alertClass(label)}">${label}</span><p>${description}</p></div>`).join('');
}
function priorityRank(trip){if(trip.alert==='SCADUTA')return 0;if(trip.alert==='ENTRO 7 GG')return 1;if(trip.overallStatus==='DA CHIUDERE')return 2;return 3}
function sortByDeparture(a,b){return String(a.departureDate||'9999').localeCompare(String(b.departureDate||'9999'))}
function emptyState(title,text){return`<div class="empty-state"><strong>${title}</strong>${text}</div>`}
function tripCard(trip){
  const t=trip.alert?trip:computed(trip);const pct=Math.round(t.completion*100);
  return`<article class="trip-card" style="--trip-accent:${accentForStatus(t.overallStatus)}">
    <div class="trip-top"><div class="trip-identity"><span class="trip-id">TRASFERTA ${esc(t.id)}</span><h3>${esc(t.destination)}</h3><div class="trip-date">${dateRange(t.departureDate,t.returnDate)}</div></div><span class="status-pill ${statusClass(t.overallStatus)}">${esc(t.overallStatus)}</span></div>
    <div class="trip-meta"><div class="meta-box"><span>Scadenza richiesta</span><strong>${formatDate(t.requestDeadline,true)}</strong></div><div class="meta-box"><span>Alert</span><strong>${esc(t.alert)}</strong></div><div class="meta-box"><span>Volo</span><strong>${esc(t.flight||'Non indicato')}</strong></div><div class="meta-box"><span>Auto</span><strong>${esc(t.carStatus||'Non indicata')}</strong></div></div>
    <div class="trip-footer"><div class="closure"><span>Chiusura pratica</span><strong>${pct}%</strong><div class="progress-track"><span style="width:${pct}%"></span></div></div><button class="edit-button" onclick="editTrip(${Number(t.id)})">Apri</button></div>
  </article>`;
}

function renderTrips(){
  const query=el.tripSearch.value.trim().toLowerCase(),filter=el.statusFilter.value;
  const trips=state.trips.map(computed).filter(t=>!filter||t.overallStatus===filter).filter(t=>!query||[t.destination,t.flight,t.flightCode,t.hotel,t.notes].some(v=>String(v||'').toLowerCase().includes(query))).sort(sortByDeparture);
  el.tripsList.innerHTML=trips.map(tripCard).join('')||emptyState('Nessun risultato','Modifica i filtri oppure aggiungi una nuova trasferta.');
}

function renderCalendarControls(){
  el.calendarMonth.innerHTML=MONTHS.map((month,index)=>`<option value="${index}" ${index===Number(state.calendar.month)?'selected':''}>${month}</option>`).join('');
  const tripYears=state.trips.flatMap(t=>[Number(String(t.departureDate).slice(0,4)),Number(String(t.returnDate).slice(0,4))]).filter(Number.isFinite);
  const nowYear=new Date().getFullYear(),min=Math.min(nowYear-2,2024,...tripYears),max=Math.max(nowYear+3,2028,...tripYears);
  el.calendarYear.innerHTML=Array.from({length:max-min+1},(_,index)=>min+index).map(year=>`<option ${year===Number(state.calendar.year)?'selected':''}>${year}</option>`).join('');
}
function renderCalendar(){
  renderCalendarControls();
  const month=Number(state.calendar.month),year=Number(state.calendar.year);const first=new Date(year,month,1,12);const offset=(first.getDay()+6)%7;const cells=[];
  for(let index=0;index<42;index++){
    const day=index-offset+1;const iso=day>0&&day<=new Date(year,month+1,0).getDate()?toIso(new Date(year,month,day,12)):'';
    if(!iso){cells.push('<div class="calendar-day outside" aria-hidden="true"></div>');continue}
    const trips=state.trips.filter(t=>t.departureDate<=iso&&t.returnDate>=iso).sort((a,b)=>Number(a.id)-Number(b.id));
    const buttons=trips.slice(0,2).map(t=>`<button class="day-trip color-${calendarColor(t)}" onclick="editTrip(${Number(t.id)})" title="T${t.id} — ${esc(t.destination)}">T${t.id} · ${esc(t.destination)}</button>`).join('');
    const more=trips.length>2?`<div class="more-trips">+${trips.length-2}</div>`:'';
    cells.push(`<div class="calendar-day ${iso===todayIso()?'today':''}"><span class="day-number">${day}</span>${buttons}${more}</div>`);
  }
  el.calendarGrid.innerHTML=cells.join('');
  el.calendarLegend.innerHTML=CALENDAR_LEGEND.map(([color,label])=>`<span class="calendar-key"><i class="key-${color}"></i>${label}</span>`).join('');
}

function renderLists(){
  const groups=[['Sì / No','Campi di controllo',LISTS.yesNo],['Stato richiesta','Richiesta trasferta',LISTS.requestStatus],['Stato auto','Prenotazione auto',LISTS.carStatus],['Stato autorizzazione','Chiusura documentale',LISTS.authorization],['Mesi','Selettore calendario',MONTHS]];
  el.referenceLists.innerHTML=groups.map(([title,subtitle,values])=>`<article class="reference-card"><h3>${title}</h3><p>${subtitle}</p><div class="reference-pills">${values.map(value=>`<span class="reference-pill">${value}</span>`).join('')}</div></article>`).join('');
}
function renderAll(){renderDashboard();renderTrips();renderCalendar();renderLists()}

const titles={dashboard:'Riepilogo',calendar:'Calendario',trips:'Trasferte',lists:'Liste'};
function go(screen){
  document.querySelectorAll('.screen').forEach(node=>node.classList.toggle('active',node.id===screen));
  document.querySelectorAll('.nav-button').forEach(node=>node.classList.toggle('active',node.dataset.go===screen));
  el.pageTitle.textContent=titles[screen]||'Gestione Trasferte';window.scrollTo({top:0,behavior:'smooth'});
  if(screen==='calendar')renderCalendar();if(screen==='trips')renderTrips();
}

function populateFormSelects(){
  setOptions(el.requestStatus,LISTS.requestStatus);setOptions(el.carStatus,LISTS.carStatus);setOptions(el.onlineReceipts,LISTS.yesNo);
  setOptions(el.authorization,LISTS.authorization);[el.printedForm,el.digitalCopy,el.singleFile,el.companyEmail,el.dataManagementPackage].forEach(select=>setOptions(select,LISTS.yesNo));
  el.statusFilter.innerHTML='<option value="">Tutti gli stati</option>'+OVERALL_STATUSES.map(status=>`<option>${status}</option>`).join('');
}
function formTrip(){return{
  id:Number(el.editTripId.value)||null,destination:el.destination.value.trim(),departureDate:el.departureDate.value,returnDate:el.returnDate.value,
  requestStatus:el.requestStatus.value,requestInsertedDate:el.requestInsertedDate.value,flight:el.flight.value.trim(),hotel:el.hotel.value.trim(),
  flightCode:el.flightCode.value.trim(),carStatus:el.carStatus.value,onlineReceipts:el.onlineReceipts.value,authorization:el.authorization.value,
  printedForm:el.printedForm.value,digitalCopy:el.digitalCopy.value,singleFile:el.singleFile.value,companyEmail:el.companyEmail.value,
  dataManagementPackage:el.dataManagementPackage.value,notes:el.notes.value.trim()
}}
function updateFormPreview(){
  const trip=formTrip();const deadline=addDays(trip.departureDate,-14),alert=requestAlert(trip),pct=Math.round(completion(trip)*100),status=overallStatus(trip);
  el.requestDeadline.value=deadline;el.requestAlert.value=alert;el.previewCompletion.textContent=`${pct}%`;el.previewProgress.style.width=`${pct}%`;el.previewOverallStatus.textContent=status||'—';
}
function openTripSheet(id=null){
  el.tripForm.reset();el.formMessage.textContent='';el.editTripId.value='';el.deleteTripButton.classList.add('hidden');el.tripSheetEyebrow.textContent='NUOVA TRASFERTA';el.requestStatus.value='Da inserire';
  if(id!==null){
    const trip=state.trips.find(item=>Number(item.id)===Number(id));if(!trip)return;
    el.editTripId.value=trip.id;el.tripSheetEyebrow.textContent=`TRASFERTA ${trip.id}`;el.deleteTripButton.classList.remove('hidden');
    ['destination','departureDate','returnDate','requestStatus','requestInsertedDate','flight','hotel','flightCode','carStatus','onlineReceipts','authorization','printedForm','digitalCopy','singleFile','companyEmail','dataManagementPackage','notes'].forEach(key=>{el[key].value=trip[key]||''});
  }
  updateFormPreview();el.modalBackdrop.classList.remove('hidden');el.tripSheet.classList.remove('hidden');document.body.style.overflow='hidden';setTimeout(()=>el.destination.focus(),80);
}
function closeTripSheet(){el.modalBackdrop.classList.add('hidden');el.tripSheet.classList.add('hidden');document.body.style.overflow=''}
window.editTrip=id=>openTripSheet(id);

el.tripForm.addEventListener('input',updateFormPreview);
el.tripForm.addEventListener('submit',event=>{
  event.preventDefault();const trip=formTrip();el.formMessage.textContent='';
  if(!trip.destination||!trip.departureDate||!trip.returnDate){el.formMessage.textContent='Compila destinazione, data di partenza e data di rientro.';return}
  if(trip.returnDate<trip.departureDate){el.formMessage.textContent='La data di rientro non può precedere la partenza.';return}
  if(trip.id){const index=state.trips.findIndex(item=>Number(item.id)===trip.id);if(index<0)return;state.trips[index]=trip;showToast('Trasferta aggiornata')}
  else{trip.id=Math.max(0,...state.trips.map(item=>Number(item.id)||0))+1;state.trips.push(trip);showToast('Trasferta aggiunta')}
  saveState();closeTripSheet();go('trips');
});
el.deleteTripButton.addEventListener('click',()=>{
  const id=Number(el.editTripId.value);if(!id||!confirm(`Eliminare la trasferta ${id}?`))return;
  state.trips=state.trips.filter(item=>Number(item.id)!==id);saveState();closeTripSheet();showToast('Trasferta eliminata');
});

function stepMonth(delta){let month=Number(state.calendar.month)+delta,year=Number(state.calendar.year);if(month<0){month=11;year--}if(month>11){month=0;year++}state.calendar={month,year};saveState()}
function showToast(message){el.toast.textContent=message;el.toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.toast.classList.remove('show'),2200)}
function download(name,text,type='text/plain;charset=utf-8'){const blob=new Blob([text],{type}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),500)}
function csvCell(value){return`"${String(value??'').replaceAll('"','""')}"`}
function exportCsv(){
  const headers=['ID','Destinazione / Commessa','Data partenza','Data rientro','Scadenza richiesta','Richiesta trasferta','Data inserimento','Alert richiesta','Volo','Hotel richiesto','CODICE VOLO','Auto','Giustificativi online','Autorizzazione','Modulo stampato','Copia digitale','File unico creato','Email azienda','Plico a Datamanagement','% chiusura','Stato complessivo','Note'];
  const rows=state.trips.map(computed).sort(sortByDeparture).map(t=>[t.id,t.destination,t.departureDate,t.returnDate,t.requestDeadline,t.requestStatus,t.requestInsertedDate,t.alert,t.flight,t.hotel,t.flightCode,t.carStatus,t.onlineReceipts,t.authorization,t.printedForm,t.digitalCopy,t.singleFile,t.companyEmail,t.dataManagementPackage,`${Math.round(t.completion*100)}%`,t.overallStatus,t.notes]);
  download('gestione-trasferte.csv','\uFEFF'+[headers,...rows].map(row=>row.map(csvCell).join(';')).join('\n'),'text/csv;charset=utf-8');
}

document.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>go(button.dataset.go)));
document.querySelectorAll('[data-open-trip]').forEach(button=>button.addEventListener('click',()=>openTripSheet()));
$('closeTripSheet').addEventListener('click',closeTripSheet);el.modalBackdrop.addEventListener('click',closeTripSheet);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!el.tripSheet.classList.contains('hidden'))closeTripSheet()});
el.tripSearch.addEventListener('input',renderTrips);el.statusFilter.addEventListener('change',renderTrips);
el.calendarMonth.addEventListener('change',()=>{state.calendar.month=Number(el.calendarMonth.value);saveState()});
el.calendarYear.addEventListener('change',()=>{state.calendar.year=Number(el.calendarYear.value);saveState()});
$('prevMonth').addEventListener('click',()=>stepMonth(-1));$('nextMonth').addEventListener('click',()=>stepMonth(1));
$('calendarToday').addEventListener('click',()=>{const now=new Date();state.calendar={month:now.getMonth(),year:now.getFullYear()};saveState()});
$('exportBackup').addEventListener('click',()=>download('gestione-trasferte-backup.json',JSON.stringify(state,null,2),'application/json'));
$('importBackup').addEventListener('change',async event=>{
  try{const file=event.target.files[0];if(!file)return;const imported=JSON.parse(await file.text());if(!imported||!Array.isArray(imported.trips))throw new Error();state={version:1,trips:imported.trips,calendar:imported.calendar||state.calendar};saveState();showToast('Backup importato')}
  catch{alert('Il file selezionato non è un backup valido.')}event.target.value='';
});
$('exportCsv').addEventListener('click',exportCsv);
$('resetData').addEventListener('click',()=>{if(!confirm('Ripristinare i dati iniziali del foglio Excel? I dati attuali verranno sostituiti.'))return;state=initialState();saveState();showToast('Dati iniziali ripristinati')});

el.todayLabel.textContent=new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
populateFormSelects();renderAll();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
