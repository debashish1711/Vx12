
/********************
*Create a div/circle/sqre shape around the point(x,y) passed as argument
* Considering the upper right corner as the origin(0,0). 'y' is the distance from the top,
* 'x' is the distance from the left
*********************/ 



function drawMenu(x,y) {
		  this.x = x;
		  this.y = y;
          mainDiv = document.getElementsByClassName("ui-widget-content draggable")[0];
		  var canvas = document.createElement("canvas");
     	  // div = document.getElementById("draw");
     	  canvas.id="drawMenu";
          canvas.style.top=y;
          canvas.style.left=x;
          canvas.style.width = "50px";
          canvas.style.height = "50px";
          canvas.style.border   = "solid 1px #000000";
          canvas.style.position = "absolute";
          ctx=canvas.getContext("2d");
          // ctx.fillRect(x,y,70,50);
          ctx.font="40px Arial";
          var display=x+", "+y;
		  ctx.fillText(display,50,75);
         
          canvas.style.color = "black";
          mainDiv.appendChild(canvas);
          var parent = canvas.parentNode;
          
          this.onupdate = function (){};
      }
      
