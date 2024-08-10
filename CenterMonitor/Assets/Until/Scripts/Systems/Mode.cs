namespace until.system
{
    /// <summary>
    /// モード
    /// </summary>
    public interface Mode
    {
        public enum Control
        {
            /// <summary>現在の関数呼び出しを維持したい</summary>
            Keep,
            /// <summary>現在の関数呼び出しは終わらせてよい</summary>
            Done,
        }

        Control init();
        Control update();
        Control exit();
    }

    /// <summary>
    /// 起動モード。2 つ以上のモードでの実装禁止
    /// </summary>
    public interface BootMode : Mode
    {
    }
}
