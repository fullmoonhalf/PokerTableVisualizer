using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;

namespace until.system
{
    public class RandomizerManager : Singleton<RandomizerManager>
    {

        #region Definitions
        private class UnityRandomizer : Randomizer
        {
            public float getFloat()
            {
                return UnityEngine.Random.value;
            }

            public int getInt(int min, int max)
            {
                var gap = Math.Abs(max - min) + 1;
                var rand = UnityEngine.Random.value * gap + min;
                return (int)Math.Clamp(rand, min, max);
            }
        }
        #endregion

        #region Fields.
        private Randomizer _GlobalRandomizer = null;
        #endregion

        #region Methods
        #region RandomizerManager
        /// <summary>
        /// グローバルランダマイザから float[0.0-1.0] 値を取得
        /// </summary>
        /// <returns></returns>
        public float getGlobalFloat()
        {
            return _GlobalRandomizer.getFloat();
        }

        /// <summary>
        /// グローバルランダマイザから int 値を取得
        /// </summary>
        /// <param name="min"></param>
        /// <param name="max"></param>
        /// <returns></returns>
        public int getGlobalInt(int min, int max)
        {
            return _GlobalRandomizer.getInt(min, max);
        }
        #endregion


        #region Singleton
        public override void onSingletonAwake()
        {
        }

        public override void onSingletonStart()
        {
            UnityEngine.Random.InitState(System.DateTime.Now.Millisecond);
            _GlobalRandomizer = new UnityRandomizer();
        }

        public override void onSingletonDestroy()
        {
        }
        #endregion
        #endregion
    }
}
