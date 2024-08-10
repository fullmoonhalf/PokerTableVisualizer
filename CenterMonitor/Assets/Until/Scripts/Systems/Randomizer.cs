using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace until.system
{
    public interface Randomizer
    {
        float getFloat();
        int getInt(int min, int max);
    }
}
