using System;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
using System.IO;
using UnityEngine;
using UnityEditor;
using until.system;
using until.utils;


namespace until.tool.singleton
{
    public class SingletonTool
    {
        [MenuItem("Until/SingletonTool")]
        static void execute()
        {
            // Singleton の生成
            var SingletonTypes = typeof(SingletonBase).getSubclasses();
            var BodyCode = "";
            foreach (var type in SingletonTypes)
            {
                BodyCode += $"public static {type.FullName} {type.Name} = {type.FullName}.Instance;\r\n";
            }

            // スクリプトを書き換えて出力
            var ScriptText = File.ReadAllText("Assets/Until/Tools/Singleton/ScriptTemplate.cs");
            ScriptText = ScriptText.Replace("@entry", BodyCode);
            ScriptText = ScriptText.Replace("SCRIPT_TEMPLATE", "true");
            File.WriteAllText("Assets/Generated/Singleton/Singleton.cs", ScriptText);
            AssetDatabase.Refresh();
        }
    }
}
