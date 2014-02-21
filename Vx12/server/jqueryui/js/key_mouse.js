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

var _fitScreen = false;
var _Attached  = false;
var _screenLayer = false;
var keyCount = new Array();
var count=0;


	function keyEvent(e) {
  		var eventObj = window.event ? window.event : e;
    	var unicode = eventObj.charCode? eventObj.charCode : eventObj.keyCode;
    	var actualKey = String.fromCharCode(unicode);
    	var flag=true;
    	if(actualKey == 'p')
    	{
    	 	ws_server = "ws://localhost:7070/1_Handler";
			document.getElementById("app").href="1/custom.css";
    	}
    	else if(actualKey == 'w')
    	{
    		ws_server = "ws://localhost:7070/2_Handler";
    	    document.getElementById("app").href="2/custom.css";
    	}	
      	if(document.getElementById(actualKey))
      	{
       		removeDiv(actualKey);
       		flag=false;
      	}
      else
        flag=true;
  
    	if(flag)
    	{
    		loadCanvas(actualKey);
    		 // createDiv(actualKey);
		 }
		 implement(actualKey);
 	};

  	 document.onkeypress = keyEvent ;

     function createDiv(actualKey)
     {
      mainDiv = document.getElementsByClassName("ui-widget-content draggable")[0];
  //	 	  mainDiv = document.getElementById("image");
      var div = document.createElement("div");
      div.id = actualKey;
      div.style.width = "200px";
      div.style.height = "150px";
      div.style.background = "transparent";
      div.style.color = "white";
      div.style.marginBottom = 10;
      div.style.marginTop = 10;
      div.innerHTML = actualKey;
      // document.body.appendChild(div); 
      mainDiv.appendChild(div);
     }

	

       function loadCanvas(key) {
          // div = document.getElementById(id);
          // div = document.getElementById("ui");
          createDiv(key);
          var canvas = document.createElement("canvas");
		  div = document.getElementById(key);
          keyCount.push(key+"rt");
          canvas.id     = keyCount[count];
          count = count+1;
    	  canvas.style.top="10px";
    	  canvas.style.left="10px";
          canvas.style.border   = "solid 1px #000000";
          canvas.style.position = "absolute";
          div.appendChild(canvas);
          var parent = canvas.parentNode;
      }

	function removeDiv(e)
  	 {
  	   var div = document.getElementById(e);
       div.remove();
     }  
       
// $(document).ready(function() {
  	function implement(key){
  	 //var currentCanvas     = "root";
  	var currentCanvas = key + "rt";

    $.p = Processing.getInstanceById;
    /* There's something to be said for moving all these off into
     * a single Object instead of multiple Arrays.
     * Left to the TODO pile for now
     */ 
    var _codedKeys = [16, 17, 18, 20, 33, 34, 35, 36, 37, 38, 39, 40, 144, 155, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 157]; //pjs thing
    var _text_areas       = new Array();
    var _buttons          = new Array();
    var _remote_vars      = new Array();
    var _loaded_fonts     = new Array();
    var _pmx              = -1;
    var _pmy              = -1; 
    /* Initialise callback checks to false */
    /* TODO: Maybe template this file and have twisted insert these values on the fly? */
    var _keys        = new Array();
    _keys['TYP']        = "NONE";
    _keys['PRE']        = "NONE";
    
    var _cb             = new Array();
    _cb['CLICK']         = false;
    _cb['MMOVE']         = false;
    _cb['MDRAG']         = false;
    _cb['MDRAGOUT']      = false;
    _cb['MDOWN']         = false;
    _cb['DROP']          = false;
    _cb['BCLICK']        = false;
    _cb['RESIZE']        = false;
    /* Callbacks for keys can be everything or individual keys */
    _cb['KEYST']        = false;
    _cb['KEYSP']        = false;
    _cb['KEYSR']        = false;
    
    var ws;
    ws = new WebSocket(ws_server);

    
       var canvas = document.getElementById("root");
       var parent = canvas.parentNode;
      //var canvas = document.getElementById(keyCount[count]);
      var canvas = document.getElementById(key + "rt");
    // attaching the Processing engine to the canvas
    try
    {
    p = new Processing(canvas);
    p.noLoop();
    p.background(0,0);
  
    ws.onmessage = function(evt) {
        handleEvent("("+evt.data+")", p);
    };
    ws.onopen = function(evt) {
        var str = "EVENT SETUP " + document.width + " " + document.height + "\n";
        ws.send(str);
        $('#conn_status').html('<b>Connected</b>');
        sendExpose(ws);
    };
    ws.onerror = function(evt) {
        $('#conn_status').html('<b>Error</b>');
    };
    ws.onclose = function(evt) {
        //clearCanvas(p);
        $('#conn_status').html('<b>Closed</b>');
    };
    $(function() {
        $( ".draggable" ).draggable({cancel: "canvas, textarea"});
        $( "div.draggable, canvas" ).disableSelection();
    });
    function pollRemoteValue(name) {
        if (name in _remote_vars) {
            ws.send("POLL " + name + " " + _remote_vars[name] + "\n");
        } else {
            ws.send("POLL " + name + " NULL\n");
        }
    }
    function setRemoteVariable(name, newValue) {
        /* NB This will overwrite existing variables with the same name */
        _remote_vars[name] = value;
    }
    
    function handleEvent(cmd, p) {
        cmd = eval(cmd);
        switch(cmd.name) {
            case "CREATE_TOOLBAR":
    		    var a = $(document.createElement("div"));
    		    $(".ui-widget-content").prepend(
    			a.attr("id", "toolbar")
    		    );
                break;
            case "CREATE_PALLET":
    		    var a = $(document.createElement("input"));
    		    $("div#toolbar").append(
    		    	a.attr("type", "hidden")
    		    	.attr("id", cmd.args[0]) //pallet name
    		    	.attr("class", "color-picker")
    		    	.attr("value", cmd.args[1]) //default color
    		    );
    		    $(".color-picker").miniColors()
                break;
            case "ADD_BUTTON":
        		var a = $(document.createElement("input"));
        		$("div#toolbar").append(
        		    a.attr("type", "radio")
        		    .attr("id", cmd.args[0])
        		    .attr("name", "radio")
        		    .click(function () {sendButtonClicked(ws, cmd.args[0])})
        		);
        		a = $(document.createElement("label"));
        		$("div#toolbar").append(
        		    a.attr("for", cmd.args[0])
        		    .text(cmd.args[1])
        		);

    	        $("div#toolbar > :first").attr("checked", "checked");
    	        $("div#toolbar").buttonset();
                break;
            case "VIDEOTAG":
    	        var a = $(document.createElement("video"));
    	        $(".ui-widget-content").prepend(
    	    	    a.attr({id: "livevideo", autoplay: "true"})
    		    .css("position", "absolute")
    		    .css("left", "10px")
    		    .css("top", "10px")
    	        );
        		var a = $(document.createElement("source"));
        		$("#livevideo").append(
        			a.attr({type: cmd.args[1], src: cmd.args[0]})
        		);

        		$("#root").css("position", "absolute")
        			  .css("left", "10px")
        			  .css("top", "10px")
        			  .css("border", "0px");
        		$("#root").parent().height(cmd.args[3]+20).width(cmd.args[2]+20);
        		$.p(currentCanvas).background(0, 0);
        		$.p(currentCanvas).size(cmd.args[2], cmd.args[3]);
                break;
            case "TXT":
                $.p(currentCanvas).text(cmd.args[0], cmd.args[1], cmd.args[2]);
                break;
         
            case "CM_D":
            case "CM_F":
                /* NB there's now redundancy since we don't need to cast arguments anymore */
                $.p(currentCanvas).colorMode(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3]);
                break;
            case "ST_D": 
            case "ST_F":
                $.p(currentCanvas).stroke(cmd.args[0], cmd.args[1], cmd.args[2]);
                break;
            case "FI_D":
            case "FI_F":
                $.p(currentCanvas).fill(cmd.args[0], cmd.args[1], cmd.args[2]);
                break;
            case "STW":
                $.p(currentCanvas).strokeWeight(cmd.args[0]);
                break;
            case "NOST":
                $.p(currentCanvas).noStroke();
                break;
            case "NOFI":
                $.p(currentCanvas).noFill();
                break;
            case "PUSH_STYLE":
                $.p(currentCanvas).pushStyle();
                break;
            case "POP_STYLE":
                $.p(currentCanvas).popStyle();
                break;
            case "ATTACH_LAYER":
                var rootPos = $("#root").position();
                var elementCreator = $(document.createElement("canvas"));
                $("#root").after(
                    elementCreator.attr("id", "layer")
                    //.attr("data-processing-sources", "/%(appid)s/test.pde")
                    .css("border", "solid 0px #FF0000")
                    .css("position", "absolute")
                    .css("left", rootPos.left)
                    .css("top", rootPos.top)
                    .css("z-index", "1")
                );

                var canvasLayer = document.getElementById("layer");
                q = new Processing(canvasLayer);
                q.noLoop();
                q.size($("#root").width(), $("#root").height());
                q.background(0,0);
                q.mousePressed = p.mousePressed;
                q.mouseReleased = p.mouseReleased;
                q.mouseDragged = p.mouseDragged;
                q.mouseMoved = p.mouseMoved;
                
                $("#root").css("z-index", "2");
                
                _layerAttached = true;
                
                break;
            case "SIZE":
                var width = cmd.args[0], height = cmd.args[1];
                p.size(width, height);
                $(canvas).parent().width(width);
                $(canvas).parent().height(height);
                
                if (_Attached) {
                    q.size(width, height);
                }
                break;
            case "SWITCH_SCREEN":
    	    	if (cmd.args[0] == "root") {
    			currentCanvas = "root";
    		    	$("#").css("z-index", "1");
    		    	_screen = false;
    	    	}
    	    	else {
    			currentCanvas = "";
    		    	$("#").css("z-index", "3");
    		    	_screen = true;
    	    	}
                break;
            case "FIT_SCREEN":
                _fitScreen = true;
                var width = $(window).width, height = $(window).height;
                $.p(currentCanvas).size(width, height);
                $(canvas).parent().width(width);
                $(canvas).parent().height(height);
                
                if (_Attached) {
                    q.size(width, height);
                }
                break;
            
            case "CLEAR":
                $.p(currentCanvas).background(0, 0);
                break;
            case "REG_CB":
                for(i in cmd.args) {
                var event = cmd.args[i];
                    if (event in _cb) {
                        _cb[event] = true;
                        if ( event === 'DROP' ) {
                            canvas.addEventListener('dragover', dropHelper, false);
                            canvas.addEventListener('drop', dropListener, false);
                        }
                    }
                }
                break;
            case "CB_KEY_T":
                if (cmd.args[0] === "ALL") {
                    _cb['KEYST'] = true;
                } else {
                    _cb['KEYST'] = cmd.args;
                }
                break;
            case "CB_KEY_T_STOP":
                if (cmd.args.length > 1)
                    _keys['TYP'] = cmd.args;
                else
                    _keys['TYP'] = cmd.args[0];
                break;
            case "CB_KEY_P":
                if (cmd.args[0] === "ALL") {
                    _cb['KEYSP'] = true;
                } else {
                    _cb['KEYSP'] = cmd.args;
                }
                break;
            case "CB_KEY_P_STOP":
                if (cmd.args.length > 1)    
                    _keys['PRE'] = cmd.args;
                else
                    _keys['PRE'] = cmd.args[0];
                break;
            case "CB_KEY_R":
                if (cmd.args[0] === "ALL") {
                    _cb['KEYSR'] = true;
                } else {
                    _cb['KEYSR'] = cmd.args;
                }
                break;
            case "VAR":
                setRemoteVariable(cmd.args[0], cmd.args[1]);
                break;
            case "NEW_TXT_AREA":
                /* Create a floating TextArea. Position is relative to the main display. */
                /* Add the new TextArea to the list of defined TextAreas before returning. */
                var root = $("#root");
                var str = "<textarea id='"+cmd.args[0]+"'";
                str += (cmd.args[5] == 1) ? " readonly/>" : "/>";
                $(root).parent().append(str);
                var txt_area = $("#"+cmd.args[0]);
                var o = new Object;
                o.left = $(root).offset().left + cmd.args[1];
                o.top = $(root).offset().top + cmd.args[2]; 
                $(txt_area).offset(o);
                $(txt_area).width(cmd.args[3]);
                $(txt_area).height(cmd.args[4]);
                _text_areas[cmd.args[0]] = txt_area;
                // $(txt_area).keypress( $.p(currentCanvas).keyPressed() );
                // $(txt_area).keyup( $.p(currentCanvas).keyReleased() );
                break;
            case "CREATE_BUTTON":
                var button = $(document.createElement("button"));
                $("div.ui-widget-content").append(
                    button.attr("id", cmd.args[0])
                    .attr("text", cmd.args[1])
                );
            case "TXT_AREA_CSS":
                var id     = cmd.args[0];
                var n    = cmd.args[1];
                var v    = cmd.args[2];
                if (id in _text_areas) {
                    var txt_area = _text_areas[id];
                    $(txt_area).css(n, v);
                }
                break;
            case "OVERWRITE":
                if (cmd.args[0] in _text_areas) {
                    $("#"+cmd.args[0]).text(cmd.args[1]);
                }
                break;
            case "APPEND":
                if (cmd.args[0] in _text_areas) {
                    var t = $("#"+cmd.args[0]).text();
                    $("#"+cmd.args[0]).text(t + cmd.args[1]);
                }
                break;
            case "PRELOAD":
                // $("body").prepend("<div class='preload' style='font-family:"+cmd.args[0]+";'>preloaded: "+cmd.args[0]+"</div>");
                // $(".preload").hide();
                break;
          
            case "USER_DEF":
            	function testcode() {
            		var n=cmd.args.length;

					var fn = cmd.args[0];
					fn=eval(fn);
					
					switch(n)
				 	{
					 case 1:
						 fn();
						 break;
					 case 2:
						 var a=cmd.args[1];
						 fn(a);
						 break;
					 case 3:
						 var a=cmd.args[1];
            			 var b=cmd.args[2];
            			 fn(a,b);
            			 break;
            		 case 4:
            			 var a=cmd.args[1];
            			 var b=cmd.args[2];
            			 var c=cmd.args[3];
            			 fn(a,b,c);
            			 break;
            		 case 5:
            			 var a=cmd.args[1];
            			 var b=cmd.args[2];
            			 var c=cmd.args[3];
            			 var d=cmd.args[4];
            			 fn(a,b,c,d);
            			 break;
            		 case 6:
            			 var a=cmd.args[1];
            			 var b=cmd.args[2];
            			 var c=cmd.args[3];
            			 var d=cmd.args[4];
            			 var e=cmd.args[5];
            			 fn(a,b,c,d,e);
            			 break;
            		 case 7:
            			 var a=cmd.args[1];
            			 var b=cmd.args[2];
            			 var c=cmd.args[3];
            			 var d=cmd.args[4];
            			 var e=cmd.args[5];
            			 var f=cmd.args[6];
            			 fn(a,b,c,d,e,f);
            			 break;
            		 case 8:
            			 var a=cmd.args[1];
            			 var b=cmd.args[2];
            			 var c=cmd.args[3];
            			 var d=cmd.args[4];
            			 var e=cmd.args[5];
            			 var f=cmd.args[6];
            			 var g=cmd.args[7];
            			 fn(a,b,c,d,e,f,g);
            			 break;
            		 case 9:
            			 var a=cmd.args[1];
            			 var b=cmd.args[2];
            			 var c=cmd.args[3];
            			 var d=cmd.args[4];
            			 var e=cmd.args[5];
            			 var f=cmd.args[6];
            			 var g=cmd.args[7];
            			 var h=cmd.args[8];
            			 fn(a,b,c,d,e,f,g,h);
            			 break;
				 	}
				
				 };
            	
				var fileref=document.createElement("script");
  				fileref.setAttribute("type","text/javascript");
  				var filepath = "clients/V1/" + cmd.args[0] + ".js";
  				fileref.setAttribute("src", filepath);
  				var mainDiv = document.getElementsByClassName("ui-widget-content draggable")[0];
      			mainDiv.appendChild(fileref);
				fileref.addEventListener('load', testcode, false);				 
            	break;
            default:
            	drawing_fn(cmd, currentCanvas);
            	break;
        }
    }
    
    
    
    /* NB All these send methods could (should) be added to the WebSocket prototype and called directly instead */
    /* Leaving that as a TODO for now */
    function sendExpose(ws) {
        ws.send("EVENT EXPOSE\n")
    }
    function sendClick(ws, x, y, b) {
        if (!_cb['CLICK']) {
            return false;
        }
        var str = "EVENT CLICK " + x + " " + y + " " + b + "\n";
        ws.send(str);
        
    }
    function sendMouseDown(ws, x, y, b) {
        if (!_cb['MDOWN']) {
            return false;
        }
        var str = "EVENT MDOWN " + x + " " + y + " " + b + "\n";
        ws.send(str);
    }
    function sendMouseDrag(ws, x, y, dx, dy, b) {
        if (!_cb['MDRAG']) {
            return false;
        }
        var str = "EVENT MDRAG " + x + " " + y + " " + dx + " " + dy + " " + b + "\n";
        ws.send(str);
    }
    function sendMouseDragOut(ws, x, y, dx, dy, b) {
        /* cancel the drag regardless of sending the message back */
        p.__mousePressed = false;
        p.mouseReleased();
        if (_Attached) {
	    q__mousePressed = false;
	    q.mouseReleased();
        }
        if (!_cb['MDRAGOUT']) {
            return false;
        }
        var str = "EVENT MDRAGOUT " + x + " " + y + " " + dx + " " + dy + " " + b + "\n"
        ws.send(str)
    }
    function sendMouseMove(ws, x, y, dx, dy) {
        if (!_cb['MMOVE']) {
            return false;
        }
        var str = "EVENT MMOVE " + x + " " + y + " " + dx + " " + dy + "\n";
        ws.send(str);
    }
    function sendKeyTyped(ws, keycode) {
        if (_cb['KEYST'] === false) return false;
        if (_cb['KEYST'] === true || _cb['KEYST'].indexOf(keycode) != -1) {
            var str = "EVENT KEYTYPED " + keycode + "\n";
            ws.send(str);
        }
    }
    function sendKeyPressed(ws, keycode) {
        if (_cb['KEYSP'] === false) return false;
        if (_cb['KEYSP'] === true || _cb['KEYSP'].indexOf(keycode) != -1) {
            var str = "EVENT KEYPRESSED " + keycode + "\n";
            ws.send(str);
        }
    }
    function sendKeyReleased(ws, keycode) {
        if (_cb['KEYSR'] === false) return false;
        if (_cb['KEYSR'] === true || _cb['KEYSR'].indexOf(keycode) != -1 ) {
            var str = "EVENT KEYRELEASED " + keycode + "\n";
            ws.send(str);
        }
    }
    function sendButtonClicked(ws, buttonId) {
        if (!_cb['BCLICK']) {
            return false;
        }
        var str = "EVENT BCLICK " + buttonId + "\n";
        ws.send(str);
    }
    function sendResize(ws, width, height) {
        if (!_cb['RESIZE']) {
            return false;
        }
        var str = "EVENT RESIZE " + width + " " + height + "\n";
        ws.send(str);
    }
    function dropHelper(e) {
        if (!_cb['DROP']) {
            return false;
        }
        e.stopPropagation();
        e.preventDefault();
    }
    function dropListener(e) {
        if (!_cb['DROP']) {
            return false;
        }
        e.stopPropagation();
        e.preventDefault();
        
        var files = e.dataTransfer.files;
        
        
        for(var i=0,f; f = files[i]; i++) {
            var reader = new FileReader();
            /* Code based on www.html5rocks.com tutorial */
            function errorHandler(e) {
                switch(e.target.error.code) {
                  case e.target.error.NOT_FOUND_ERR:
                    alert("File not found.");
                    break;
                  case e.target.error.NOT_READABLE_ERR:
                      alert("File is not readable.");
                      break;
                  case e.target.error.ABORT_ERR:
                      break;
                  default:
                      alert("Unknown error occurred.");
                };
            }
            /* TODO Use this if we create a loading bar widget */
            function updateProgress(e) {
                if (e.lengthComputable) {
                    var percentLoaded = Math.round((e.loaded / e.total) * 100);
                    if (percentLoaded < 100) {
                        //Do something?
                    }        
                 }
            }    
            
            
            reader.onloadstart = (function(file) {
              return function(e) {
                /* Send the INIT message */
                var str = ""
                var fname = file.name.replace(/ /g, "_"); //swap spaces for underscores
                if (file.type.match('text.*')) {
                    str = "EVENT DROP INIT " + fname + " " + file.type + " " + file.size + "\n";
                } else {
                    str = "EVENT DROP64 INIT " + fname + " " + file.type + " " + file.size + "\n";
                }                    
                ws.send(str);
              };
            })(f);
            reader.onprogress = updateProgress;
            reader.onabort = function(e) {
                /*TODO create an ABORT event on hlib? */
                alert("File read cancelled.");
            };
            reader.onerror = errorHandler;
            
            /* File transfer for binary file types is done in Base64 encoding     */
            /* File type is a BEST GUESS approach. It might not be right.         */
            /* Expect that at the application side and be ready to decode as    */
            /* needed. The event fired is different, so files can be treated     */
            /* differently easily. This is a temporary workaround until sending    */
            /* binary files ius fixed in Chrome (probably v15 or 16)            */
            reader.onload = (function(file) {
              return function(e) {
                if (e.target.readyState == FileReader.DONE) {
                    /* The file is loaded entirely in local storage */
                    var chunk_size = 1048576; /* 1 Meg chunk size */
                    var chunk_counter = 0;
                    var fname = file.name.replace(/ /g, "_"); //swap spaces for underscores
                    if (file.type.match('text.*')) {
                        /* Text files don't need encoding. */
                        var payload = e.target.result;
                        for (var start = 0; start < payload.length; start += chunk_size+1) {
                            var chunk = payload.substr(start, chunk_size);
                            var str = "EVENT DROP CHUNK " + fname + " " + file.type + " " + file.size + " " + chunk.length + " " + chunk_counter + "\n";
                            ws.send(str);
                            ws.send(chunk);
                            chunk_counter++
                        }
                        /* Send the END message */
                        var str = "EVENT DROP END " + fname + " " + file.type + " " + file.size + "\n";
                        ws.send(str);
                    } else {
                        /* Doesn't seem like a text file. Base64 encode it */
                        var payload = Base64.encode(e.target.result);
                        for (var start = 0; start < payload.length; start += chunk_size+1) {
                            var chunk = payload.substr(start, chunk_size);
                            var str = "EVENT DROP64 CHUNK " + fname + " " + file.type + " " + file.size + " " + payload.length + " " + chunk.length + " " + chunk_counter + "\n";
                            ws.send(str);
                            ws.send(chunk);
                            chunk_counter++
                        }
                        /* Send the END message */
                        var str = "EVENT DROP64 END " + fname + " " + file.type + " " + file.size + " " + payload.length + "\n";
                        ws.send(str);
                    }
                }
              };                
            })(f);
            /* NB:: w3c spec says readAsArrayBuffer is the way to go and readAsBinaryString is deprecated. */
            /* BUT!
             * Chrome 14 doesn't yet support sending ArrayBuffers as websocket data. This means we're sticking to 
             * binaryString for now. It also means that file transfers only work with text data for now. */    
            //reader.readAsArrayBuffer(f);
            reader.readAsBinaryString(f);
        }
    }
    /* These should probably only be defined if callbacks exist         */
    /* Requires generating these methods on-demand on the server-side     */
    /* if and only a callback has been registered for the action.        */
    /* This would help lighten network load for sure.                    */
    p.mouseReleased = function() {
        //this.println("Released (up/click)("+this.mouseX+","+this.mouseY+"), button: " + this.mouseButton);
        sendClick(ws, this.mouseX, this.mouseY, this.mouseButton);
    };
    
    p.mousePressed = function() {
        //this.println("Pressed (down) ("+this.mouseX+","+this.mouseY+"), button: " + this.mouseButton);
        sendMouseDown(ws, this.mouseX, this.mouseY, this.mouseButton);
    };
    p.mouseDragged = function() {
        /* Disable mouseDrag inside text areas to allow selection of text. */ 
        for (i in _text_areas) {
            var area = $(_text_areas[i]);
            var x_min = $(area).position().left;
            var x_max = x_min + $(area).width();
            var y_min = $(area).position().top;
            var y_max = y_min + $(area).height();
            if (this.mouseX >= x_min && this.mouseX <= x_max && 
                this.mouseY >= y_min && this.mouseY <= y_min) {
                    return false;
                }
        }
        sendMouseDrag(ws, this.mouseX, this.mouseY, this.mouseX - this.pmouseX, this.mouseY - this.pmouseY, this.mouseButton);
        if ( this.mouseX >= this.width || this.mouseX <= 0 || this.mouseY >= this.height || this.mouseY <= 0 ) {
            sendMouseDragOut(ws, this.mouseX, this.mouseY, this.mouseX - this.pmouseX, this.mouseY - this.pmouseY, this.mouseButton);
        }
        return true;
    }
    p.mouseMoved = function() {
        sendMouseMove(ws, this.mouseX, this.mouseY, this.mouseX - this.pmouseX, this.mouseY - this.pmouseY);
    }
/*
 * Processing-based keyboard event model stuff. Keeping it 
 * around in case I change my mind later, but I think attaching to the
 * parentNode is a better solution.
 * 
    p.keyPressed = function(e) {
        var k = this.key;
        var c = this.keyCode; 
        if (e != undefined) {
            if (e.keyCode in _codedKeys) {
                k = p.CODED;
            } else {
                k = e.keyCode;
            }
            c = e.keyCode;
        }
        
        sendKeyPressed(ws, k, c);
    }
    p.keyTyped = function(e) {
        var k = this.key;
        var c = this.keyCode; 
        if (e != undefined) {
            if (e.keyCode in _codedKeys) {
                k = p.CODED;
            } else {
                k = e.keyCode;
            }
            c = e.keyCode;
        }
        sendKeyTyped(ws, k, c);
    }
    p.keyReleased = function(e) {
        var k = this.key;
        var c = this.keyCode; 
        if (e != undefined) {
            if (e.keyCode in _codedKeys) {
                k = p.CODED;
            } else {
                k = e.keyCode;
            }
            c = e.keyCode;
        }
        sendKeyReleased(ws, k, c);
    }
*/
    /* Used in conjunction, this delays the resize event firing to prevent multiple events */
    /* adapted from: http://stackoverflow.com/questions/2854407/javascript-jquery-window-resize-how-to-fire-after-the-resize-is-completed */
    $(window).resize( function() {
        waitForFinalEvent(function(){
            sendResize(ws, $(window).width(), $(window).height());
            if (_fitScreen === true) {
                var width = $(window).width, height = $(window).height;
                p.size(width, height);
                q.size(width, height);
                $(canvas).parent().width(width);
                $(canvas).parent().height(height);
            }
        }, 500, "winResize");
        
    });
    var waitForFinalEvent = (function () {
      var timers = {};
      return function (callback, ms, uniqueId) {
        if (!uniqueId) {
          uniqueId = "Don't call this twice without a uniqueId";
        }
        if (timers[uniqueId]) {
          clearTimeout (timers[uniqueId]);
        }
        timers[uniqueId] = setTimeout(callback, ms);
      };
    })();
    
    var press = function(e) {
        /* TODO: Is more information sending needed/relevant? */
        /* If we ever want to tramsmit the actual character, use String.fromCharCode(k) */
        var k = e.which || e.keyCode;
        // NB changes \r to \n to
        if (k==13) k = 10;
        sendKeyTyped(ws, k);
        if (  _keys['TYP'] === "ALL" || _keys['TYP'].indexOf(k) != -1) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        } else {
            return true;
        }
    }
    
    var down = function(e) {
        /* TODO: Is more information sending needed/relevant? */
        var k = e.which || e.keyCode;
        sendKeyPressed(ws, k);
        if ( _keys['PRE'] === "ALL" || _keys['PRE'].indexOf(k) != -1 ) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        } else {
            return true;
        }
    }
    
    var release = function(e) {
        /* TODO: Is more information sending needed/relevant? */
        var k = e.which || e.keyCode;
        sendKeyReleased(ws, k);
        return true;
    }
    
    parent.addEventListener('keydown', down, false);
    parent.addEventListener('keypress', press, false);
    parent.addEventListener('keyup', release, false);
    
    /* Adds mouse tracking beyond the boundaries of the canvas */
    $(document).mousemove(function(e) {
        var x;
        var y;
        if (_pmx === -1) _pmx = x;
        if (_pmy === -1) _pmy = y;
        if (e.pageX != undefined && e.pageY != undefined) {
            x = e.pageX;
            y = e.pageY;
        }
        else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        
        x -= $(canvas).offset().left;
        y -= $(canvas).offset().top;
        
        sendMouseMove(ws, x, y, _pmx, _pmy);
        if ( $.p(currentCanvas).__mousePressed === true ) {
            /* Additional checking in case the dragout was too fast for processing to pick up */
            var rect = canvas.getBoundingClientRect();
            if ( x >= rect.width || x <= 0 || y >= rect.height || y <= 0) {
                sendMouseDragOut(ws, x, y, _pmx, _pmy);
            }
        }
        _pmx=x;
        _pmy=y;
    });
        }
  catch(err)
    {
    	console.log(err);
    }
 }//);
