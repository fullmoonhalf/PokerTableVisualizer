#if TEST
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using until.system;
using until.develop;



namespace until.develop
{
    #region DevelopCommandKind
    public enum DevelopCommandKind
    {
        Command,
        Bool,
        Int,
        Float,
    }
    #endregion

    #region DevelopCommandIdentifier
    public class DevelopCommandIdentifier
    {
        public string Page;
        public string Name;
    }
    #endregion

    #region DevelopCommand
    public interface DevelopCommand
    {
        DevelopCommandKind Kind { get; }
        string Name { get; }
        string Description { get; }

        bool IsActive { get; }
        int IntValue { get; }
        float FloatValue { get; }

        void onDevelopCountup(int value);
        void onDevelopCountdown(int value);
        void onDevelopExecute();
    }
    #endregion

    #region DevelopCommandBool
    public class DevelopCommandBool : DevelopCommand
    {
        public DevelopCommandKind Kind => DevelopCommandKind.Bool;

        public string Name => _Name;
        public string Description => _Description;
        public bool IsActive => _Value;
        public int IntValue => 0;
        public float FloatValue => 0.0f;

        private string _Name = "";
        private string _Description = "";
        private bool _Value = false;

        public DevelopCommandBool(string name, string description, bool default_value)
        {
            _Name = name;
            _Description = description;
            _Value = default_value;
        }

        public void onDevelopCountdown(int value)
        {
            _Value = false;
        }

        public void onDevelopCountup(int value)
        {
            _Value = true;
        }

        public void onDevelopExecute()
        {
        }
    }
    #endregion

    #region DevelopCommandInt
    public class DevelopCommandInt : DevelopCommand
    {
        public DevelopCommandKind Kind => DevelopCommandKind.Int;

        public string Name => _Name;
        public string Description => _Description;
        public bool IsActive => _Value != 0;
        public int IntValue => _Value;
        public float FloatValue => (float)_Value;

        private string _Name = "";
        private string _Description = "";
        private int _Value = 0;
        private int _Min = int.MinValue;
        private int _Max = int.MaxValue;

        public DevelopCommandInt(string name, string description, int default_value, int min = 0, int max = 128)
        {
            _Name = name;
            _Description = description;
            _Value = default_value;
            _Min = min;
            _Max = max;
        }

        public void onDevelopCountdown(int value)
        {
            _Value = Math.Max(_Value - value, _Min);
        }

        public void onDevelopCountup(int value)
        {
            _Value = Math.Min(_Value + value, _Max);
        }

        public void onDevelopExecute()
        {
        }
    }
    #endregion


    #region DevelopCommandInt
    public class DevelopCommandFloat : DevelopCommand
    {
        public DevelopCommandKind Kind => DevelopCommandKind.Float;

        public string Name => _Name;
        public string Description => _Description;
        public bool IsActive => _Value != 0.0f;
        public int IntValue => (int)_Value;
        public float FloatValue => _Value;

        private string _Name = "";
        private string _Description = "";
        private float _Value = 0;
        private float _Min = -float.MaxValue;
        private float _Max = float.MaxValue;
        private float _Step = 1.0f;

        public DevelopCommandFloat(string name, string description, float default_value, float step = 1.0f, float min = -1.0f, float max = 1.0f)
        {
            _Name = name;
            _Description = description;
            _Value = default_value;
            _Min = min;
            _Max = max;
            _Step = step;
        }

        public void onDevelopCountdown(int value)
        {
            _Value = Math.Max(_Value - value * _Step, _Min);
        }

        public void onDevelopCountup(int value)
        {
            _Value = Math.Min(_Value + value * _Step, _Max);
        }

        public void onDevelopExecute()
        {
        }
    }
    #endregion




}


#endif
