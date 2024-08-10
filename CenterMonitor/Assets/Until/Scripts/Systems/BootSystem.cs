using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using until.develop;


namespace until.system
{
    public class BootSystem : Singleton<BootSystem>
    {
        #region Definitions.
        public enum Phase
        {
            None,
            SystemOnWork,
        }
        #endregion

        #region Properties.
        public Phase CurrentPhase { get; private set; } = Phase.None;
        public uint FrameCount = 0;
        #endregion

        #region Singleton
        public override void onSingletonAwake()
        {
        }

        public override void onSingletonStart()
        {
        }

        public override void onSingletonDestroy()
        {
        }
        #endregion

        #region Process Control
        public void onUpdate()
        {
            ++FrameCount;

            switch (CurrentPhase)
            {
                case Phase.None:
                    transit(Phase.SystemOnWork);
                    break;
                case Phase.SystemOnWork:
                    break;
            }
        }

        private void transit(Phase NextPhase)
        {
            Log.info(this, $"transit {CurrentPhase} -> {NextPhase}");
            CurrentPhase = NextPhase;
        }
        #endregion
    }
}

