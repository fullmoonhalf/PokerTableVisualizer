using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;



namespace until.system
{
    public class SceneController
    {
        public enum Phase
        {
            Unload,
            Activating,
            Active,
            Deactivating,
        }

        public int SceneIndex { get; private set; }
        public string SceneName { get; private set; }

        private Phase CurrentPhase = Phase.Unload;
        private AsyncOperation SceneLoadingStatus = null;
        private Action AfterLoadAction = null;
        private Action AfterUnloadAction = null;
        private Scene TargetScene;

        public SceneController(int index, Scene scene)
        {
            SceneIndex = index;
            TargetScene = scene;
            SceneName = TargetScene.name;
        }

        #region Process Control
        public bool onUpdate()
        {
            var finish = false;

            switch (CurrentPhase)
            {
                case Phase.Unload:
                    if (AfterUnloadAction != null)
                    {
                        AfterUnloadAction.Invoke();
                        AfterUnloadAction = null;
                        finish = true;
                    }
                    if (AfterLoadAction != null)
                    {
                        transit(Phase.Activating);
                        SceneLoadingStatus = SceneManager.LoadSceneAsync((int)SceneIndex, LoadSceneMode.Additive);
                        finish = false;
                    }
                    break;
                case Phase.Activating:
                    if (SceneLoadingStatus.isDone)
                    {
                        SceneLoadingStatus = null;
                        transit(Phase.Active);
                    }
                    break;
                case Phase.Active:
                    if (AfterLoadAction != null)
                    {
                        AfterLoadAction.Invoke();
                        AfterLoadAction = null;
                        finish = true;
                    }
                    if (AfterUnloadAction != null)
                    {
                        transit(Phase.Deactivating);
                        SceneLoadingStatus = SceneManager.UnloadSceneAsync((int)SceneIndex);
                        finish = false;
                    }
                    break;
                case Phase.Deactivating:
                    if (SceneLoadingStatus.isDone)
                    {
                        SceneLoadingStatus = null;
                        transit(Phase.Deactivating);
                    }
                    break;
            }

            return finish;
        }

        private void transit(Phase NextPhase)
        {
            CurrentPhase = NextPhase;
        }
        #endregion

        #region Request
        public void requestToLoad(Action Callback)
        {
            AfterLoadAction += Callback;
        }

        public void requestToUnload(Action Callback)
        {
            AfterUnloadAction += Callback;
        }
        #endregion

        #region Hash
        public override int GetHashCode()
        {
            return SceneIndex.GetHashCode() ^ base.GetHashCode();
        }

        public override bool Equals(object obj)
        {
            if (obj is SceneController controller)
            {
                return SceneIndex == controller.SceneIndex;
            }
            return false;
        }
        #endregion
    }
}

