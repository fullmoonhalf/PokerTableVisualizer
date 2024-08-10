using System.Collections;
using System.Collections.Generic;
using UnityEngine;


namespace until.system
{
    [DefaultExecutionOrder(until.system.settings.UntilBehaviorOrder.System_BootSystemBehavior)]
    public class BootSystemBehavior : Behavior
    {
        // Update is called once per frame
        void Update()
        {
            Singleton.BootSystem.onUpdate();
        }
    }
}

