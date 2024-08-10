using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


namespace until.system
{
    [Serializable]
    public class SceneEntry
    {
        public string Path = "";
    }

    [CreateAssetMenu(menuName = "Until/SceneEntryHolder", fileName = nameof(SceneEntryHolder))]
    public class SceneEntryHolder : ScriptableObject
    {
        public SceneEntry[] Entries
        {
            get => _Entries;
        }
        public string Category
        {
            get => _Category;
        }

        [SerializeField]
        private string _Category = "";
        [SerializeField]
        private SceneEntry[] _Entries = null;
    }
}

