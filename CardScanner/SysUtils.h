#ifndef _INCLUDED_SYS_UTILS
#define _INCLUDED_SYS_UTILS

#define __DUMP_FL__ Serial.printf("<%s:%d>\r\n", __FILE__, __LINE__);
#define __ARRAY_SIZE__(x)  (sizeof((x))/sizeof((x)[0]))

#endif // _INCLUDED_SYS_UTILS
