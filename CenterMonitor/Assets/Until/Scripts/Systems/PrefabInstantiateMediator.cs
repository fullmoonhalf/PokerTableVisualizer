using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using until.develop;
using until.system;


namespace until.system
{
    public class PrefabInstantiateMediator : Singleton<PrefabInstantiateMediator>
    {
        #region Definitions
        public enum Result
        {
            Success,
            Failure,
        }

        public delegate void OnFinishAction(Result result, GameObject generatedObject);

        private class Request
        {
            public UnityEngine.Object Prefab = null;
            public OnFinishAction OnFinish = null;
            public bool Eternal = false;
        }
        #endregion

        #region Fields.
        public bool IsBusy
        {
            get
            {
                lock (_Lock)
                {
                    return _RequestList.Count > 0;
                }
            }
        }

        private List<Request> _RequestList = new List<Request>();
        private Dictionary<string, PrefabWrapper> _PrefabCollection = new Dictionary<string, PrefabWrapper>();
        private object _Lock = new object();
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
        public GameObject request(UnityEngine.Object prefab, OnFinishAction onFinish = null, bool Eternal = false, bool immidiate = false)
        {
            var order = new Request();
            order.Prefab = prefab;
            order.Eternal = Eternal;

            if (immidiate)
            {
                GameObject go = null;
                order.OnFinish = (result, cbGo) =>
                {
                    if (result == Result.Success)
                    {
                        go = cbGo;
                    }
                    if (onFinish != null)
                    {
                        onFinish.Invoke(result, go);
                    }
                };
                process(order);
                return go;
            }
            else
            {
                order.OnFinish = onFinish;
                lock (_RequestList)
                {
                    _RequestList.Add(order);
                }
                Log.info(this, $"requested {prefab.name}");
                return null;
            }
        }

        public GameObject requestFromResource(string name, OnFinishAction onFinish = null, bool eternal = false, bool immididate = false)
        {
            var prefab = Resources.Load(name);
            return request(prefab, onFinish, eternal, immididate);
        }

        public GameObject requestFromCollection(string name, OnFinishAction on_finish = null, bool eternal = false, bool immidiate = false)
        {
            lock (_Lock)
            {
                if (_PrefabCollection.TryGetValue(name, out var wrapper))
                {
                    return request(wrapper.Prefab, on_finish, eternal, immidiate);
                }
            }
            return null;
        }
        #endregion

        #region Register
        public void regist(string name, PrefabWrapper prefab)
        {
            lock (_Lock)
            {
                Log.info(this, $"regist {name}");
                _PrefabCollection[name] = prefab;
            }
        }

        public void unregist(string name)
        {
            lock (_Lock)
            {
                Log.info(this, $"unregist {name}");
                _PrefabCollection.Remove(name);
            }
        }
        #endregion

        #region Execution
        private void process()
        {
            foreach (var request in _RequestList)
            {
                process(request);
            }
            _RequestList.Clear();
        }

        private void process(Request request)
        {
            var GeneratedObject = GameObject.Instantiate(request.Prefab) as GameObject;
            if (GeneratedObject != null && request.Eternal)
            {
                GameObject.DontDestroyOnLoad(GeneratedObject);
            }
            var result = GeneratedObject != null ? Result.Success : Result.Failure;
            request.OnFinish?.Invoke(result, GeneratedObject);
            Log.info(this, $"generated {request.Prefab.name}");
        }
        #endregion
    }
}

