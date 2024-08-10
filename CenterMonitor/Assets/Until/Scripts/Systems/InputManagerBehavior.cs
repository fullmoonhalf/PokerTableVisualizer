using System.Collections;
using System.Collections.Generic;
using UnityEngine;



namespace until.system
{
    [DefaultExecutionOrder(until.system.settings.UntilBehaviorOrder.System_InputManagerBehavior)]
    public class InputManagerBehavior : Behavior
    {
        // Update is called once per frame
        void Update()
        {
            Singleton.InputManager.onUpdate();
        }
    }
}

