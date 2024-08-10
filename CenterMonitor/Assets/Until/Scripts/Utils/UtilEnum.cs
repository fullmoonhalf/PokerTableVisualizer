using System;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;



namespace until.utils
{
    // Enum型の拡張メソッドを定義するクラス
    public static class UtilEnum
    {
        /// <summary>
        /// 指定の Attribute を取得する
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="e"></param>
        /// <returns>attribute。見つからない場合nullを返す</returns>
        public static T getAttrubute<T>(this Enum e) where T : Attribute
        {
            var field = e.GetType().GetField(e.ToString());
            if (field.GetCustomAttribute<T>() is T attribute)
            {
                return attribute;
            }

            return null;
        }


        /// <summary>
        /// 指定の Attribute を持っているかどうか。
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="e"></param>
        /// <returns></returns>
        public static bool hasAttribute<T>(this Enum e) where T : Attribute
        {
            return getAttrubute<T>(e) != null;
        }
    }
}