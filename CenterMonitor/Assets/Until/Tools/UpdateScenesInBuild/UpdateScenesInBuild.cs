using System;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
using System.IO;
using UnityEngine;
using UnityEditor;
using until.system;
using until.utils;
using until.develop;

namespace until.tool.singleton
{
    public class UpdateScenesInBuild
    {
        [MenuItem("Until/UpdateScenesInBuild")]
        static void execute()
        {
            var editorBuildSettingsScenes = new List<EditorBuildSettingsScene>();
            var script_identifier = "";
            var script_category = "";
            var script_pathlist = "public static readonly string[] Paths = new string[]{" + System.Environment.NewLine;

            // 情報の回収
            var query = "t:" + typeof(SceneEntryHolder).Name;
            var assets = AssetDatabase.FindAssets(query);
            foreach (var asset_guid in assets)
            {
                var asset_path = AssetDatabase.GUIDToAssetPath(asset_guid);
                var asset = AssetDatabase.LoadAssetAtPath<SceneEntryHolder>(asset_path);
                if (asset != null)
                {
                    var category_indecies = "";
                    foreach (var entry in asset.Entries)
                    {
                        var symbol = Path.GetFileNameWithoutExtension(entry.Path);
                        if (!string.IsNullOrEmpty(asset.Category))
                        {
                            symbol = asset.Category + "_" + symbol;
                            category_indecies += symbol + ", ";
                        }
                        script_pathlist += $"\"{entry.Path}\"," + System.Environment.NewLine;
                        script_identifier += $"public const int {symbol} = {editorBuildSettingsScenes.Count};" + System.Environment.NewLine;
                        editorBuildSettingsScenes.Add(new EditorBuildSettingsScene(entry.Path, true));
                    }
                    if (!string.IsNullOrEmpty(asset.Category))
                    {
                        script_category += $"public static readonly int[] Category_{asset.Category} = new int[]{{{category_indecies}}};" + System.Environment.NewLine;
                    }
                }
            }
            script_pathlist += $"}};" + System.Environment.NewLine;

            // Scenes in build に書き出す
            EditorBuildSettings.scenes = editorBuildSettingsScenes.ToArray();

            // スクリプトを書き換えて出力
            var script = File.ReadAllText("Assets/Until/Tools/UpdateScenesInBuild/ScriptTemplate.cs");
            var script_replace = script_identifier + System.Environment.NewLine + script_category + System.Environment.NewLine + script_pathlist;
            script = script.Replace("@entry", script_replace);
            script = script.Replace("SCRIPT_TEMPLATE", "true");
            File.WriteAllText("Assets/Generated/UpdateScenesInBuild/BuildinSceneIndex.cs", script);
            AssetDatabase.Refresh();

        }
    }
}

