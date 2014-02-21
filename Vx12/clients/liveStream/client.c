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
#include <pthread.h>
#include <json/json.h>


#define IPADDRESS "anrl.no-ip.org"
#define PORT 55556
int isAlive = 1;

typedef struct Window{
	char deviceID[50];
	int x1, x2, y1, y2;
	struct Window *next;
}DeviceWindow;
DeviceWindow *head;
pthread_mutex_t mutexWindow;

void contact_server(char*, int, char*);
void drawWindow(Display*);
int replace_node(DeviceWindow*);

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
	drawWindow(display);
}

void mouse_drag_out(Display *display, Event *event, void *data) {
	char msg[128];
	printf("Mouse Drag Out. x: %d->%d,\ty: %d->%d,\tmouseButton: %d\n", event->val.mouse.x, event->val.mouse.x+event->val.mouse.dx, event->val.mouse.y, event->val.mouse.y+event->val.mouse.dy, event->val.mouse.button)
;
	sprintf(msg, "mdudpaout: %d, %d, %d, %d, %d", event->val.mouse.x, event->val.mouse.y, event->val.mouse.dx, event->val.mouse.dy, event->val.mouse.button);
	contact_server(IPADDRESS, PORT, msg);
	drawWindow(display);
}

void mouse_down(Display *display, Event *event, void *data) {
	char msg[128];
	printf("Mouse Down.     x: %d,\t\ty: %d,\t\tmouseButton: %d\n", event->val.mouse.x, event->val.mouse.y, event->val.mouse.button);

	sprintf(msg, "mdown: %d, %d, %d", event->val.mouse.x, event->val.mouse.y, event->val.mouse.button);
	contact_server(IPADDRESS, PORT, msg);
	drawWindow(display);
}


void mouse_up(Display *display, Event *event, void *data) {
	char msg[128];
	printf("Mouse Up.       x: %d,\t\ty: %d,\t\tmouseButton: %d\n", event->val.mouse.x, event->val.mouse.y, event->val.mouse.button);

	sprintf(msg, "mouup: %d, %d, %d", event->val.mouse.x, event->val.mouse.y, event->val.mouse.button);
	contact_server(IPADDRESS, PORT, msg);
	drawWindow(display);
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

void listen_server(){

    int listenfd = 0, connfd = 0, n = 0;
    struct sockaddr_in serv_addr; 
    char recvBuff[1024];

    listenfd = socket(AF_INET, SOCK_STREAM, 0);
    memset(&serv_addr, '0', sizeof(serv_addr));
    memset(recvBuff, '0', sizeof(recvBuff));

    serv_addr.sin_family = AF_INET;
    serv_addr.sin_addr.s_addr = htonl(INADDR_ANY);
    serv_addr.sin_port = htons(9091); 

    bind(listenfd, (struct sockaddr*)&serv_addr, sizeof(serv_addr)); 

    listen(listenfd, 10); 

    printf("Started a new thread\n");

    while(isAlive)
    {
    	printf("Listening for new connections\n");

        connfd = accept(listenfd, (struct sockaddr*)NULL, NULL); 

        while ((n = read(connfd, recvBuff, sizeof(recvBuff)-1)) > 0)
    	{
       		recvBuff[n] = '\0';
       		printf("Received:%s\n", recvBuff);

       		pthread_mutex_lock(&mutexWindow);
       		DeviceWindow *newNode = malloc(sizeof(DeviceWindow));
       		json_object *new_obj, *jobj = json_tokener_parse(recvBuff);
       		new_obj = json_object_object_get(jobj, "deviceID");
       		strcpy(newNode->deviceID, json_object_get_string(new_obj));
       		new_obj = json_object_object_get(jobj, "x1");
       		newNode->x1 = json_object_get_int(new_obj);
       		new_obj = json_object_object_get(jobj, "x2");
       		newNode->x2 = json_object_get_int(new_obj);
       		new_obj = json_object_object_get(jobj, "y1");
       		newNode->y1 = json_object_get_int(new_obj);
       		new_obj = json_object_object_get(jobj, "y2");
       		newNode->y2 = json_object_get_int(new_obj);
       		if(replace_node(newNode)){
       			pthread_mutex_unlock(&mutexWindow);
       			continue;
       		}
       		if(head != NULL)
       			newNode->next = head;
       		else
       			newNode->next = NULL;
       		head = newNode;
       		pthread_mutex_unlock(&mutexWindow);
    	}

        close(connfd);
        memset(recvBuff, '0', sizeof(recvBuff));
        n = 0;
        sleep(1);
     }
}

//Replace a Node if the device id already exists
int replace_node(DeviceWindow *newNode){
	DeviceWindow *temp = head;
	while(temp != NULL){
		if(strcmp(newNode->deviceID, temp->deviceID) == 0){
			printf("replacing existing device window\n");
			strcpy(temp->deviceID, newNode->deviceID);
			temp->x1 = newNode->x1;
			temp->x2 = newNode->x2;
			temp->y1 = newNode->y1;
			temp->y2 = newNode->y2;
			free(newNode);
			return 1;
		}
		else
			temp = temp->next;
	}
	return 0;
}

void drawWindow(Display *display){
	pthread_mutex_lock(&mutexWindow);
	DeviceWindow *temp = head;
	ClearScreen(display);
	while(temp != NULL){
		DrawLine2D(display, temp->x1, temp->y1, temp->x2, temp->y1);	//x-axis parallel line
		DrawLine2D(display, temp->x1, temp->y2, temp->x2, temp->y2);	//x-axis parallel line
		DrawLine2D(display, temp->x1, temp->y1, temp->x1, temp->y2);	//y-axis parallel line
		DrawLine2D(display, temp->x2, temp->y1, temp->x2, temp->y2);	//y-axis parallel line
		temp = temp->next;
	}
	pthread_mutex_unlock(&mutexWindow);
}

int main()
{
    Display *display = NULL;
    char *host = "localhost";
    int port = 9090, ret1;
    
    pthread_t thread1;
    ret1 = pthread_create( &thread1, NULL, (void*)listen_server, (void*) display);
    if(ret1 != 0){
    	fprintf(stderr, "Unable to create new thread");
    	exit(1);
    }

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
    isAlive = 0; //Stopping the listening thread
    return 0;
}
