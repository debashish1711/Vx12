#include <hlib/hlib.h>

#include <stdio.h>
#include <stdlib.h>
#include <string.h>


int main(int argc, char *argv[])
{
    Display *display = NULL;
    char *host = "localhost";
    int port = 9090;


    display = OpenDisplay("localhost", 9090);
    if (display == NULL) {
        fprintf(stderr, "Unable to connect to display %s:%d\n", host, port);
        exit(1);
    }

    locateObject(display, 50, 50);

    MainLoop(display);

	CloseDisplay(display);

    return 0;
}