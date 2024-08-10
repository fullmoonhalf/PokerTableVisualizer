using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using until.develop;


namespace until.utils.algorithm
{
    public class DijkstraResolver
    {
        private class Node
        {
            public bool Open = false;
            public bool Close = false;
            public float Cost = float.MaxValue;
            public int Index = 0;

            public Node(int index)
            {
                Index = index;
            }

            public override string ToString()
            {
                return $"{base.ToString()} ({Index}, {Cost})";
            }
        }

        private class Context
        {
            public Node[] Nodes = null;
            public Node[] WipList = null;
            public int WipCount = 0;
            public bool hasSearchNode => WipCount > 0;

            public Context(int count)
            {
                Nodes = new Node[count];
                WipList = new Node[count];
                for (int index = 0; index < count; ++index)
                {
                    Nodes[index] = new Node(index);
                }
            }

            public Node enqueue(int index)
            {
                var node = Nodes[index];
                return enqueue(node);
            }

            public Node enqueue(Node node)
            {
                if (node.Open | node.Close)
                {
                    return node;
                }
                node.Open = true;
                WipList[WipCount] = node;
                ++WipCount;
                return node;
            }

            public Node dequeue()
            {
                int min_index = -1;
                float min_cost = float.MaxValue;
                for (int index = 0; index < WipCount; ++index)
                {
                    var test = WipList[index];
                    if (test.Cost <= min_cost)
                    {
                        min_cost = test.Cost;
                        min_index = index;
                    }
                }
                if (min_index < 0)
                {
                    return null;
                }

                var node = WipList[min_index];
                node.Close = true;
                WipCount = Math.Max(WipCount - 1, 0);
                WipList[min_index] = WipList[WipCount];
                return node;
            }
        }

        #region Methods
        public static int[] resolvePath(DijkstraCondition condition, int start, int goal)
        {
            // 探査
            var context = new Context(condition.EntityCount);
            var start_node = context.enqueue(goal);
            var found = false;
            start_node.Cost = 0.0f;
            while (context.hasSearchNode)
            {
                var search_node = context.dequeue();
                if (search_node.Index == start)
                {
                    found = true;
                    break;
                }
                var neighbours = condition.getNeighbours(search_node.Index);
                foreach (var neighbour_index in neighbours)
                {
                    var neighbour_node = context.enqueue(neighbour_index);
                    var neighbour_cost = search_node.Cost + condition.getLinkCost(search_node.Index, neighbour_index);
                    if (neighbour_node.Cost > neighbour_cost)
                    {
                        neighbour_node.Cost = neighbour_cost;
                    }
                }
            }

            // 結果を戻す
            if (!found)
            {
                return null;
            }

            var answer = new List<int>();
            var node = context.Nodes[start];
            while (node != null)
            {
                answer.Add(node.Index);
                var cost_min = node.Cost;
                var neighbours = condition.getNeighbours(node.Index);
                node = null;
                if (neighbours != null)
                {
                    foreach (var neighbour_index in neighbours)
                    {
                        var neighbour = context.Nodes[neighbour_index];
                        if (neighbour.Cost <= cost_min)
                        {
                            node = neighbour;
                            cost_min = neighbour.Cost;
                        }
                    }
                }
            }

            return answer.ToArray();
        }


        private static Context resolveAllCostSearch(DijkstraCondition condition, int start)
        {
            // 探査
            var context = new Context(condition.EntityCount);
            var start_node = context.enqueue(start);
            start_node.Cost = 0.0f;
            while (context.hasSearchNode)
            {
                var search_node = context.dequeue();
                var neighbours = condition.getNeighbours(search_node.Index);
                foreach (var neighbour_index in neighbours)
                {
                    var neighbour_node = context.enqueue(neighbour_index);
                    var neighbour_cost = search_node.Cost + condition.getLinkCost(search_node.Index, neighbour_index);
                    if (neighbour_node.Cost > neighbour_cost)
                    {
                        neighbour_node.Cost = neighbour_cost;
                    }
                }
            }
            return context;
        }


        public static float[] resolveAllCost(DijkstraCondition condition, int start)
        {
            var context = resolveAllCostSearch(condition, start);
            var cost_list = new float[condition.EntityCount];
            for (int index = 0; index < condition.EntityCount; ++index)
            {
                cost_list[index] = context.Nodes[index].Cost;
            }
            return cost_list;
        }


        public static int[] resolveNearestIndexList(DijkstraCondition condition, int start)
        {
            var context = resolveAllCostSearch(condition, start);
            var list = new List<Node>(context.Nodes);
            list.Sort((a, b) => Math.Sign(a.Cost - b.Cost));

            var indecies = new int[list.Count];
            for (int index = 0; index < list.Count; ++index)
            {
                indecies[index] = list[index].Index;
            }
            return indecies;
        }
        #endregion
    }


    public interface TraversalCondition
    {
        public int EntityCount { get; }
        public float getLinkCost(int start, int end);
        public int[] getNeighbours(int start);
    }

    public interface DijkstraCondition : TraversalCondition
    {
    }
}
