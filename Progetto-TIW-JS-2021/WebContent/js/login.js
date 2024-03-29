/**
 * Login: Script relativo alla pagina di login per Progetto-TIW-JS-2021
 */

(function() {	// Nasconde le variabli dallo scope globale

	document.getElementById("bottoneLogin").addEventListener("click", (e) => {
		var form = e.target.closest("form");
		var messaggio = document.getElementById("erroreLogin");
		if(form.checkValidity()) {
			makeCall("POST", "ControllaLogin", new FormData(form), messaggio, function(req) {
				var utente = JSON.parse(req.responseText);
				window.sessionStorage.setItem(SESSIONE_UTENTE, JSON.stringify(utente));
				window.sessionStorage.setItem(SESSIONE_VISUALIZZATI, JSON.stringify(new Array()));
				window.location.href = "home.html";
			}, null, true);
		}
		else
			form.reportValidity();
	});
	
})();
