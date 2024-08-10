#if true
public class Singleton
{
    public static until.system.BootSystem BootSystem = until.system.BootSystem.Instance;
    public static until.system.GameObjectControlMediator GameObjectControlMediator = until.system.GameObjectControlMediator.Instance;
    public static until.system.InputManager InputManager = until.system.InputManager.Instance;
    public static until.system.ModeManager ModeManager = until.system.ModeManager.Instance;
    public static until.system.PrefabInstantiateMediator PrefabInstantiateMediator = until.system.PrefabInstantiateMediator.Instance;
    public static until.system.SceneLoader SceneLoader = until.system.SceneLoader.Instance;
    public static until.system.RandomizerManager RandomizerManager = until.system.RandomizerManager.Instance;
    public static until.modules.camera.CameraManager CameraManager = until.modules.camera.CameraManager.Instance;
#if TEST
    public static until.develop.DevelopCommandManager DevelopCommandManager = until.develop.DevelopCommandManager.Instance;
    public static until.develop.DevelopIndicator DevelopIndicator = until.develop.DevelopIndicator.Instance;
#endif
}
#endif
