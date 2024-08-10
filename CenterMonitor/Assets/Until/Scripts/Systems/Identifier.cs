using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace until.system
{
    public abstract class Identifier<T> : IEquatable<T>
        where T : Identifier<T>
    {
        #region Definitions
        public abstract bool equal(T other);
        public abstract int Hashcode { get; }
        #endregion

        #region 等価性判断
        public override bool Equals(object obj)
        {
            if (obj is T identifier)
            {
                return Equals(identifier);
            }
            return false;
        }

        public bool Equals(T other)
        {
            if (other is null)
            {
                return false;
            }
            if (Hashcode != other.Hashcode)
            {
                return false;
            }
            return equal(other);
        }

        public override int GetHashCode()
        {
            return Hashcode;
        }

        public static bool operator ==(Identifier<T> lhs, T rhs)
        {
            if (lhs is null) return rhs is null;
            return lhs.Equals(rhs);
        }
        public static bool operator !=(Identifier<T> lhs, T rhs)
        {
            if (lhs is null) return !(rhs is null);
            return !(lhs == rhs);
        }
        #endregion
    }
}
