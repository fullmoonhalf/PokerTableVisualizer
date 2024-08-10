using System;
using System.IO.Ports;
using until.develop;
using until.system;



namespace PokerTableVisualizer
{
    public class ModeBoot : BootMode
    {
        private SerialPort _SerialPort;


        #region Mode
        public Mode.Control init()
        {
            _SerialPort = new SerialPort("COM4", 9600, Parity.None, 8, StopBits.One);
            _SerialPort.Open();
            return Mode.Control.Done;
        }

        public Mode.Control update()
        {
            var line = _SerialPort.ReadLine();
            Log.info(this, line);
            return Mode.Control.Keep;
        }

        public Mode.Control exit()
        {
            return Mode.Control.Done;
        }
        #endregion
    }
}

