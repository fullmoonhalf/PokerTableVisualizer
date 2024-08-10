using System.Collections;
using System.Collections.Generic;
using UnityEngine;



namespace until.system.settings
{
    public static class ExecutionOrder
    {
        public const int System_Head_0 = -90;
        public const int System_Head_1 = System_Head_0 + 1;
        public const int System_Head_2 = System_Head_0 + 2;
        public const int System_Head_3 = System_Head_0 + 3;
        public const int System_Head_4 = System_Head_0 + 4;
        public const int System_Head_5 = System_Head_0 + 5;
        public const int System_Head_6 = System_Head_0 + 6;
        public const int System_Head_7 = System_Head_0 + 7;
        public const int System_Head_8 = System_Head_0 + 8;

        public const int ApplicationStart = -500;
        public const int ApplicationEnd = 500;

        public const int Undefined = 0;

        public const int Develop_Head_0 = -2000;
        public const int Static = -1500;
    }

    public static class UntilBehaviorOrder
    {
        // デバッグ
        public const int Develop_DevelopCommandBehavior = ExecutionOrder.Develop_Head_0;
        public const int Develop_DevelopIndicatorBehavior = ExecutionOrder.Develop_Head_0;

        // システム
        public const int System_BootSystemBehavior = ExecutionOrder.System_Head_1;
        public const int System_GameObjectManagementBehavior = ExecutionOrder.System_Head_1;
        public const int System_InputManagerBehavior = ExecutionOrder.System_Head_1;

        // 論理実行フェイズ
        public const int System_ModeManagerBehavior = ExecutionOrder.System_Head_2;
        public const int Astral_AstralManagerBehavior = ExecutionOrder.System_Head_2;

        // フィールド実行フェイズ
        public const int Bullet_BulletController = ExecutionOrder.System_Head_3;
        public const int Bullet_BulletClient = ExecutionOrder.System_Head_4;
        public const int Bullet_BulletTarget = ExecutionOrder.System_Head_4;
        
        public const int Camera_CameraController = ExecutionOrder.System_Head_3;

        public const int GameField_IngameFieldBehavior = ExecutionOrder.System_Head_3;
        public const int GameField_Substance = ExecutionOrder.System_Head_4;

        // 更新しない系
        public const int System_Collector = ExecutionOrder.Static;
        public const int System_SettingBehavior = ExecutionOrder.Static;
    }
}
