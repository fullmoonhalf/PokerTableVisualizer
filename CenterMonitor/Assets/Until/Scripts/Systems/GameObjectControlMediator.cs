using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using until.system;


namespace until.system
{
    public class GameObjectControlMediator : Singleton<GameObjectControlMediator>
    {
        #region Definitions
        public enum Result
        {
            Success,
            Failure,
        }

        public delegate void OnFinish(Result result, UnityEngine.Object gameObject);

        [Flags]
        private enum Command
        {
            Invalid = 0x0000,
            Enable = 0x0001,
        }

        private class Request
        {
            public Command command = Command.Invalid;
            public GameObject TargetObject = null;
            public bool Enable = false;
            public OnFinish FinishAction = null;
        }
        #endregion

        #region Field.
        private List<Request> _RequestList = new List<Request>();
        #endregion

        #region Singleton
        public override void onSingletonAwake()
        {
            _RequestList.Clear();
        }

        public override void onSingletonStart()
        {
        }

        public override void onSingletonDestroy()
        {
            _RequestList.Clear();
        }
        #endregion

        #region Process
        public void onUpdate()
        {
            process();
        }
        #endregion

        #region Request
        public void requestSetEnable(UnityEngine.Object TargetObject, bool Validation, OnFinish FinishAction = null)
        {
            if (TargetObject is GameObject TargetGameObject)
            {
                requestSetEnable(TargetGameObject, Validation, FinishAction);
            }
            else
            {
                FinishAction?.Invoke(Result.Failure, TargetObject);
            }
        }

        public void requestSetEnable(GameObject TargetObject, bool Validation, OnFinish FinishAction = null)
        {
            var request = new Request();
            request.command = Command.Enable;
            request.TargetObject = TargetObject;
            request.Enable = Validation;
            request.FinishAction = FinishAction;

            lock (_RequestList)
            {
                _RequestList.Add(request);
            }
        }
        #endregion

        #region Process
        private void process()
        {
            foreach (var request in _RequestList)
            {
                if ((request.command & Command.Enable) != 0)
                {
                    request.TargetObject.SetActive(request.Enable);
                }

                request.FinishAction?.Invoke(Result.Success, request.TargetObject);
            }
            _RequestList.Clear();
        }
        #endregion
    }
}

