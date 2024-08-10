using UnityEngine;


namespace until.utils
{
    public static class math
    {
        public const float EPSILON = 0.000005f;

        public static bool checkNearlyEqual(float CheckValue, float TestValue, float Epsilon = EPSILON)
        {
            float Differance = Mathf.Abs(CheckValue - TestValue);
            return Differance < Epsilon;
        }

        /// <summary>
        /// 0° ～ 360° の主角に変換する。
        /// </summary>
        /// <param name="degree"></param>
        /// <returns></returns>
        public static float getDegreeArgument(float x)
        {
            var y = x % 360.0f;
            if (y >= 180.0f)
            {
                y -= 360.0f;
            }
            else if (y <= -180.0f)
            {
                y += 360.0f;
            }
            return y;
        }

        /// <summary>
        /// 乱数
        /// </summary>
        /// <param name="min">最小値(含む)</param>
        /// <param name="max">最大値(含む)</param>
        /// <returns></returns>
        public static float getRandomRange(float min, float max)
        {
            return Random.Range(min, max);
        }

        /// <summary>
        /// 乱数
        /// </summary>
        /// <param name="min">最小値(含む)</param>
        /// <param name="max">最大値(含まない)</param>
        /// <returns></returns>
        public static int getRandomRange(int min, int max)
        {
            return Random.Range(min, max);
        }

        /// <summary>
        /// 乱数(インデックス)
        /// </summary>
        /// <param name="num">要素数</param>
        /// <returns></returns>
        public static int getRandomIndex(int num)
        {
            return getRandomRange(0, num);
        }
    }
}
