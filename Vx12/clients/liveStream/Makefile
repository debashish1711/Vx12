PROJECT = client

CC = gcc
INCLUDE = ../../
HLIB = ../../hlib/hlib.a
CFLAGS = -Wall -g -pthread -I$(INCLUDE)

OBJECTS = client.o

all : $(PROJECT)

.c.o :
	$(CC) -c $(CFLAGS) $<

$(PROJECT) : $(OBJECTS)
	$(CC) $(OBJECTS) -pthread -o $(PROJECT) $(HLIB) -l json


clean:
	rm -f *.o $(PROJECT)
