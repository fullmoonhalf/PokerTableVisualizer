using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
using System.Reflection;



namespace until.utils
{
    public static class UtilType
    {
        /// <summary>
        /// 所定型の派生クラスのリストを取得する。
        /// </summary>
        /// <param name="MyType"></param>
        /// <returns></returns>
        public static Type[] getSubclasses(this Type MyType)
        {
            var SubclassTypes = new List<Type>();
            var RefAssembly = Assembly.GetAssembly(MyType);
            if (RefAssembly != null)
            {
                foreach (var type in RefAssembly.GetTypes())
                {
                    if (type.IsAbstract)
                    {
                        continue;
                    }
                    if (type.IsGenericType)
                    {
                        continue;
                    }
                    if (type.IsSubclassOf(MyType) == false)
                    {
                        continue;
                    }

                    SubclassTypes.Add(type);
                }
            }

            return SubclassTypes.ToArray();
        }


        public static Type[] getImplementedClasses(this Type InterfaceType)
        {
            var ImplementedTypes = new List<Type>();
            if (InterfaceType.IsInterface)
            {
                var RefAssembly = Assembly.GetAssembly(InterfaceType);
                if (RefAssembly != null)
                {
                    foreach (var type in RefAssembly.GetTypes())
                    {
                        if (type.IsAbstract)
                        {
                            continue;
                        }
                        if (type.IsGenericType)
                        {
                            continue;
                        }
                        if (InterfaceType.IsAssignableFrom(type) == false)
                        {
                            continue;
                        }
                        ImplementedTypes.Add(type);
                    }
                }
            }

            return ImplementedTypes.ToArray();
        }
    }
}

