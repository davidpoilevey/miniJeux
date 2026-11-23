/* La Bibliothèque — petits comportements (le site reste lisible sans JavaScript) */
(function () {
  // Vitrine : un texte tiré au hasard à chaque visite
  var carte = document.querySelector('[data-vitrine]');
  var data = document.getElementById('catalogue');
  if (carte && data) {
    try {
      var liste = JSON.parse(data.textContent);
      var t = liste[Math.floor(Math.random() * liste.length)];
      carte.href = t.u;
      carte.style.setProperty('--teinte', t.c);
      carte.querySelector('.vitrine-titre').textContent = t.t;
      carte.querySelector('.vitrine-date').textContent = t.d;
      carte.querySelector('.vitrine-accroche').textContent = t.a;
    } catch (e) {}
  }

  // Sas de la Réserve
  var entrer = document.querySelector('[data-entrer]');
  if (entrer) entrer.addEventListener('click', function () {
    try { localStorage.setItem('biblio-majeur', '1'); } catch (e) {}
    document.documentElement.classList.remove('verrou');
  });

  // Partager l'adresse du texte
  function toast(msg) {
    var d = document.createElement('div'); d.className = 'toast'; d.textContent = msg;
    document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2200);
  }
  var bouton = document.querySelector('[data-partager]');
  if (bouton) bouton.addEventListener('click', function () {
    var url = location.href.split('#')[0];
    if (navigator.share) {
      navigator.share({ title: document.title, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { toast('Lien copié'); }, function () { prompt('Adresse du texte :', url); });
    } else { prompt('Adresse du texte :', url); }
  });

  // Barre de progression de lecture
  var barre = document.querySelector('.progression span');
  if (barre) {
    var maj = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      barre.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + '%';
    };
    addEventListener('scroll', maj, { passive: true }); maj();
  }
})();
