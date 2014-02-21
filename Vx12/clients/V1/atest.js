function atest(x, y) {

    mainDiv = document.getElementsByClassName("ui-widget-content draggable")[0];
    var canvas = document.createElement("canvas");
          
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


}
