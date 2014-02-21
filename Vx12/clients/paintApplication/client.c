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

int rect_x = 50;
int rect_y = 50;
int width = 45;
int height = 45;

int arc_x = 150;
int arc_y = 250;
int arc_w = 60;
int arc_h = 75;
float arc_start = 1.57;
float arc_stop = 3.14;

int text_x = 10;
int text_y = 10;

int rect_start_x = 0;
int rect_start_y = 0;

enum drawtypes {
	BRUSHER,
	ERASER,
	RECT,
	LINE,
	ELLIPSE
} drawtypes;

int layerdraw = 0;
int drawtype = BRUSHER;


int is_inside_rectangle(int x, int y)
{
    int right = rect_x + width;
    int bottom = rect_y + height;
    
    if (x >= rect_x && x <= right) {
        if (y >= rect_y && y <= bottom)
            return 1;
    }
    
    return 0;
}

void resize(Display *display, Event *event, void *data) {
    printf("Resize handler!\n");
    printf("Width: %d\t Height: %d\n", event->val.win.width, event->val.win.height);
}

/** Event handlers **/
void setup(Display *display, Event *event, void *data) {
    printf("In setup\n");
    printf("Width: %d\t Height: %d\n", event->val.win.width, event->val.win.height);
    /* Move this to a separate setup() function, callback-based */
    Size(display, 640, 480);
    Fill1i(display, 0);
    LoadFont(display, "Courier New", 10);
    CreateToolbar(display);
    locateObject(display, 75, 75);

    AddButton(display, "brusher", "Brusher");
    AddButton(display, "eraser", "Eraser");
    AddButton(display, "rect", "Rect");
    AddButton(display, "line", "Line");
    AddButton(display, "ellipse", "Ellipse");
    
    CreatePallet(display, "primaryColor", "#000000");
    CreatePallet(display, "secondaryColor", "#B03A3A");
    
    AttachLayer(display);
}

void mouse_move(Display *display, Event *event, void *data) {
    if (drawtype == ERASER) {
	    ClearScreen(display);
	    PushStyle(display);
	    StrokeWeight(display, 1);
	    Stroke1i(display, 0);
	    Fill1i(display, 255);
	    DrawRectangle(display, event->val.mouse.x-25, event->val.mouse.y-25, 50, 50);
	    PopStyle(display);
    }
}

void mouse_drag(Display *display, Event *event, void *data) {
    if (!layerdraw) {
	    PushStyle(display);
	    StrokeWeight(display, 5);
	    if (event->val.mouse.button == LEFT) {
		StrokePallet(display, "primaryColor");
	    } else if (event->val.mouse.button == MIDDLE) {
		PopStyle(display);
		return;
	    } else if (event->val.mouse.button == RIGHT) {
		StrokePallet(display, "secondaryColor");
	    }
	    int curX = event->val.mouse.x;
	    int curY = event->val.mouse.y;
	    int prevX = event->val.mouse.x - event->val.mouse.dx;
	    int prevY = event->val.mouse.y - event->val.mouse.dy;
	    DrawLine2D(display, prevX, prevY, curX, curY);
	    PopStyle(display);
    }
    else if (event->val.mouse.button == LEFT)
    {
    	if (drawtype != ERASER) {
	    	PushStyle(display);
	    	StrokeWeight(display, 5);
	    	StrokePallet(display, "secondaryColor");
	    	FillPallet(display, "primaryColor");
	    	ClearScreen(display);
	    	if (drawtype == RECT)
	    	    DrawRectangle(display, rect_start_x, rect_start_y, event->val.mouse.x-rect_start_x, event->val.mouse.y-rect_start_y);
	    	else if (drawtype == ELLIPSE) {
				int width = event->val.mouse.x-rect_start_x, height = event->val.mouse.y-rect_start_y;
				if (width < 0 && height < 0)
					DrawEllipse(display, rect_start_x+width*0.5, rect_start_y+height*0.5, -width, -height);
				else
					DrawEllipse(display, rect_start_x+width*0.5, rect_start_y+height*0.5, width, height);
	    	}
	    	else if (drawtype == LINE)
	    	    DrawLine2D(display, rect_start_x, rect_start_y, event->val.mouse.x, event->val.mouse.y);
	    	PopStyle(display);
        }
		else
        {
		    Erase(display, event->val.mouse.x-25, event->val.mouse.y-25, 50, 50);
        }
    }
}

void mouse_drag_out(Display *display, Event *event, void *data)
{
    printf("Drag out!\n");
    //SendText(display, text_x, text_y, "Drag Out!");
}

void mouse_down(Display *display, Event *event, void *data) {
    if (layerdraw) {
    	if (event->val.mouse.button == LEFT) {
        	rect_start_x = event->val.mouse.x;
        	rect_start_y = event->val.mouse.y;
	    	if (drawtype == ERASER)
	    	{
	    		Erase(display, event->val.mouse.x-25, event->val.mouse.y-25, 50, 50);
	    	}
    	}
    }
}


void mouse_up(Display *display, Event *event, void *data) {
    if (layerdraw) {
    	if (event->val.mouse.button == LEFT) {
	    	ClearScreen(display);
	    	SwitchScreen(display, "root"); //switch to draw permanently on the root canvas
    		PushStyle(display);
    		StrokePallet(display, "secondaryColor");
    		FillPallet(display, "primaryColor");
	        StrokeWeight(display, 5);
	        if (drawtype == RECT)
			DrawRectangle(display, rect_start_x, rect_start_y, event->val.mouse.x-rect_start_x, event->val.mouse.y-rect_start_y);
	        else if (drawtype == ELLIPSE) {
			int width = event->val.mouse.x-rect_start_x, height = event->val.mouse.y-rect_start_y;
			if (width < 0 && height < 0)
				DrawEllipse(display, rect_start_x+width*0.5, rect_start_y+height*0.5, -width, -height);
			else
				DrawEllipse(display, rect_start_x+width*0.5, rect_start_y+height*0.5, width, height);
		}
	        else if (drawtype == LINE)
			DrawLine2D(display, rect_start_x, rect_start_y, event->val.mouse.x, event->val.mouse.y);
    		PopStyle(display);
	    	SwitchScreen(display, "layer"); //switch back to the layer canvas
    	}
    }
}

void push_draw_style(Display *display, int style)
{	
	SwitchScreen(display, "layer");
	ClearScreen(display);
	layerdraw = 1;
	drawtype = style;
}

void button_click(Display *display, Event *event, void *data) {
	if (strcmp(event->val.button.id, "brusher") == 0) {
		if (layerdraw)
			ClearScreen(display);
		SwitchScreen(display, "root");
		drawtype = BRUSHER;
		layerdraw = 0;
	}
	else if (strcmp(event->val.button.id, "eraser") == 0) {
		push_draw_style(display, ERASER);
	}
	else if (strcmp(event->val.button.id, "rect") == 0) {
		push_draw_style(display, RECT);
	}
	else if (strcmp(event->val.button.id, "line") == 0) {
		push_draw_style(display, LINE);
	}
	else if (strcmp(event->val.button.id, "ellipse") == 0) {
		push_draw_style(display, ELLIPSE);
	}
}

void expose_event(Display *display, Event *event, void *data)
{
    
}

void click_event(Display *display, Event *event, void *data)
{
    text_y += 20;
    if (text_y > 500) {
      text_x += 70;
      if (text_x > 500) {
        text_x %= 500;
        /* repaint the display */
        ClearScreen(display);
      }
      text_y %= 500;
    }
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
    RegisterCallback(display, ExposeEventType, expose_event, NULL);
    RegisterCallback(display, ClickEventType, click_event, NULL);
    RegisterCallback(display, SetupEventType, setup, NULL);
    RegisterCallback(display, MouseDragEventType, mouse_drag, NULL);
    RegisterCallback(display, MouseMoveEventType, mouse_move, NULL);
    RegisterCallback(display, MouseDownEventType, mouse_down, NULL);
    RegisterCallback(display, ButtonClickEventType, button_click, NULL);
    RegisterCallback(display, ClickEventType, mouse_up, NULL);
    RegisterCallback(display, MouseDragOutEventType, mouse_drag_out, NULL);
    RegisterCallback(display, Resize, resize, NULL);
    
    MainLoop(display);
    
    printf("Closing Display\n");
    CloseDisplay(display);
    return 0;
}
