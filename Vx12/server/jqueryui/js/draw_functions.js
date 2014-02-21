

function drawing_fn(cmd, currentCanvas)
{
	switch(cmd.name)
		{
			case "ARC":
                $.p(currentCanvas).arc(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3], cmd.args[4], cmd.args[5]);
            break;
            case "ELIP":
              $.p(currentCanvas).ellipse(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3]);
            break;
            case "LI2D":
                $.p(currentCanvas).line(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3]);
            break;
            case "PO2D":
                $.p(currentCanvas).point(cmd.args[0], cmd.args[1]);
            break;
            case "QUAD":
                $.p(currentCanvas).quad(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3], cmd.args[4], cmd.args[5], cmd.args[6], cmd.args[7]);
            break;
            case "RECT":
                $.p(currentCanvas).rect(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3]);
            break;
            case "TRI":
                $.p(currentCanvas).triangle(cmd.args[0], cmd.args[1], cmd.args[2], cmd.args[3], cmd.args[4], cmd.args[5]);
            break;
            case "BG":
                $.p(currentCanvas).background(cmd.args[0], cmd.args[1], cmd.args[2]);
            break;
             case "STROKE_PALLET":
                var palletID = "#" + cmd.args[0];
                if ($(palletID).length == 0) {
                    $.p(currentCanvas).stroke(0);                    
                }
                else {
                    $.p(currentCanvas).stroke(parseInt( $(palletID).val().replace("#", "0xFF") ));
                }
            break; 
            case "FILL_PALLET":
                // fill_pallet(cmd, currentCanvas);
                var palletID = "#" + cmd.args[0];
                if ($(palletID).length == 0) {
                    $.p(currentCanvas).fill(0);                    
                }
                else {
                    $.p(currentCanvas).fill(parseInt( $(palletID).val().replace("#", "0xFF") ));
                }
                case "ELIP_MODE":
                $.p(currentCanvas).ellipseMode(cmd.args[0]);
            break;
            case "RECT_MODE":
                $.p(currentCanvas).rectMode(cmd.args[0]);
            break;
            case "ST_CAP":
                $.p(currentCanvas).strokeCap(cmd.args[0]);
            break;
            case "ST_JOIN":
                $.p(currentCanvas).strokeJoin(cmd.args[0]);
            break;
            case "BEGIN_SHAPE":
                $.p(currentCanvas).beginShape(cmd.args[0]);
            break;
            case "END_SHAPE":
                $.p(currentCanvas).endShape(cmd.args[0]);
            break;
            case "VERTEX":
                $.p(currentCanvas).vertex(cmd.args[0], cmd.args[1]);
            break;
            case "LOAD_FONT":
                var f = $.p(currentCanvas).loadFont(cmd.args[0], cmd.args[1]);
                _loaded_fonts[cmd.args[0]] = f;
                $.p(currentCanvas).textFont(f);
            break;
            case "TXT_FONT":
                var f = _loaded_fonts[cmd.args[0]];
                if (f == null) {
                    f = $.p(currentCanvas).loadFont(cmd.args[0], cmd.args[1]);
                }
                $.p(currentCanvas).textFont(f);
            break;
            case "PUSH_MAT":
                $.p(currentCanvas).pushMatrix();
            break;
            case "POP_MAT":
                $.p(currentCanvas).popMatrix();
            break;
            case "TRANSL_2i":
            case "TRANSL_2f":
                $.p(currentCanvas).translate(cmd.args[0], cmd.args[1]);
            break;
            case "ROTATE":
                $.p(currentCanvas).rotate(cmd.args[0]);
            break;
            default:
                $.p(currentCanvas).println("Received an unknown command:: " + cmd.name + " " + cmd.args);
				break;
		}
}


