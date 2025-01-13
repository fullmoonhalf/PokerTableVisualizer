#ifndef GUI_GAUGE_H
#define GUI_GAUGE_H
#include <M5Unified.h>


class GuiGauge
{
public:
    GuiGauge(M5GFX *display, int current_value, int max_value, int width, int height);
    ~GuiGauge();

    void update();
    void draw(int x, int y);
    void setCurrentValue(int current_value);

private:
    LGFX_Sprite *_Sprite;
    int _CurrentValue;
    int _MaxValue;
    int _Width;
    int _Height;
    bool _NeedToUpdate;
};



#endif /* GUI_GAUGE_H */