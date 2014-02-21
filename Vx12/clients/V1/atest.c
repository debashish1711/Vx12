
// another file...
#include <stdio.h>
#include <hlib/hlib.h>
#include <stdlib.h>
#include <string.h> 



void atest(Display *display, char *x, char *y) {
call_user_def(display, "atest", "ss", x, y);}

void setup(Display *display, Event *event, void *data){
	    atest(display, "70px", "100px");
}








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
     
    /* Register Callbacks */
 /*   RegisterCallback(display, ExposeEventType, expose_event, NULL);
    RegisterCallback(display, MouseMoveEventType, mouse_move, NULL); */
    RegisterCallback(display, SetupEventType, setup, NULL);

    
    MainLoop(display);

    CloseDisplay(display);
    return 0;
}