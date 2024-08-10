using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using until.develop;


#if TEST
namespace until.utils.algorithm
{
    public static class Test
    {
        #region PriorityQueue
        public static void testPriorityQueue()
        {
            var queue = new utils.algorithm.PriorityQueue<int>(4);
            queue.push(6);
            queue.push(1);
            queue.push(3);
            queue.push(4);
            queue.push(11);
            queue.push(5);
            queue.push(16);
            queue.push(2);
            queue.push(7);
            queue.push(10);
            queue.push(9);
            queue.push(12);
            queue.push(14);
            queue.push(8);
            queue.dump();

            queue.remove(2);
            queue.remove(6);
            queue.remove(1);
            queue.remove(16);
            queue.dump();
        }
        #endregion


        #region Astar
        private class TestAstarEntry
        {
            public float X;
            public float Y;
        }

        private class TestAstarCondition : AstarCondition
        {
            public TestAstarEntry[] Entries = new TestAstarEntry[]
            {
                new TestAstarEntry(){ X=0.0f, Y=0.0f,},
                new TestAstarEntry(){ X=1.0f, Y=0.0f,},
                new TestAstarEntry(){ X=1.0f, Y=1.0f,},
                new TestAstarEntry(){ X=2.0f, Y=0.0f,},
                new TestAstarEntry(){ X=2.0f, Y=2.0f,},
                new TestAstarEntry(){ X=3.0f, Y=1.0f,},
                new TestAstarEntry(){ X=4.0f, Y=0.0f,},
                new TestAstarEntry(){ X=4.0f, Y=2.0f,},
            };
            public int[][] Neighbours = new int[][]
            {
                new int[]{ 1, 2, },
                new int[]{ 0, 2, 3, },
                new int[]{ 0, 1, 3, 4, },
                new int[]{ 1, 2, 4, 5, },
                new int[]{ 2, 3, 5, },
                new int[]{ 3, 4, 6, },
                new int[]{ 5, 7, },
                new int[]{ 6, },
            };
            public int EntityCount => Entries.Length;

            public float getLinkCost(int start, int end)
            {
                return 1.0f;
            }

            public float getHeuristicsCost(int start, int end)
            {
                float dx = Entries[start].X - Entries[end].X;
                float dy = Entries[start].Y - Entries[end].Y;
                return MathF.Sqrt(dx * dx + dy * dy);
            }

            public int[] getNeighbours(int start)
            {
                return Neighbours[start];
            }
        }

        public static void testAstar()
        {
            var condition = new TestAstarCondition();
            var resolver = new AstatResolver(condition);
            var path = resolver.resolvePath(2, 6);
            if (path != null)
            {
                for (var index = 0; index < path.Length; ++index)
                {
                    Log.info(resolver, $"[{index}] {path[index]}");
                }
            }
        }
        #endregion
    }
}
#endif
