using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using until.system;
using until.utils;
using until.develop;


namespace until.modules.camera
{
    public class CameraActionFree : CameraAction
    {
        public Vector3 Position { get; private set; } = Vector3.zero;
        public Quaternion Rotation { get; private set; } = Quaternion.identity;
        public float FoV => 60.0f;
        public bool Orthographic => false;

        public void onSwitchingStart(CameraActionArgument argument)
        {
            Position = Singleton.CameraManager.Position;
            Rotation = Singleton.CameraManager.Rotation;
        }
        public void onSwitchingEnd()
        {
        }
        public void onReplacedStart()
        {
        }
        public void onReplacedEnd()
        {
        }
        public void onUpdate(float deltaTime)
        {
            var speed = 1.0f;
            if (Singleton.InputManager.isDown(InputPad.Player1, InputButton.R1))
            {
                speed *= 5.0f;
            }
            else if (Singleton.InputManager.isDown(InputPad.Player1, InputButton.L1))
            {
                speed *= 0.2f;
            }

            var stickL = Singleton.InputManager.getStick(InputPad.Player1, InputStickType.L);
            var Ydirection = Singleton.InputManager.isDown(InputPad.Player1, InputButton.L2) ? Vector3.forward : Vector3.up;
            var move = Rotation * Vector3.right * stickL.X + Rotation * Ydirection * stickL.Y;
            Position += move * deltaTime * speed;

            var stickR = Singleton.InputManager.getStick(InputPad.Player1, InputStickType.R);
            var eularAngle = Rotation.eulerAngles;
            eularAngle.y = math.getDegreeArgument(eularAngle.y + stickR.X * 90 * deltaTime);
            eularAngle.x = Mathf.Clamp(eularAngle.x - stickR.Y * 90 * deltaTime, -80.0f, 80.0f);
            Rotation = Quaternion.Euler(eularAngle);
        }
    }
}

