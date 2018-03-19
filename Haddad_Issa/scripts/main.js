/*-------------------------------------------------------------------- 
  
   Module: MAIN CONTROLLER
   Author: Issa Haddad
  
   What it does:
  	- Instantiates data manager, and makes it load data
	- Generates pie charts in dashboard
	- Generates maps in dashboard
	- Generates hierarchy charts in dashboard
	- Feeds data from data manager into charts
	- Provides click interactions across all charts

   Percentage of code written by Issa Haddad: 95%
   Percentage of code taken from course example: 5%

   Dependencies: (none)
  
   History: 17/11/2017

   References: (none)
  	
---------------------------------------------------------------------- */


var dataManager = {};

//if no profile is clicked, the default one which is displayed is: (University researcher)
var button = 1;

// load University researcher if button is pressed
function UniRes()
{
	button = 1;
	loadCSV1();
}

// load University mmanagement if button is pressed
function UniMan()
{
	button = 2;
	loadCSV1();
}

// load industrial collaborator if button is pressed
function PInCol()
{
	button = 3;
	loadCSV1();
}


// load CSV: REF2014 and Learning providers - when ready (to invoke synchronous events)
function loadCSV1(){

	dataManager = dataManagerConstructor();

	dataManager.read1("resources/REF2014_Results.csv",
		function(error){ // to call in case of error
			console.log("Error");
			console.log(error);
		},
		function(){ // to call if everything ok
			loadCSV2();
		});
}

// load Json: UK - when ready (to invoke synchronous events)
function loadCSV2(){

	dataManager.loadDatasetJSON("resources/uk.json",
		function(error){ // to call in case of error
			console.log("Error");
			console.log(error);
		},
		function(){ // to call if everything ok
			makePage();
		});
}


function makePage(){

	// APPEND VISUALISATION
	var map1, map2, map3;
	var pie1, pie2, pie3;
	var tr1, tr2, tr3;

	// render views for university researcher
	if(button==1)
	{
		// set up map with relevant interactions
		map1 = map("#map1svg", "#map1rect", "#map1g");
		// pass learning providers to map
		map1.setlp(dataManager.getDataLP());
		// setupcallback overrides a function in .on(mousedown) on map, it should only be invoked for map3
		map1.setUpCallback(function() {
		})
		map1.loadAndRender(dataManager.getDataUK())
		// setmouseclickckcallback overrides a function in .on(click) on map labels; store UniName filter and update tree
		map1.setMouseclickCallback(function(d, i){
		dataManager.setUniNameFilter(d["VIEW_NAME"]);
		// redraw tree to show the 4* rating for all profiles of the selected UOA and the selected institution 
		redrawtree();
		});
		//print user maual text to screen
		document.getElementById('manual2').innerHTML = '<p>Pick your unit of assessment!';
		document.getElementById('manual').innerHTML = '<p>All universities with selected UOA! ==> click on institution label to view Hierarchy.';
		document.getElementById('manual3').innerHTML = '<p>Unit of assessment ==> Intitution name ==> Profile ==> 4*';
		// set up pie with relevant interactions
		pie1 = piechart("#pie1svg", "#pie1g", "#pietool");
		// tooltip shows d.data.key (which is UoA)
		pie1.setTooltipText(function(d, i){
			return "<b>"+d.data.key+"</b>";
		})
		// render all UOA's in piechart
		pie1.loadAndRenderDataset(dataManager.getHierarchyUOA().values);
		// update map when pie is clicked to show all universities that have the particular UOA that is clicked
		pie1.setMouseclickCallback(function(d, i){
		dataManager.setUOAFilter(d.data.key);
		// redraw map to show all univerities that have the particular filtered UOA
		redrawmap();
		})
		// set up tree with relevant interactions
		tr1 = tree("#hi1svg", "#hi1g");
		// leaf nodes should show the 4* rating for each university and its corresponding UOA
		tr1.leafLabelFn(function(d) {return d.data["4*"]});
		tr1.appendToClick(function(d){
					//Your additional code here 
					//(e.g. in case you want interaction with other layouts)
					if (d. height == 0) console.log("leaf node clicked, d=",d.data["4*"])
				});
		// use hierarchy with keys: UOA - Institution name - Profile
		tr1.loadAndRenderDataset(dataManager.getHierarchy_UOA_Inst_Pro());
	}

	// render views for university management
	if(button ==2)
	{

		// set up tree with relevant interactions
		tr2 = tree("#hi1svg", "#hi1g");
		// leaf nodes should show institution name
		tr2.leafLabelFn(function(d) {return d.data["Institution name"]});
		// clicking on leaf node would show all UOA for that particular institution
		tr2.appendToClick(function(d){
					//Your additional code here 
					//(e.g. in case you want interaction with other layouts)
					if (d. height == 0) 
						{
							dataManager.setUniName2Filter(d.data["Institution name"]);
							// redraw pie to show all UOA for a particular filtered Institution with theri overall 4* proportionally
							redrawpie2();
						}
				});
		// use hierarchy with keys: UOA - Institution name
		tr2.loadAndRenderDataset(dataManager.getHierarchy4_UOA_Inst());

		//print user maual text to screen
		document.getElementById('manual2').innerHTML = '<p>Heriot Watt UOAs and their overall 4* rating ==> Select UOA to view Institutions with higher 4* rating!';
		document.getElementById('manual').innerHTML = '<p>All other Institutions that have higher overall 4* rating for the selected UOA';
		document.getElementById('manual3').innerHTML = '<p>Unit of assessment ==> Intitution name ==> Instituion name; Select Intitution!';

		// set up pie with relevant interactions
		pie2 = piechart("#pie1svg", "#pie1g", "#pietool");
		// override pie datafield to 4* to be used as arcgenerator value and override other values as well
		pie2.overrideDataFieldFunction(function(d){return d["4*"]});
		pie2.overrideDataKeyFunction(function (d){return d.data["Unit of assessment number"]});
		pie2.overrideDataTextFunction(function(d) { return d.data["Unit of assessment name"]});
		// show UOA and its overall 4* rating for a particular univeristy
		pie2.setTooltipText(function(d, i){
			return "<b>"+d.data["Unit of assessment name"]+ ": its 4* = " + d.data["4*"] +"</b>";
		})
		// intially render all UOA with profile=overall for Heriot Watt university
		pie2.loadAndRenderDataset2(dataManager.getPieHeriotWatt_UOA_Overall());
		pie2.setMouseclickCallback(function(d, i){
		// use key (i.e. year) of element clicked on as filter
		dataManager.setUOA2Filter(d.data["Unit of assessment name"]);
		dataManager.setStar4Filter(d.data["4*"]);
		// redraw map to show all universities that have the filter UOA and which have a higher overall 4* rating
		redrawmap2();
		})

		// set up map with relevant interactions
		map2 = map("#map1svg", "#map1rect", "#map1g");
		map2.setlp(dataManager.getDataLP());
		// setupcallback ovrides a function in .on(mousedown) on map, it should only be invoked for map3
		map2.setUpCallback(function() {
		})
		map2.loadAndRender(dataManager.getDataUK())
	}

	// render views for industrial collaborator
	if (button ==3)
	{

		// set up map with relevant interactions
		map3 = map("#map1svg", "#map1rect", "#map1g");
		map3.setlp(dataManager.getDataLP());
		map3.loadAndRender(dataManager.getDataUK())
		// setupcallback ovrides a function in .on(mousedown) to update map3 and tr3 to show information about 
		// .on(mousedown) --> records latitude and longitude when map is clicked, this is used to identify universities around the point which is clicked up to a certain radius
		map3.setUpCallback(function() {
			// redraw map to show all near insitutions that have the filtered UOA
  			redrawmap3new();
  			// redraw tree to show ratings for all profiles for the instutions that appear on the map
			redrawtree3();
		})
		map3.setMouseclickCallback2(function(d, i){
		});
		//invoke function that has mousedown behavior
		map3.loadInteraction2();
		//print user maual text to screen
		document.getElementById('manual2').innerHTML = '<p>Pick your unit of assessment!';
		document.getElementById('manual').innerHTML = '<p>All universities with selected UOA! ==> click on map to find NEAR YOU!.';
		document.getElementById('manual3').innerHTML = '<p>Unit of assessment ==> Intitution name ==> Profile ==> 4*';
		// set up pie with relevant interactions
		pie3 = piechart("#pie1svg", "#pie1g", "#pietool");
		pie3.setTooltipText(function(d, i){
			return "<b>"+d.data.key+"</b>";
		})
		// render all UOA's in piechart
		pie3.loadAndRenderDataset(dataManager.getHierarchyUOA().values);
		pie3.setMouseclickCallback(function(d, i){
		dataManager.setUOA3Filter(d.data.key);
		// redraw map to show all universities that have the selected UOA
		redrawmap3();
		})

		// set up tree with relevant interactions
		tr3 = tree("#hi1svg", "#hi1g");
		// leaf node to show the 4* rating on each profile
		tr3.leafLabelFn(function(d) {return d.data["4*"]});
		tr3.appendToClick(function(d){
					//Your additional code here 
					//(e.g. in case you want interaction with other layouts)
					if (d. height == 0) 
						{
							console.log("leaf node clicked, d=",d.data["4*"])
						}
				});
		// use hierarchy with keys: UOA - Institution name - Profile
		tr3.loadAndRenderDataset(dataManager.getHierarchy2_UOA_Inst_Pro());
	}
	

	function redrawtree(){
		// use hierarchy with keys: UOA - Institution name - Profile
		tr1.loadAndRenderDataset(dataManager.getHierarchy_UOA_Inst_Pro());
	}
	function redrawmap(){
		map1.setlp(dataManager.getDataLP_filtered_UOA());
		map1.loadAndRender(dataManager.getDataUK());
	}

	function redrawmap2(){
		map2.setlp(dataManager.getDataLP_filtered_UOA_higher_4star());
		map2.loadAndRender(dataManager.getDataUK());
	}

	function redrawpie2()
	{
		pie2.setTooltipText(function(d, i){
			return "<b>"+d.data["Unit of assessment name"]+ ": its 4* = " + d.data["4*"] +"</b>";
		})
		pie2.loadAndRenderDataset2(dataManager.getPieDatanew());
	}

	function redrawmap3(){
		map3.setlp(dataManager.getDataLP3_filtered_UOA());
		map3.loadAndRender(dataManager.getDataUK());
	}

	function redrawmap3new(){
		map3.setlp(dataManager.getDataLP_filtered_UOA_specific_Long_Lat());
		map3.loadAndRender(dataManager.getDataUK());
	}


	function redrawtree3(){
		tr3.loadAndRenderDataset(dataManager.getHierarchy_filtered_Long_Lat());
	}
}