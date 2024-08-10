using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using until.develop;


namespace until.utils.algorithm
{
    public class AstatResolver
    {
        #region Definition
        private enum NodeStatus
        {
            None,
            Open,
            Close,
        }

        private class Node : IComparable<Node>
        {
            public NodeStatus Status = NodeStatus.None;
            public int Index;
            public float Cost;
            public float Heuristics;
            public float Score;
            public Node Parent;

            public int CompareTo(Node other)
            {
                return Math.Sign(Score - other.Score);
            }
        }
        #endregion

        #region Fields
        private AstarCondition _Condition = null;
        private Node[] _NodeList = null;
        private PriorityQueue<Node> _OpenQueue = null;
        #endregion

        #region Methods
        public AstatResolver(AstarCondition condition)
        {
            _Condition = condition;
            _OpenQueue = new PriorityQueue<Node>(condition.EntityCount);
            _NodeList = new Node[condition.EntityCount];
            for (var index = 0; index < _NodeList.Length; ++index)
            {
                _NodeList[index] = new Node()
                {
                    Index = index,
                };
            }
        }

        public int[] resolvePath(int start, int goal)
        {
            return resolvePathExec(goal, start);
        }

        private int[] resolvePathExec(int start, int goal)
        {
            var active_node = _NodeList[start];
            open(active_node, 0.0f, _Condition.getHeuristicsCost(start, goal));

            while (true)
            {
                active_node = _OpenQueue.pop();
                if (active_node == null)
                {
                    return null;
                }
                if (active_node.Index == goal)
                {
                    break;
                }

                var neighbours_list = _Condition.getNeighbours(active_node.Index);
                active_node.Status = NodeStatus.Close;
                for (var neighbours_index = 0; neighbours_index < neighbours_list.Length; ++neighbours_index)
                {
                    var test_node_index = neighbours_list[neighbours_index];
                    var test_node = _NodeList[test_node_index];
                    var cost = active_node.Cost + _Condition.getLinkCost(active_node.Index, test_node_index);
                    var heuristics = _Condition.getHeuristicsCost(test_node_index, goal);
                    switch (test_node.Status)
                    {
                        case NodeStatus.None:
                            open(test_node, cost, heuristics);
                            test_node.Parent = active_node;
                            break;
                        case NodeStatus.Open:
                            {
                                var score = cost + heuristics;
                                if (score < test_node.Score)
                                {
                                    _OpenQueue.remove(test_node);
                                    open(test_node, cost, heuristics);
                                    test_node.Parent = active_node;
                                }
                            }
                            break;
                        case NodeStatus.Close:
                            {
                                var score = cost + heuristics;
                                if (score < test_node.Score)
                                {
                                    open(test_node, cost, heuristics);
                                    test_node.Parent = active_node;
                                }
                            }
                            break;
                    }
                }
            }

            var path = new List<int>(_Condition.EntityCount);
            while (active_node != null)
            {
                path.Add(active_node.Index);
                active_node = active_node.Parent;
            }
            return path.ToArray();
        }

        private void open(Node node, float cost, float heuristics)
        {
            node.Status = NodeStatus.Open;
            node.Cost = cost;
            node.Heuristics = heuristics;
            node.Score = node.Cost + node.Heuristics;
            _OpenQueue.push(node);
        }

        #endregion
    }

    public interface AstarCondition : TraversalCondition
    {
        public float getHeuristicsCost(int start, int end);
    }
}
