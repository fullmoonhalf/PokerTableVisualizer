#ifndef SYS_MODE_H
#define SYS_MODE_H


class SysMode
{
public:
    virtual void start() = 0;
    virtual void end() = 0;
    virtual void update() = 0;
    virtual void draw() = 0;
};


#endif // SYS_MODE_H
