/**
 * Login: Script relativo alla pagina di login per Progetto-TIW-JS-2021
 */

(function() {	// Nasconde le variabli dallo scope globale

	document.getElementById("bottoneLogin").addEventListener("click", (e) => {
		var form = e.target.closest("form");
		var messaggio = document.getElementById("erroreLogin");
		if(form.checkValidity()) {
			makeCall("POST", "ControllaLogin", new FormData(form), messaggio, function(req) {
				let utente = JSON.parse(req.responseText);
				window.sessionStorage.setItem(SESSIONE_UTENTE, JSON.stringify(utente));
				window.location.href = "home.html";
			});
		}
		else
			form.reportValidity();
	});
	
})();
