$(function () {
/*    $("#radio1").click(function () {
    	$("#layer").css("z-index", "1");
    	currentCanvas = "root";
    	_screenLayer = false;
    });
    
    $("#radio3").click(function () {
    	$("#layer").css("z-index", "3");
    	_screenLayer = true;
    	currentCanvas = "layer";
    });*/
    
    elementCreator = $(document.createElement("input"));
    $("div#radio").append(
    	elementCreator.attr("type", "hidden")
    	.attr("id", "primaryColor")
    	.attr("class", "color-picker black")
    	.attr("value", "#000000")
    );
    

    elementCreator = $(document.createElement("input"));
    $("#primaryColor").after(
    	elementCreator.attr("type", "hidden")
    	.attr("id", "secondaryColor")
    	.attr("class", "color-picker")
    	.attr("value", "#B03A3A")
    );

    $(".color-picker").miniColors();
});

