using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using until.system;
using until.develop;


namespace until.modules.camera
{
    public class CameraManager : Singleton<CameraManager>
#if TEST
        , DevelopIndicatorElement
#endif
    {
        #region Field.
        /// <summary>åªç›à íuéÊìæ</summary>
        public Vector3 Position
        {
            get
            {
                return (RefCameraController != null) ? RefCameraController.Position : Vector3.zero;
            }
        }
        /// <summary>åªç›å¸Ç´éÊìæ</summary>
        public Quaternion Rotation
        {
            get
            {
                return (RefCameraController != null) ? RefCameraController.Rotation : Quaternion.identity;
            }
        }

        private CameraController RefCameraController = null;
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

        #region manamgement
        public void regist(CameraController camera)
        {
            RefCameraController = camera;
        }

        public void unregist(CameraController camera)
        {
            RefCameraController = null;
        }
        #endregion

        #region Request.
        /// <summary>
        /// ÉJÉÅÉâëJà⁄
        /// </summary>
        /// <param name="nextAction"></param>
        /// <param name="interpolation"></param>
        public void transitCamera<T>(float interpolation = 0.0f, CameraActionArgument argument = null) where T : CameraAction, new()
        {
            if (RefCameraController != null)
            {
                Log.info(this, $"{nameof(transitCamera)} {typeof(T).FullName}");
                var nextAction = new T();
                RefCameraController.transitCamera(nextAction, interpolation, argument);
            }
#if TEST
            else
            {
                Log.error(this, $"{nameof(transitCamera)} {typeof(T).FullName} switch failure (CameraController is not found.)");
            }
#endif
        }
        #endregion

#if TEST
        #region Indicator
        public string DevelopIndicatorText => _DevelopIndicatorText;
        public int DevelopIndicatorWidth => 300;
        public int DevelopIndicatorHeight => 40;
        private string _DevelopIndicatorText = "";

        public void onIndicatorUpdate()
        {
            var action = RefCameraController?.CurrentAction?.GetType().Name ?? "(not exist)";
            var position = RefCameraController?.Position ?? Vector3.zero;
            _DevelopIndicatorText = $"[Camera] screen={Screen.width}x{Screen.height} {action}\nposition={position}";
        }
        #endregion
#endif
    }
}


