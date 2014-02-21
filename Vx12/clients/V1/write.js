function write(arg) {
var x;
var r=confirm("Press a button!");
if (r==true)
  {
  x="You pressed OK!";
  }
else
  {
  x="You pressed Cancel!";
  }
 // document.getElementById("demo").innerHTML=x;
 document.write(x);
}
