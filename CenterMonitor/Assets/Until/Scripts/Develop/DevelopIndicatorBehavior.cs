#if TEST
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using until.system;
using until.system.defines;


namespace until.develop
{
    [DefaultExecutionOrder(until.system.settings.UntilBehaviorOrder.Develop_DevelopIndicatorBehavior)]
    public class DevelopIndicatorBehavior : Behavior
    {
        private void Update()
        {
            Singleton.DevelopIndicator.update();
        }

        // デバッグ描画
        private void OnGUI()
        {
            Singleton.DevelopIndicator.draw(new RectInt(0, 0, Screen.width, Screen.height));
        }
    }
}
#endif
