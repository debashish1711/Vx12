PROJECT = atest

CC = clang
INCLUDE = ../../
HLIB = ../../hlib/hlib.a
CFLAGS = -Wall -g -I$(INCLUDE)

OBJECTS = atest.o

all : $(PROJECT)

.c.o :
	$(CC) -c $(CFLAGS) $<

$(PROJECT) : $(OBJECTS)
	$(CC) $(OBJECTS) -o $(PROJECT) $(HLIB) -lm


clean:
	rm -f *.o $(PROJECT)
