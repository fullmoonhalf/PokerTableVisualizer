var PokerTableMonitor = PokerTableMonitor || {};
PokerTableMonitor.engine = (function(){{
    var version = 0.00;
    var UUID_SERVICE = "cbaabb28-4e81-49c4-b775-aedfd27d8db0";
    var UUID_CHARACTERISTIC = "45f116ee-b087-4271-888d-a15eebebd2eb";
    var DOCUMENT_CLASS_CARDS = "test_card";
    var DOCUMENT_CLASS_CARDS_SELECTED = "test_card_selected";
    var DOCUMENT_CLASS_CARDS_UNSELECTED = "test_card_unselected";



    //
    // engine
    //
    var engine = {
        init : function()
        {
            console.log("PokerTableMonitor init");
            PokerTableMonitor.engine.reset_cards()
            document.querySelector('button').addEventListener('click', 
                async () => {
                    try {
                      const device = await navigator.bluetooth.requestDevice({
                        filters: [
                          {services: [UUID_SERVICE]},
                          { namePrefix : ['PTV_PP_'], }
                        ]
                      })
                      .then(device => {
                        console.log('selected device:', device.name);
                        return device.gatt.connect()
                      })
                      .then(server => {
                        console.log("getPrimaryService")
                        service = server.getPrimaryService(UUID_SERVICE)
                        console.log("getPrimaryService - done")
                        return service
                      })
                      .then(service => {
                        console.log("getCharacteristic")
                        characteristic = service.getCharacteristic(UUID_CHARACTERISTIC)
                        console.log("getCharacteristic - done")
                        return characteristic
                      })
                      .then(characteristic => {
                        characteristic.addEventListener('characteristicvaluechanged', event => {
                            let characteristic = event.target;
                            const decoder = new TextDecoder('utf-8')
                            const str = decoder.decode(characteristic.value)
                            console.log("receive", str);
                            const status = str.split(':');
                            if(status[0]=="cards")
                            {
                              let scanned = {}
                              const scanned_raw = status[1].split(",")
                              for (let i = 0; i < scanned_raw.length; i++) {
                                const key = "c" + scanned_raw[i]
                                scanned[key] = true
                              }
                              PokerTableMonitor.engine.reset_cards()
                              const cards = document.getElementsByClassName( DOCUMENT_CLASS_CARDS );
                              for (let i = 0; i < cards.length; i++) {
                                let card = cards[i]
                                if(card.id in scanned)
                                {
                                  card.classList.add(DOCUMENT_CLASS_CARDS_SELECTED)
                                }
                              }
                            }
                        });
                        characteristic.startNotifications()
                        .catch(error => {
                          console.error(error)
                        })
                       })
                      .catch(error => console.log(error));
                    } catch(error) {
                      console.log('select device failure: ', error);
                    }      
                }
            );
        },

        reset_cards : function()
        {
          const valid_cards = document.getElementsByClassName( DOCUMENT_CLASS_CARDS );
          for (let i = 0; i < valid_cards.length; i++) {
            let card = valid_cards[i]
            card.classList.add(DOCUMENT_CLASS_CARDS_UNSELECTED)
            card.classList.remove(DOCUMENT_CLASS_CARDS_SELECTED)
          }
        }
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