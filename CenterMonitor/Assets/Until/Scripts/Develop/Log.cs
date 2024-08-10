using System.Diagnostics;


namespace until.develop
{
    public class Log
    {
        [Conditional("TEST")]
        public static void fatal(object Source, string Text, params object[] Args)
        {
            var Message = $"[{Source.GetType().FullName}] {Text} - " + string.Join(" - ", Args);
            UnityEngine.Debug.LogAssertionFormat(Message);
        }

        [Conditional("TEST")]
        public static void fatal(string Source, string Text, params object[] Args)
        {
            var Message = $"[{Source}] {Text} - " + string.Join(" - ", Args);
            UnityEngine.Debug.LogAssertionFormat(Message);
        }

        [Conditional("TEST")]
        public static void error(object Source, string Text, params object[] Args)
        {
            var Message = $"[{Source.GetType().FullName}] {Text} - " + string.Join(" - ", Args);
            UnityEngine.Debug.LogErrorFormat(Message);
        }

        [Conditional("TEST")]
        public static void error(string Source, string Text, params object[] Args)
        {
            var Message = $"[{Source}] {Text} - " + string.Join(" - ", Args);
            UnityEngine.Debug.LogErrorFormat(Message);
        }

        [Conditional("TEST")]
        public static void warning(object Source, string Text, params object[] Args)
        {
            var Message = $"[{Source.GetType().FullName}] {Text} - " + string.Join(" - ", Args);
            UnityEngine.Debug.LogWarningFormat(Message);
        }

        [Conditional("TEST")]
        public static void warning(string Source, string Text, params object[] Args)
        {
            var Message = $"[{Source}] {Text} - " + string.Join(" - ", Args);
            UnityEngine.Debug.LogWarningFormat(Message);
        }

        [Conditional("TEST")]
        public static void info(object Source, string Text, params object[] Args)
        {
            var Message = $"[{Source.GetType().FullName}] {Text} - " + string.Join(" - ", Args);
            UnityEngine.Debug.LogFormat(Message);
        }

        [Conditional("TEST")]
        public static void info(string Source, string Text, params object[] Args)
        {
            var Message = $"[{Source}] {Text} - " + string.Join(" - ", Args);
            UnityEngine.Debug.LogFormat(Message);
        }

        [Conditional("VERBOSE")]
        public static void verbose(object Source, string Text, params object[] Args)
        {
            var Message = $"[{Source.GetType().FullName}] {Text} - " + string.Join(" - ", Args);
            UnityEngine.Debug.LogFormat(Message);
        }

        [Conditional("VERBOSE")]
        public static void verbose(string Source, string Text, params object[] Args)
        {
            var Message = $"[{Source}] {Text} - " + string.Join(" - ", Args);
            UnityEngine.Debug.LogFormat(Message);
        }
    }
}
