/*

The MIT License (MIT)
Copyright (c) 2011 Derek Ingrouville, Julien Lord, Muthucumaru Maheswaran

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 
*/

#include <hlib/hlib.h>

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h>

#define IPADDRESS "anrl.no-ip.org"
#define PORT 55556

void contact_server(char *ip, int port, char *message);

/** Event handlers **/
void setup(Display *display, Event *event, void *data) {
    VideoTag(display, "http://localhost:8800/ogg-video/", "video/ogg; codecs='vorbis,theora'", 640, 480);
}

void mouse_move(Display *display, Event *event, void *data) {
	//printf("Mouse Move. x: %d, y: %d, dx: %d, dy: %d, mouseButton: %d\n", event->val.mouse.x, event->val.mouse.y, event->val.mouse.dx, event->val.mouse.dy, event->val.mouse.button);
}

void mouse_drag(Display *display, Event *event, void *data) {
	char msg[128];
	printf("Mouse Drag.     x: %d->%d,\ty: %d->%d,\tmouseButton: %d\n", event->val.mouse.x, event->val.mouse.x+event->val.mouse.dx, event->val.mouse.y, event->val.mouse.y+event->val.mouse.dy, event->val.mouse.button);

	sprintf(msg, "mdrag: %d, %d, %d, %d, %d", event->val.mouse.x, event->val.mouse.y, event->val.mouse.dx, event->val.mouse.dy, event->val.mouse.button);
	contact_server(IPADDRESS, PORT, msg);
}

void mouse_drag_out(Display *display, Event *event, void *data) {
	char msg[128];
	printf("Mouse Drag Out. x: %d->%d,\ty: %d->%d,\tmouseButton: %d\n", event->val.mouse.x, event->val.mouse.x+event->val.mouse.dx, event->val.mouse.y, event->val.mouse.y+event->val.mouse.dy, event->val.mouse.button)
;
	sprintf(msg, "mdudpaout: %d, %d, %d, %d, %d", event->val.mouse.x, event->val.mouse.y, event->val.mouse.dx, event->val.mouse.dy, event->val.mouse.button);
	contact_server(IPADDRESS, PORT, msg);
}

void mouse_down(Display *display, Event *event, void *data) {
	char msg[128];
	printf("Mouse Down.     x: %d,\t\ty: %d,\t\tmouseButton: %d\n", event->val.mouse.x, event->val.mouse.y, event->val.mouse.button);

	sprintf(msg, "mdown: %d, %d, %d", event->val.mouse.x, event->val.mouse.y, event->val.mouse.button);
	contact_server(IPADDRESS, PORT, msg);
}


void mouse_up(Display *display, Event *event, void *data) {
	char msg[128];
	printf("Mouse Up.       x: %d,\t\ty: %d,\t\tmouseButton: %d\n", event->val.mouse.x, event->val.mouse.y, event->val.mouse.button);

	sprintf(msg, "mouup: %d, %d, %d", event->val.mouse.x, event->val.mouse.y, event->val.mouse.button);
	contact_server(IPADDRESS, PORT, msg);
}

void expose_event(Display *display, Event *event, void *data) {
}

void contact_server(char *ip, int port, char *message) {
 	int sockfd, n;
	struct sockaddr_in serveraddr;
    	struct hostent *server;

	/* socket: create the socket */
	sockfd = socket(AF_INET, SOCK_STREAM, 0);
	if (sockfd < 0) { 
	    printf("ERROR opening socket\n");
            return;
	}

	/* gethostbyname: get the server's DNS entry */
	server = gethostbyname(ip);
	if (server == NULL) {
	    fprintf(stderr,"ERROR, no such host as %s\n", ip);
	    exit(0);
	}

	/* build the server's Internet address */
	bzero((char *) &serveraddr, sizeof(serveraddr));
	serveraddr.sin_family = AF_INET;
	bcopy((char *)server->h_addr, (char *)&serveraddr.sin_addr.s_addr, server->h_length);
	serveraddr.sin_port = htons(port);

	/* connect: create a connection with the server */
	if (connect(sockfd, (struct sockaddr *)&serveraddr, sizeof(serveraddr)) < 0) {
	    printf("ERROR connecting\n");
	    return;
	}

	/* send the message line to the server */
	n = write(sockfd, message, strlen(message));
	if (n < 0) {
	    printf("ERROR writing to socket\n");
	    return;
	}
	
	close(sockfd);
}

int main()
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
    RegisterCallback(display, SetupEventType, setup, NULL);
    RegisterCallback(display, ExposeEventType, expose_event, NULL);
    RegisterCallback(display, MouseDragEventType, mouse_drag, NULL);
    RegisterCallback(display, MouseMoveEventType, mouse_move, NULL);
    RegisterCallback(display, MouseDownEventType, mouse_down, NULL);
    RegisterCallback(display, ClickEventType, mouse_up, NULL);
    RegisterCallback(display, MouseDragOutEventType, mouse_drag_out, NULL);
    
    MainLoop(display);
    
    printf("Closing Display\n");
    CloseDisplay(display);
    return 0;
}
