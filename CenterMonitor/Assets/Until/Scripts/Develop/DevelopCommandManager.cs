#if TEST
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using until.system;
using until.develop;



namespace until.develop
{
    public class DevelopCommandManager : Singleton<DevelopCommandManager>
    {
        #region Definitions.
        const int LINE_HEIGHT = 20;

        private class Page
        {
            public string Title = "";
            public List<DevelopCommand> Entries = new List<DevelopCommand>();
            public int CurrentElement = 0;

            public void update()
            {
                if (Entries.Count <= 0)
                {
                    return;
                }

                // €–ÚØ‚è‘Ö‚¦
                if (Singleton.InputManager.isTrig(InputPad.Player1, InputButton.LDown))
                {
                    --CurrentElement;
                    if (CurrentElement < 0)
                    {
                        CurrentElement = Entries.Count - 1;
                    }
                }
                else if (Singleton.InputManager.isTrig(InputPad.Player1, InputButton.LUp))
                {
                    ++CurrentElement;
                    if (CurrentElement >= Entries.Count)
                    {
                        CurrentElement = 0;
                    }
                }
                if (Singleton.InputManager.isTrig(InputPad.Player1, InputButton.LLeft))
                {
                    Entries[CurrentElement].onDevelopCountdown(1);
                }
                else if (Singleton.InputManager.isTrig(InputPad.Player1, InputButton.LRight))
                {
                    Entries[CurrentElement].onDevelopCountup(1);
                }
                if (Singleton.InputManager.isTrig(InputPad.Player1, InputButton.RDown))
                {
                    Entries[CurrentElement].onDevelopExecute();
                }
            }

            public void draw(Rect screen)
            {
                if (Entries.Count <= 0)
                {
                    return;
                }

                var line_num = (int)(screen.height / LINE_HEIGHT);
                var rect = new Rect();
                rect.x = screen.x;
                rect.y = screen.y;
                rect.width = screen.width;
                rect.height = LINE_HEIGHT;

                var start_index = Math.Max(CurrentElement - line_num + 1, 0);
                var count = Entries.Count;
                if (count < line_num)
                {
                    start_index = 0;
                }

                for (int index = 0; index < line_num; ++index)
                {
                    var entry_index = index + start_index;
                    if (entry_index >= count)
                    {
                        break;
                    }
                    var element = Entries[entry_index];
                    var cursor = entry_index == CurrentElement ? $">{entry_index:D2}<" : $"[{entry_index:D2}]";
                    var value = "";
                    switch (element.Kind)
                    {
                        case DevelopCommandKind.Bool:
                            value = element.IsActive ? "[T]" : "[F]";
                            break;
                        case DevelopCommandKind.Int:
                            value = $"{element.IntValue}";
                            break;
                        case DevelopCommandKind.Float:
                            value = $"{element.FloatValue:F1}";
                            break;
                        default:
                            break;
                    }
                    rect.y += LINE_HEIGHT;
                    GUI.Label(rect, $"{cursor} {element.Name} {value}");
                }
            }
        }

        private class Book
        {
            public List<Page> Pages = new List<Page>();
            public bool Visible = false;
            public int CurrentPage = 0;


            public void update()
            {
                if (Pages.Count <= 0)
                {
                    return;
                }

                // ƒy[ƒWØ‚è‘Ö‚¦
                if (Singleton.InputManager.isTrig(InputPad.Player1, InputButton.L1))
                {
                    --CurrentPage;
                    if (CurrentPage < 0)
                    {
                        CurrentPage = Pages.Count - 1;
                    }
                }
                else if (Singleton.InputManager.isTrig(InputPad.Player1, InputButton.R1))
                {
                    ++CurrentPage;
                    if (CurrentPage >= Pages.Count)
                    {
                        CurrentPage = 0;
                    }
                }

                Pages[CurrentPage].update();
            }

            public void draw(Rect screen)
            {
                if (Pages.Count <= 0)
                {
                    return;
                }

                var rect = new Rect(screen);
                var page = Pages[CurrentPage];
                rect.height = LINE_HEIGHT;
                GUI.Label(rect, $"* <{CurrentPage:D2}> {page.Title}");

                rect.y += LINE_HEIGHT;
                rect.height = screen.height - LINE_HEIGHT;
                page.draw(screen);
            }
        }
        #endregion

        #region Methods
        private Book _Book = null;
        #endregion

        #region Methods
        #region Singleton
        public override void onSingletonAwake()
        {
            _Book = new Book();
        }

        public override void onSingletonStart()
        {
        }

        public override void onSingletonDestroy()
        {
            _Book = new Book();
        }
        #endregion

        #region service
        public void update()
        {
            if (_Book.Visible)
            {
                _Book.update();
            }
            if (Singleton.InputManager.isDown(InputPad.Player1, InputButton.L3))
            {
                if (Singleton.InputManager.isTrig(InputPad.Player1, InputButton.R3))
                {
                    _Book.Visible = !_Book.Visible;
                }
            }
        }

        public void draw(Rect screen)
        {
            if (_Book.Visible)
            {
                _Book.draw(screen);
            }
        }
        #endregion

        #region Setup
        public void addPage(string page_name)
        {
            var page = new Page();
            page.Title = page_name;
            _Book.Pages.Add(page);
        }

        public void addCommand(string page_name, DevelopCommand command)
        {
            var page = findPage(page_name);
            if (page == null)
            {
                return;
            }
            page.Entries.Add(command);
        }
        #endregion

        #region Management
        private Page findPage(string name)
        {
            return _Book.Pages.Find(page => page.Title == name);
        }

        public DevelopCommand getCommand(DevelopCommandIdentifier identifier)
        {
            var page = _Book.Pages.Find(page => page.Title == identifier.Page);
            if (page == null)
            {
                return null;
            }
            return page.Entries.Find(element => element.Name == identifier.Name);
        }
        #endregion

        #endregion
    }
}


#endif
