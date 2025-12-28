(function (ns) {
	if(	ns.Engine )
	{
		return;
	}
	ns.version = 1.00;
	ns.Engine = new Monitor.cEngine();
})(Monitor = Monitor || {});


(function(){
	if(document.readyState === "loading")
	{
		document.addEventListener("DOMContentLoaded", PokerBrowser.engine.init.bind(Monitor.Engine));
	}
	else
	{
		Monitor.Engine.init();
	}
})();