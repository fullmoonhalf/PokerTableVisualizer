using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using until.develop;
using until.system;


namespace until.system
{
    public abstract class Taggable<ActualType> 
        : Behavior
        where ActualType : Taggable<ActualType>
    {
    }
}
