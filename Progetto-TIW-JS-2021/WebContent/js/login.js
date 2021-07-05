/**
 * Login
 */

(function() {	// Nasconde le variabli dallo scope globale

	document.getElementById("bottoneLogin").addEventListener("click", (e) => {
		var form = e.target.closest("form");
		var messaggio = document.getElementById("erroreLogin");
		if(form.checkValidity()) {
			// AGGIUNGERE controlli aggiuntivi
			makeCall("POST", "ControllaLogin", new FormData(form), messaggio, function(req) {
				var utente = JSON.parse(req.responseText);
				sessionStorage.setItem(SESSIONE_UTENTE, JSON.stringify(utente));
				window.location.href = "home.html";
			});
		}
		else
			form.reportValidity();
	});
	
})();
