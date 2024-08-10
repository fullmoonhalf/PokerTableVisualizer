using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;


namespace until.system
{
    [DefaultExecutionOrder(until.system.settings.UntilBehaviorOrder.System_Collector)]
    public abstract class Collector : Behavior
    {
        #region Defines
        /// <summary>
        /// 所定のマネージャーに何らかの登録を行なう。
        /// </summary>
        /// <returns>登録完了の場合 true。</returns>
        protected abstract bool supply();
        /// <summary>
        /// 所定のマネージャーに登録したものを始末する。
        /// </summary>
        protected abstract void withdrawal();
        #endregion

        #region Fields.
        private bool _Supplied = false;
        #endregion

        #region Methods
        #region Behavior
        private void Start()
        {
            execSupply();
        }

        private void Update()
        {
            execSupply();
        }

        private void OnDestroy()
        {
            withdrawal();
        }
        #endregion

        #region Executor
        private void execSupply()
        {
            if (_Supplied)
            {
                return;
            }
            _Supplied = supply();
            if (_Supplied)
            {
                Singleton.GameObjectControlMediator.requestSetEnable(gameObject, false);
            }
        }
        #endregion
        #endregion
    }
}
