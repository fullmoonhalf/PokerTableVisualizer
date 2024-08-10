using System;
using System.Collections.Generic;
using UnityEngine;
using until.develop;
using until.utils;
using until.system;


namespace until.system
{
    [DisallowMultipleComponent]
    public class ModeManager : Singleton<ModeManager>
#if TEST
        , DevelopIndicatorElement
#endif
    {
        #region Definitions.
        public enum Phase
        {
            Wait,
            ModeInit,
            ModeUpdate,
            ModeExit,
        }
        #endregion

        #region Properties.
        public Phase CurrentPhase { get; private set; } = Phase.Wait;
        private Mode CurrentMode = null;
        private Mode NextMode = null;
#if TEST
        private Mode PreviousMode = null;
#endif
        #endregion

        #region Fields.
        #endregion

        #region Methods.
        #region Singleton
        public override void onSingletonAwake()
        {
            var mode_list = typeof(BootMode).getImplementedClasses();
            Mode candidate = null;
#if TEST
            Mode test_candidate = null;
#endif
            foreach (var mode_type in mode_list)
            {
                if (Activator.CreateInstance(mode_type) is Mode mode)
                {
#if TEST
                    if (mode_type.FullName.StartsWith("until.test."))
                    {
                        test_candidate = mode;
                    }
                    else
#endif
                    {
                        candidate = mode;
                        break;
                    }
                }
            }
            CurrentMode = candidate;
#if TEST
            if (CurrentMode == null)
            {
                CurrentMode = test_candidate;
            }
#endif
        }

        public override void onSingletonStart()
        {
        }

        public override void onSingletonDestroy()
        {
        }
        #endregion

        #region Process Control
        // Update is called once per frame
        public void onUpdate()
        {
            switch (CurrentPhase)
            {
                case Phase.Wait:
                    if (CurrentMode != null)
                    {
                        transit(Phase.ModeInit);
                    }
                    break;
                case Phase.ModeInit:
                    if (CurrentMode.init() == Mode.Control.Done)
                    {
                        transit(Phase.ModeUpdate);
                    }
                    break;
                case Phase.ModeUpdate:
                    if (CurrentMode.update() == Mode.Control.Done)
                    {
                        transit(Phase.ModeExit);
                    }
                    break;
                case Phase.ModeExit:
                    if (CurrentMode.exit() == Mode.Control.Done)
                    {
#if TEST
                        PreviousMode = CurrentMode;
#endif
                        CurrentMode = NextMode;
                        NextMode = null;
                        if (CurrentMode != null)
                        {
                            transit(Phase.ModeInit);
                        }
                        else
                        {
                            transit(Phase.Wait);
                        }
                    }
                    break;
            }
        }
        #endregion

        #region PhaseControl.
        private void transit(Phase NextPhase)
        {
            Log.info(this, $"Change Phase {CurrentPhase} => {NextPhase}");
            switch (NextPhase)
            {
                case Phase.ModeInit:
                    Log.info(this, $"mode '{CurrentMode.GetType().FullName}' is starting.");
                    break;
            }
            CurrentPhase = NextPhase;


        }
        #endregion

        #region requests.
        public void enqueueNextMode<T>() where T : Mode, new()
        {
            Log.info(this, $"enqueueNextMode {typeof(T).Name}");
            NextMode = new T();
        }
        #endregion
        #endregion

        #region Tests.
#if TEST
        #region Indicator
        public string DevelopIndicatorText => _DevelopIndicatorText;
        public int DevelopIndicatorWidth => 300;
        public int DevelopIndicatorHeight => 20;
        private string _DevelopIndicatorText = "";

        public void onIndicatorUpdate()
        {
            var curr = CurrentMode?.GetType().Name ?? "(empty)";
            _DevelopIndicatorText = $"[Mode] {curr}.{CurrentPhase}";
        }
        #endregion
#endif
        #endregion
    }
}
