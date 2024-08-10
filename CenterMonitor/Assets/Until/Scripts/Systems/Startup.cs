using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using UnityEngine;
using until.develop;


namespace until.system
{
    public class Startup
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        public static void onApplicationStart()
        {
            Log.info(nameof(Startup), "onApplicationStart - begin");
            onApplicationStartSystem();
            onApplicationStartDevelop();
            Log.info(nameof(Startup), "onApplicationStart - end");
        }

        private static void onApplicationStartSystem()
        {
            SingletonBase.createAllSingleton();

            var SystemObject = GameObject.Instantiate(Resources.Load(defines.Resources.SystemContainer));
            GameObject.DontDestroyOnLoad(SystemObject);
        }

        [Conditional("TEST")]
        private static void onApplicationStartDevelop()
        {
            var DevelopObject = GameObject.Instantiate(Resources.Load(defines.Resources.DevelopContainer));
            GameObject.DontDestroyOnLoad(DevelopObject);
        }
    }
}

