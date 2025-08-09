#include <cstdarg>   // va_list, va_start, va_end
#include <cstdio>    // vsnprintf など
#include <cstring>
#include <M5Unified.h>
#include "SysLog.h"


void SysLog::printf(const char *category, const char *format, ...)
{
    // 文字列構築
    constexpr size_t BUF_SIZE = 256;
    char buffer[BUF_SIZE];
    va_list args;
    va_start(args, format);
    vsnprintf(buffer, BUF_SIZE, format, args);  // 安全に文字列生成
    va_end(args);

    // 出力
    Serial.printf("[%s] %s\r\n", category, buffer);
}
