using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using until.develop;
using until.system;


namespace until.system
{
    [DisallowMultipleComponent]
    public class SceneLoader : Singleton<SceneLoader>
#if TEST
        , DevelopIndicatorElement
#endif
    {
        #region Definition
        public enum Target
        {
            Unload,
            Active,
        }
        #endregion

        #region Properties.
        #endregion

        #region Member.
        private SceneController[] _SceneCollection = null;
        private HashSet<SceneController> _ActiveSceneCollection = new HashSet<SceneController>();
        private Action _NullAction = () => { };
        #endregion


        #region Methods.
        #region sigleton
        public override void onSingletonAwake()
        {
        }

        public override void onSingletonStart()
        {
            // シーンリストの生成
            var scene_count = SceneManager.sceneCountInBuildSettings;
            _SceneCollection = new SceneController[scene_count];
            for (int scene_index = 0; scene_index < scene_count; ++scene_index)
            {
                var scene = SceneManager.GetSceneByBuildIndex(scene_index);
                var control = new SceneController(scene_index, scene);
                _SceneCollection[scene_index] = control;
                Log.info(this, $"[{scene_index}] {control.SceneName} ({scene.path}) is registed.");
            }
        }

        public override void onSingletonDestroy()
        {
            _SceneCollection = null;
        }
        #endregion

        #region Process Control
        // Update is called once per frame
        public void onUpdate()
        {
            _ActiveSceneCollection.RemoveWhere(control => control.onUpdate());
        }
        #endregion

        #region Requests
        /// <summary>
        /// receive scene load request.
        /// </summary>
        /// <param name="SceneIdentifier"></param>
        /// <param name="callback"></param>
        public void requestToLoad(int scene_index, Action callback = null)
        {
            var controller = getSceneController(scene_index);
            if (controller != null)
            {
                Log.info(this, $"requestToLoad {scene_index}");
                controller.requestToLoad(callback ?? _NullAction);
                _ActiveSceneCollection.Add(controller);
            }
        }

        /// <summary>
        /// receive scene unload request.
        /// </summary>
        /// <param name="SceneIdentifier"></param>
        /// <param name="callback"></param>
        public void requestToUnload(int scene_index, Action callback = null)
        {
            var controller = getSceneController(scene_index);
            if (controller != null)
            {
                Log.info(this, $"requestToUnload {scene_index}");
                controller.requestToUnload(callback ?? _NullAction);
                _ActiveSceneCollection.Add(controller);
            }
        }

        /// <summary>
        /// getting scene control object.
        /// </summary>
        /// <param name="SceneIdentifier"></param>
        /// <returns></returns>
        private SceneController getSceneController(int scene_index)
        {
            return _SceneCollection[scene_index];
        }
        #endregion
        #endregion

#if TEST
        #region Indicator
        public string DevelopIndicatorText => _DevelopIndicatorText;
        public int DevelopIndicatorWidth => 300;
        public int DevelopIndicatorHeight => 40;
        private string _DevelopIndicatorText = "";

        public void onIndicatorUpdate()
        {
            var scenes = "loading: ";
            var separator = "";
            foreach(var scene in _ActiveSceneCollection)
            {
                scenes += separator + scene.SceneName;
                separator = ", ";
            }

            _DevelopIndicatorText = $"[SceneLoader] {_ActiveSceneCollection.Count}/{_SceneCollection.Length}\n{scenes}";
        }
        #endregion
#endif
    }
}
