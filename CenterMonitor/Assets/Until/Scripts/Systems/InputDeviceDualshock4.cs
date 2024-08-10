using UnityEngine;
using UnityEngine.InputSystem;


namespace until.system
{
    public class InputDeviceDualshock4 : InputDevice
    {
        #region Define
        public readonly float StickThreadold = 0.10f;
        #endregion


        #region Methods.
        public InputButton getButton()
        {
            var button = InputButton.None;
            var pad = Gamepad.current;
            if (pad != null)
            {
                if (pad.dpad.left.isPressed) button |= InputButton.LLeft;
                if (pad.dpad.right.isPressed) button |= InputButton.LRight;
                if (pad.dpad.up.isPressed) button |= InputButton.LDown;
                if (pad.dpad.down.isPressed) button |= InputButton.LUp;
                if (pad.buttonWest.isPressed) button |= InputButton.RLeft;
                if (pad.buttonSouth.isPressed) button |= InputButton.RDown;
                if (pad.buttonEast.isPressed) button |= InputButton.RRight;
                if (pad.buttonNorth.isPressed) button |= InputButton.RUp;
                if (pad.leftShoulder.isPressed) button |= InputButton.L1;
                if (pad.leftTrigger.isPressed) button |= InputButton.L2;
                if (pad.leftStickButton.isPressed) button |= InputButton.L3;
                if (pad.rightShoulder.isPressed) button |= InputButton.R1;
                if (pad.rightTrigger.isPressed) button |= InputButton.R2;
                if (pad.rightStickButton.isPressed) button |= InputButton.R3;
                if (pad.startButton.isPressed) button |= InputButton.Start;
                if (pad.selectButton.isPressed) button |= InputButton.Select;
            }
            return button;
        }

        public InputStick getRStick()
        {
            var StickData = new InputStick();
            var pad = Gamepad.current;
            if (pad != null)
            {
                var value = pad.rightStick.ReadValue();
                StickData.X = value.x;
                StickData.Y = value.y;
                StickData.Power = value.magnitude;
            }
            return StickData;
        }

        public InputStick getLStick()
        {
            var StickData = new InputStick();
            var pad = Gamepad.current;
            if (pad != null)
            {
                var value = pad.leftStick.ReadValue();
                StickData.X = value.x;
                StickData.Y = value.y;
                StickData.Power = value.magnitude;
            }
            return StickData;
        }
        #endregion
    }
}

