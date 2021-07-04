/**
 * Login
 */

(function() {	// Nasconde le variabli dallo scope globale

	document.getElementById("bottoneLogin").addEventListener("click", (e) => {
		var form = e.target.closest("form");
		if(form.checkValidity()) {
			// AGGIUNGERE controlli aggiuntivi
			makeCall("POST", "ControllaLogin", new FormData(form), function(req) {
				if(req.readyState == XMLHttpRequest.DONE) {
					if(req.status == HTTP_CODES.success) {
						var utente = JSON.parse(req.responseText);
						sessionStorage.setItem(SESSIONE_UTENTE, JSON.stringify(utente));
						window.location.href = "home.html";
					}
					else
						document.getElementById("erroreLogin").textContent = req.responseText;
				}
			});
		}
		else
			form.reportValidity();
	});
	
})();