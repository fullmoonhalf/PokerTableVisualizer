using System.Collections;
using System.Collections.Generic;
using UnityEngine;



namespace until.system
{
    [DefaultExecutionOrder(until.system.settings.UntilBehaviorOrder.System_GameObjectManagementBehavior)]
    public class GameObjectManagementBehavior : Behavior
    {
        void Update()
        {
            Singleton.SceneLoader.onUpdate();
            Singleton.PrefabInstantiateMediator.onUpdate();
            Singleton.GameObjectControlMediator.onUpdate();
        }
    }
}

