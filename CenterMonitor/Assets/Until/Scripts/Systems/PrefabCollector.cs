using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;


namespace until.system
{
    [DefaultExecutionOrder(until.system.settings.UntilBehaviorOrder.System_Collector)]
    public class PrefabCollector : Collector
    {
        #region プロパティ
        [SerializeField]
        private PrefabNamedWrapper[] _Collection = new PrefabNamedWrapper[0];
        #endregion

        #region Methods
        #region Collector
        protected override bool supply()
        {
            foreach (var unit in _Collection)
            {
                Singleton.PrefabInstantiateMediator.regist(unit.Name, unit);
            }
            return true;
        }

        protected override void withdrawal()
        {
            foreach (var unit in _Collection)
            {
                Singleton.PrefabInstantiateMediator.unregist(unit.Name);
            }
        }
        #endregion
        #endregion
    }
}
