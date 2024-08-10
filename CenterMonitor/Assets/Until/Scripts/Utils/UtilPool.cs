using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace until.utils
{
    public class Pool<T> where T : class, new()
    {
        private Queue<T> _Unused = null;
        private HashSet<T> _Used = null;

        /// <summary>
        /// コンストラクタ
        /// </summary>
        /// <param name="pool"></param>
        public Pool(T[] pool)
        {
            _Unused = new Queue<T>(pool);
            _Used = new HashSet<T>(pool.Length);
        }

        /// <summary>
        /// Pool から借りる
        /// </summary>
        /// <returns></returns>
        public T rent()
        {
            if (_Unused.Count <= 0)
            {
                return null;
            }
            var rented = _Unused.Dequeue();
            _Used.Add(rented);
            return rented;
        }

        /// <summary>
        /// Pool に戻す
        /// </summary>
        /// <param name="obj"></param>
        public void back(T obj)
        {
            if (_Used.Remove(obj))
            {
                _Unused.Enqueue(obj);
            }
        }

        /// <summary>
        /// 全破棄
        /// </summary>
        /// <param name="release_function"></param>
        public void release(Action<T> release_function)
        {
            var unused_array = _Unused.ToArray();
            _Unused.Clear();
            foreach (var obj in unused_array)
            {
                release_function.Invoke(obj);
            }

            var used_array = _Used.ToArray();
            _Used.Clear();
            foreach (var obj in used_array)
            {
                release_function.Invoke(obj);
            }
        }
    }
}
