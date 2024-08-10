#if TEST
using System.Collections;
using System.Collections.Generic;
using UnityEngine;



namespace until.develop
{
    public class DevelopIndicatorFrameCounter : DevelopIndicatorElement
    {
        public string DevelopIndicatorText => _DisplayText;
        public int DevelopIndicatorWidth => 200;
        public int DevelopIndicatorHeight => 20;

        private string _DisplayText = "";
        private int _Count = 0;

        public void onIndicatorUpdate()
        {
            _DisplayText = $"[FrameCounter] {_Count}";
            ++_Count;
        }
    }
}
#endif
