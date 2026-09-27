async function createEvent(e){
  e.preventDefault();
  var f = new FormData(e.target);
  await guarded(async function(){
    await api.createEvent({ title: f.get('title'), type: f.get('type'), date: f.get('date'), description: f.get('description') });
    showToast('Event created.');
    await renderContentOnly();
  });
  return false;
}
async function rsvpEvent(id){
  await guarded(async function(){
    await api.rsvpEvent(id);
    await renderContentOnly();
  });
}
