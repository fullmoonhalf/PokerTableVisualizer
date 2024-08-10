#if TEST
using System.Collections;
using System.Collections.Generic;
using UnityEngine;



namespace until.develop
{
    public class DevelopIndicatorFrameProfile : DevelopIndicatorElement
    {
        public string DevelopIndicatorText => _DisplayText;
        public int DevelopIndicatorWidth => 200;
        public int DevelopIndicatorHeight => 20;

        private string _DisplayText = "";

        public void onIndicatorUpdate()
        {
            var elapsed = Time.deltaTime;
            var fps = 1.0 / elapsed;
            elapsed *= 1000;
            _DisplayText = $"[FrameProfile] {elapsed:F2}ms {fps:F1}fps";

        }
    }
}
#endif
