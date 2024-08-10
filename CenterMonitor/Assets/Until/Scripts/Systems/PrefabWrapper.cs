using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


namespace until.system
{
    [Serializable]
    public class PrefabWrapper
    {
        #region Properties
        public UnityEngine.Object Prefab
        {
            get => _Prefab;
        }
        [SerializeField]
        private UnityEngine.Object _Prefab = null;
        #endregion

        #region コンストラクタ
        public PrefabWrapper()
        {
        }

        public PrefabWrapper(UnityEngine.Object prefab)
        {
            _Prefab = prefab;
        }
        #endregion

        #region 
        /// <summary>
        /// Instantiate
        /// </summary>
        /// <param name="onFinish"></param>
        /// <param name="eternal"></param>
        public void instantiate(PrefabInstantiateMediator.OnFinishAction onFinish = null, bool eternal = false, bool immidiate = false)
        {
            Singleton.PrefabInstantiateMediator.request(_Prefab, onFinish, eternal, immidiate);
        }
        #endregion
    }
}

