// Maintenance Carbonifère 14 uniquement. Sauvegarder avant application.
// Conserve les trois enregistrements d'origine, puis demande un nouveau départ.
migrate((app) => {
  const originals = {
    pangee: 'xalboct8hv629k7',
    gondwana: '4l24wxqejqlbx0b',
    laurasie: 'gbckicczb9kyd1b',
  };
  // Vérifier toutes les cibles avant toute suppression.
  for (const worldId of Object.keys(originals)) {
    const rec = app.findRecordById('carbonifere14', originals[worldId]);
    if (rec.getString('worldId') !== worldId) throw new Error('Monde original incorrect: ' + worldId);
  }
  app.db().newQuery('DELETE FROM carbonifere14_commands').execute();
  app.db().newQuery('DELETE FROM carbonifere14_likes').execute();
  for (const rec of app.findAllRecords('carbonifere14')) {
    if (originals[rec.getString('worldId')] !== rec.id) app.delete(rec);
  }
  for (const name of ['carbonifere14', 'carbonifere14_commands', 'carbonifere14_likes']) {
    const collection = app.findCollectionByNameOrId(name);
    collection.fields.add(new AutodateField({ name: 'created', onCreate: true }));
    collection.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }));
    if (name === 'carbonifere14') {
      collection.fields.add(new TextField({ name: 'lastLikeSyncISO' }));
      collection.addIndex('idx_c14_world_unique', true, 'worldId', '');
    }
    app.save(collection);
  }
  for (const worldId of Object.keys(originals)) {
    const command = new Record(app.findCollectionByNameOrId('carbonifere14_commands'));
    command.set('worldId', worldId);
    command.set('type', 'resetWorld');
    app.save(command);
  }
});
