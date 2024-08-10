using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;



namespace until.system
{
    #region Definitions.
    [Flags]
    public enum InputButton
    {
        LUp = 1 << 0,
        LDown = 1 << 1,
        LRight = 1 << 2,
        LLeft = 1 << 3,
        RUp = 1 << 4,
        RDown = 1 << 5,
        RRight = 1 << 6,
        RLeft = 1 << 7,
        R1 = 1 << 8,
        R2 = 1 << 9,
        R3 = 1 << 10,
        L1 = 1 << 11,
        L2 = 1 << 12,
        L3 = 1 << 13,
        Start = 1 << 14,
        Select = 1 << 15,
        None = 0,
    }

    public enum InputPad
    {
        Player1,
    }

    public class InputStick
    {
        public float X;
        public float Y;
        public float Power;
    }

    public enum InputStickType
    {
        L,
        R,
    }
    #endregion
}
