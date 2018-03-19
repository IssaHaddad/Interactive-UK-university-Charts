/*-------------------------------------------------------------------- 
  
   Module: piechart class implemented in Bostock's functional style
   Author: Issa Haddad
  
   What it does:
  	Renders a pie chart using the GUP

   Percentage of code written by Issa Haddad: 20%
   Percentage of code taken from course example: 80%

   Dependencies
  	D3.js v4
  
   History: 17/11/2017

   References: (none)
  	
---------------------------------------------------------------------- */

function piechart(targetDOMelement, targetDOMelement2, targetDOMelement3) { 
	//Here we use a function declaration to imitate a 'class' definition
	//
	//Invoking the function will return an object (piechartObject)
	//    e.g. piechart_instance = piechart(target)
	//    This also has the 'side effect' of appending an svg to the target element 
	//
	//The returned object has attached public and private methods (functions in JavaScript)
	//For instance calling method 'updateAndRenderData()' on the returned object 
	//(e.g. piechart_instance) will render a piechart to the svg
	

	//Delare the main object that will be returned to caller
	var piechartObject = {};
	
	//=================== PUBLIC FUNCTIONS =========================
	//
	piechartObject.overrideDataFieldFunction = function (dataFieldFunction) {
		dataField = dataFieldFunction;
		return piechartObject;
	}

	piechartObject.overrideDataKeyFunction = function (dataKeyFunction) {
		dataKey = dataKeyFunction;
		return piechartObject;
	}

	piechartObject.overrideDataTextFunction = function (dataTextFunction) {
		dataText = dataTextFunction;
		return piechartObject;
	}
	
	piechartObject.overrideMouseOverFunction = function (callbackFunction) {
		mouseOverFunction = callbackFunction;
		layoutAndRender();
		return piechartObject;
	}
	
	piechartObject.overrideMouseOutFunction = function (callbackFunction) {
		mouseOutFunction = callbackFunction;
		layoutAndRender();
		return piechartObject;
	}
	
	piechartObject.render = function (callbackFunction) {
		layoutAndRender();
		return piechartObject;
	}
	
	piechartObject.loadAndRenderDataset = function (data) {
		dataset=data;
		layoutAndRender();
		updateInteractions();
		return piechartObject;
	}

	piechartObject.loadAndRenderDataset2 = function (data) {
		dataset=data;
		layoutAndRender2();
		updateInteractions();
		return piechartObject;
	}
	
	piechartObject.sort = function () {
		dataset.sort(function (a,b){
			return dataField(a) - dataField(b)
		})
		layoutAndRender();
		return piechartObject;
	}
	
	piechartObject.sortR = function () {
		dataset.sort(function (a,b){return dataField(b) - dataField(a)})
		layoutAndRender();
		return piechartObject;
	}

	piechartObject.setMouseclickCallback = function(f){
		mouseclickCallback = f;
		updateInteractions();
		return piechartObject;
	}
	
	piechartObject.sortKey = function () {
		dataset.sort(function (a,b){
			if (a.keyField < b.keyField) return -1;
			if (a.keyField > b.keyField) return  1;
			return 0;
		});
		layoutAndRender();
		return piechartObject;
	}

	piechartObject.height = function (hei) {
		svgHeight = hei
		arcShapeGenerator
				.outerRadius(svgHeight/2)
				.innerRadius(svgHeight/4)
		layoutAndRender();
		return piechartObject;
	}

	piechartObject.width = function (wid) {
		svgWidth = wid
		layoutAndRender();
		return piechartObject;
	}

	piechartObject.setTooltipText = function(f){
		tooltipText = f;
		updateInteractions();
		return piechartObject;
	}
	
	//=================== PRIVATE VARIABLES ====================================
	//Width and height of svg canvas
	var svgWidth = 300; 
	var svgHeight = 300;
	var pieColour = "steelBlue"
	var dataset = [];
	var mouseclickCallback = function(d, i){ console.log(d, i) };
	var keySelected = null;
	var tooltipText = function(d, i){return "tooltip over element "+i;}
	var mouseoverCallback = function(d, i){ };
	var mouseoutCallback = function(d, i){ };
	
	var color_scale = d3.scaleOrdinal(d3.schemeCategory20);
	
	//Declare and append SVG element
	var svg = d3.select(targetDOMelement)
				.attr("class", "framed2")
				.attr("width", svgWidth)
				.attr("height", svgHeight);
				
	
	//Declare and append group that we will use tp center the piechart within the svg
	var grp = d3.select(targetDOMelement2);
	
	var tooltip = d3.select(targetDOMelement3)
		.classed("tooltip", true);

	//=================== PRIVATE FUNCTIONS ====================================

	//var dataField = function(d){return d["FTE Category A staff submitted"]}
	var dataField = function(d){return d["num"]}
	var dataKey = function (d){return d.data["key"]}
	var dataText = function(d) { return d.data["key"]} 

	//Set up shape generator
	var arcShapeGenerator = d3.arc()
		.outerRadius(svgHeight/2)
		.innerRadius(svgHeight/4)
		.padAngle(0.03)
		.cornerRadius(8);

	function layoutAndRender(){
		//Taken and addapted from https://github.com/d3/d3-shape/blob/master/README.md#pie

		//Generate the layout 
		var arcsLayout = d3.pie()
			.value(dataField)
			.sort(null)
			(dataset);

		console.log("Layout=", arcsLayout)


		//center the group within the svg
		grp.attr("transform", "translate("+[svgWidth/2, svgHeight/2]+")")
		
		//Now call the GUP
		GUP_pies(arcsLayout, arcShapeGenerator);
		//GUP_labels(arcsLayout, arcShapeGenerator);
		
	}


	function layoutAndRender2(){
		//Taken and addapted from https://github.com/d3/d3-shape/blob/master/README.md#pie

		//Generate the layout 
		var arcsLayout = d3.pie()
			.value(dataField)
			.sort(null)
			(dataset);

		console.log("Layout=", arcsLayout)


		//center the group within the svg
		grp.attr("transform", "translate("+[svgWidth/2, svgHeight/2]+")")
		
		//Now call the GUP
		GUP_pies(arcsLayout, arcShapeGenerator);
		//GUP_labels(arcsLayout, arcShapeGenerator);
		
	}
	
	function GUP_labels(arcsLayout, arcShapeGenerator){


		//Bind data
		var labels = grp.selectAll("text")
			.data(arcsLayout/*, dataKey*/)
		//add text elements for new labels
		
		var labels_enter = labels.enter().append("text")
		
		//Define content and location in Update + enter selection
		var merged_labels = labels_enter.merge(labels)
			//Translate label to center of arc
		merged_labels.attr("transform", function(d) {
			return "translate(" + arcShapeGenerator.centroid(d) + ")";
		})
			.attr("text-anchor", "middle")
			.text(dataText);
		//Remove old labels
		labels.exit().remove();
	};
	
	function GUP_pies(arcsLayout, arcShapeGenerator){

		//GUP = General Update Pattern to render pies 

		//GUP: BIND DATA to DOM placeholders
		var selection = grp.selectAll("path")
			.data(arcsLayout/*, dataKey*/)
		//GUP: ENTER SELECTION
		var enterSel = selection
			.enter()
			.append("path")
			.each(function(d) { this.dPrevious = d; }); // store d for use in tweening

		//GUP ENTER AND UPDATE selection
		var mergedSel = enterSel.merge(selection)			
		
		mergedSel
			.style("stroke", "gray")
			.style("opacity", 0.8)
			.style("fill",function(d,i){return color_scale(i);})
			
		mergedSel
			.transition()
			.duration(750)
			.attrTween("d", arcTween); //Use custom tween to draw arcs
		
		//GUP EXIT selection 
		selection.exit()
			.remove() 
	};
	
	
	//Ignore this function unless you really want to know how interpolators work
	function arcTween(dNew) {
		//Create the linear interpolator function
		//this provides a linear interpolation of the start and end angles 
		//stored 'd' (starting at the previous values in 'd' and ending at the new values in 'd')
		var interpolateAngles = d3.interpolate(this.dPrevious, dNew); 
		//Now store new d for next interpoloation
		this.dPrevious = dNew;
		//Return shape (path for the arc) for time t (t goes from 0 ... 1)
		return function(t) {return arcShapeGenerator(interpolateAngles(t)) }; 
	}	
	

	function updateInteractions(){
		// separate function for interactions,
		// this way there is no need to do GUP when just changing callbacks
		grp.selectAll("path")
			.on("mouseover", function(d, i){
				d3.select(this).style("opacity", 1);
				console.log(d.data["Unit of assessment name"], " && ", d.data["4*"]);
				tooltip.html(tooltipText(d,i))
					.style("left", (d3.event.pageX) + "px")		
            		.style("top", (d3.event.pageY - 28) + "px")
            		.style("opacity", 0.9);

            	mouseoverCallback(d, i);
			})
			.on("mouseout", function(d, i){
				d3.select(this).style("opacity", 0.7);

				tooltip.style("opacity", 0);

				mouseoutCallback(d, i);

			})
			.on("click", function(d, i){

				console.log("keySelected before ");
				console.log(keySelected);
				keySelected = (keySelected == d.data.key) ? null : d.data.key;
				console.log("keySelected after ");
				console.log(keySelected);
				mouseclickCallback(d, i);
			})
	}

	
	//================== IMPORTANT do not delete ==================================
	return piechartObject; // return the main object to the caller to create an instance of the 'class'
	
} //End of piechart() declaration	
