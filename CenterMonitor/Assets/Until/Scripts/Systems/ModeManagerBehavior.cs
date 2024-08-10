using System.Collections;
using System.Collections.Generic;
using UnityEngine;


namespace until.system
{
    [DefaultExecutionOrder(until.system.settings.UntilBehaviorOrder.System_ModeManagerBehavior)]
    public class ModeManagerBehavior : Behavior
    {
        // Update is called once per frame
        void Update()
        {
            Singleton.ModeManager.onUpdate();
        }
    }
}

