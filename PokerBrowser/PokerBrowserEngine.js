var PokerBrowser = PokerBrowser || {};
PokerBrowser.engine = PokerBrowser.engine || (function(){
	var version = 1.00;

	// ---------------------------------------------------------------------
	// engine オブジェクト
	// ---------------------------------------------------------------------
	var engine = {
		Manager: null,
		init : function()
		{
			console.log("ok");
		},
	};
	
	return engine;
})();

(function(){
	if(document.readyState === "loading")
	{
		document.addEventListener("DOMContentLoaded", PokerBrowser.engine.init);
	}
	else
	{
		PokerBrowser.engine.init();
	}
})();