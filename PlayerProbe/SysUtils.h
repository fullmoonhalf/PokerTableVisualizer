#ifndef SYS_UTILS_H
#define SYS_UTILS_H

#define __DUMP_FL__ Serial.printf("<%s:%d>\r\n", __FILE__, __LINE__);
#define __ARRAY_SIZE__(x)  (sizeof((x))/sizeof((x)[0]))

#endif /* SYS_UTILS_H */