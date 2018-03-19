/*-------------------------------------------------------------------- 
  
   Module: map class implemented in Bostock's functional style
   Author: Issa Haddad
  
   What it does:
  	Renders a zoomable uk map using the GUP
	Assumes input is UK json file

   Percentage of code written by Issa Haddad: 60%
   Percentage of code taken from course example: 40%

   Dependencies
  	D3.js v4
  	topojson.v1.min.js V1
  
   History: 17/11/2017

   References: 
  	-https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2

---------------------------------------------------------------------- */
function map(DOMElement, DOMElement2, DOMElement3){


	var Learning;
	var mapObj = {}; // main object
	var Long;
	var Lat;
	// function loading data and rendering it in bar chart
	// parameters:
	//		- dataset in following format:
	//			[{"key": year, "value": money}, {...}, ...]
	// returns:
	// 		- barObj for chaining
	mapObj.loadAndRender = function(uk){
		var countries = topojson.feature(uk, uk.objects.subunits).features;
		//Ditto for places (towns and cities)
		var towns = topojson.feature(uk, uk.objects.places).features;

		console.log("uk = ", uk); console.log("countries = ", countries); console.log("towns = ", towns);
		GUP_countries(svg, countries);
		GUP_towns(svg, towns);
		updateInteractions();
		return mapObj;
	}

	mapObj.loadInteraction2 = function()
	{
		updateInteractions2();
	}

	mapObj.setlp = function(l){
		Learning = l;
		return mapObj;
	}

	mapObj.getlp = function(l){
		return Learning;
	}

	mapObj.setMouseclickCallback = function(f){
		mouseclickCallback = f;
		updateInteractions();
		return mapObj;
	}

	mapObj.setMouseclickCallback2 = function(f){
		mouseclickCallback = f;
		updateInteractions();
		updateInteractions2();
		return mapObj;
	}

	// modifies funcion in .on(mousedown)
	mapObj.setUpCallback = function(f){
		func = f;
		updateInteractions();
		updateInteractions2();
		return mapObj;
	}



	// ---- PRIVATE VARIABLES

	// sizing vars
	var width = 960,
		height = 1227;
		active = d3.select(null);

	// dom elements
	var svg = d3.select(DOMElement) //.append("svg")
		.attr("class", "framed")
		.style("float", "left")
		.attr("width", width)
		.attr("height", height)
		.on("click", stopped, true);


	var rec = d3.select(DOMElement2)
		.attr("class", "background")
    	.attr("width", width)
    	.attr("height", height)
    	.on("click", reset);


	//define projection of spherical coordinates to the Cartesian plane
	var projection = d3.geoAlbers()
    .center([0, 55.4])
    .rotate([4.4, 0])
    .parallels([50, 60])
    .scale(1200 * 5)
    .translate([width / 2, height / 2]);

	//Define path generator (takes projected 2D geometry and formats for SVG)
	var pathGen = d3
	.geoPath()
    .projection(projection)
    .pointRadius(2);


    //zoom
    var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

    var g = d3.select(DOMElement3);

    svg.call(zoom);

	// data
	var dataset = [];
	var keySelected = null;
	var mouseclickCallback = function(d, i){ console.log(d, i) };
	var func = function(){ };
	// ---- PRIVATE FUNCTIONS

	function GUP_countries(svg, countries){
	//Draw the five unit outlines (ENG, IRL, NIR, SCT, WLS)
	
	//DATA BIND
	var selection = g
		.selectAll(".classCountry")
		.data(countries);
	
    //ENTER
	var enterSel = selection
		.enter()
		.append("path")
		.attr("class", function(d) { return d.id; })
		.classed("classCountry", true)
		.attr("d", pathGen)
		.on("click", clicked)
		
	//UPDATE 
	//Nothing for now
	
	//EXIT
	//Nothing for now 
	}

	function GUP_towns(svg, towns){
	
	//DATA BIND
	var selection = g
		.selectAll("g.classTown")
		.data(Learning, getKey);		

	//ENTER  
 	var enterSelection = selection.enter()
		.append("g")
		.classed("classTown", true)
		.attr("transform", function(d) { 
			return "translate(" + projection([d.LONGITUDE,d.LATITUDE]) + ")"; 
		});
		
	//Append circles
	enterSelection.append("circle")
		.attr("r", 4);
		
	//Append labels
	enterSelection.append("text")
		.attr("x", 6)
		.attr("y", 4)
		.attr("text-anchor", "start")
		.style("font-size", "10px")
		.text(function(d) {return d.VIEW_NAME;});

		
	//UPDATE 
	//Nothing for now
	
	selection.exit()
			.remove() 

	}

	function getKey(d){
	return d.VIEW_NAME;
}

	function clicked(d) {
  		if (active.node() === this) return reset();
 		 active.classed("active", false);
 		 active = d3.select(this).classed("active", true);

 		 var bounds = pathGen.bounds(d),
  		   dx = bounds[1][0] - bounds[0][0],
   		   dy = bounds[1][1] - bounds[0][1],
  		   x = (bounds[0][0] + bounds[1][0]) / 2,
   		   y = (bounds[0][1] + bounds[1][1]) / 2,
   		   scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
   		   translate = [width / 2 - scale * x, height / 2 - scale * y];

  		svg.transition()
   		   .duration(750)
    		  // .call(zoom.translate(translate).scale(scale).event); // not in d3 v4
     		 .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) ); // updated for d3 v4
}

	function reset() {
  		active.classed("active", false);
  		active = d3.select(null);

  		svg.transition()
      	.duration(750)
      	// .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
      	.call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
	}

	function zoomed() {
  		g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
  		// g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
  		g.attr("transform", d3.event.transform); // updated for d3 v4
	}

	function stopped() {
  		if (d3.event.defaultPrevented) d3.event.stopPropagation();
	}

	function updateScales(){
		xScale.domain(dataset.map(function(d){return d.key;}))
			.paddingInner(0.1)
			.range([svgPadding, svgWidth-svgPadding]);

		yScale.domain([0, d3.max(dataset, function(d){return d.value;})])
			.range([0, svgHeight-svgPadding*2]);
	}

	function updateInteractions2()
	{
		g.selectAll(".classCountry")
			.on("mousedown.log", function() {
			var Long = projection.invert(d3.mouse(this))[0];
			var Lat = projection.invert(d3.mouse(this))[1];
  			console.log("long: ", Long);
  			console.log("lat: ", Lat);
  			dataManager.printlongFilter();
  			dataManager.setlongFilter(Long);
  			dataManager.printlongFilter();
  			dataManager.printlatFilter();
  			dataManager.setlatFilter(Lat);
  			dataManager.printlatFilter();
			func();
			});

		}

	function updateInteractions(){
		// separate function for interactions,
		// this way there is no need to do GUP when just changing callbacks


		g.selectAll("g.classTown")
			.on("click", function(d, i){
				console.log("bef");
				console.log(keySelected);
				console.log("d:",d);
				keySelected = (keySelected == d["VIEW_NAME"]) ? null : d["VIEW_NAME"];
				console.log("bef");
				console.log(keySelected);
				mouseclickCallback(d, i);
			})
	}

	return mapObj; // returning the main object
}