var PokerTableMonitor = PokerTableMonitor || {};
PokerTableMonitor.engine = (function(){{
    var version = 0.00;
    //
    // engine
    //
    var engine = {
        init : function()
        {
            console.log("PokerTableMonitor init");
            document.querySelector('button').addEventListener('click', 
                async () => {
                    try {
                      const device = await navigator.bluetooth.requestDevice({
                        filters: [
                            { namePrefix : ['PTV_PP_001'], }
                        ]
                      })
                      .then(device => device.gatt.connect())
                      .then(server => {
                        console.log("getPrimaryService")
                        server.getPrimaryService("cbaabb28-4e81-49c4-b775-aedfd27d8db0")
                        console.log("getPrimaryService - done")
                      })
                      .then(service => {
                        console.log("getCharacteristic")
                        service.getCharacteristic("45f116ee-b087-4271-888d-a15eebebd2eb")
                        console.log("getCharacteristic - done")
                      })
                      .then(characteristic => {
                        characteristic.addEventListener('characteristicvaluechanged', event => {
                            let characteristic = event.target;
                            console.log("receive", characteristic.value);
                        });
                       })
                      .catch(error => console.log(error));
                      console.log('selected device:', device.name);
                    } catch(error) {
                      console.log('select device failure: ', error);
                    }      
                }
            );
        },
    };
    return engine;
}})();

(function(){
    if(document.readyState === "loading")
    {
        document.addEventListener("DOMContentLoaded", PokerTableMonitor.engine.init);


    }
    else
    {
        PokerTableMonitor.engine.init();
    }
})();