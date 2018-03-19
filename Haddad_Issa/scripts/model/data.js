/*-------------------------------------------------------------------- 
  
   Module: DATA MANAGER GENERATOR
   Author: Issa Haddad
  
   What it does:
  	Generates a data manager (model), with API to load
	and filter given dataset.

   Percentage of code written by Issa Haddad: 95%
   Percentage of code taken from course example: 5%

   Dependencies
  	D3.js v4
  
   History: 17/11/2017

   References: (none)
  	
---------------------------------------------------------------------- */


function dataManagerConstructor(){

	// global variables
	var dmObj = {}; // main object
	var ref14data;
	var ref14datacopy;
	var refUniversitiesByUKPRN;
	var learningProviders;
	var learningProviderscopy;
	var heriotWattCS;
	var HeriotWatt_UOA_Overall;



	// returns REF14 filtered on Heriot Watt - OVerall
	dmObj.getPieHeriotWatt_UOA_Overall = function()
	{
		return HeriotWatt_UOA_Overall;
	}

	//if UniName2Filter is not set --> returns REF14 filtered on Heriot Watt - OVerall
	//if UniName2Filter is set --> rteurn REF14 filtered on UniName2Filter - OVerall
	dmObj.getPieDatanew = function()
	{
		var HeriotWatt_UOA_Overallnew = ref14data.filter(function(row)
		{
			if (UniName2Filter == null)
			{
				return (row["Institution code (UKPRN)"] == 10007764) && (row["Profile"] == "Overall")
			}
			else 
			{
				return (row["Institution name"] == UniName2Filter) && (row["Profile"] == "Overall")
			}
		})
		return HeriotWatt_UOA_Overallnew;
	}

	// ---- PUBLIC API

	// function loading CSV data ("resources/REF2014_Results.csv" & "resources/learning-providers-plus.csv")
	// parameters:
	// 		- url, url of data in string format
	// 		- callbackError, callback in case of error
	// 		- callbackSuccess, callback if data loads normally
	// returns:
	// 		- Nothing
	dmObj.read1 = function (url, callbackError, callbackSuccess){
		d3.csv("resources/REF2014_Results.csv", function(error, csvData) {
		if(error){
				callbackError(error);
			} else {
				ref14data = csvData;
				ref14datacopy = csvData;
				console.log("ref14data= ", ref14data);
				d3.csv("resources/learning-providers-plus.csv", function(error, csvData) {	
					if(error){
					callbackError(error);
					} else {
						learningProviders = csvData;
						learningProviderscopy = csvData;
						console.log("learningProviders = ", learningProviders);
			
						//Check to see if we have any Universities in REF2014 that are not in the learning providers
						findREFunisWithNoEntryInLearningProvidersPlus(ref14data, learningProviders);
			
						//Add and duplicate learningProviders data into REF2014
						//e.g. add the learningProviders HWU entry, to every HWU entry in REF2014 
						combineCSVdata(ref14data, learningProviders);
						console.log("\n\nref14data (after combo with learning provider data) = ", ref14data);
			
						//Filter out HWU combined entries and show in html
						displayHWCS(ref14data);

						//Filter out HWU combined entries with overall 
						labFourOne(ref14data);
						
						//Convert into Nested data, and show HWU object
						displayOneUniversityAsNestedList(ref14data);
						callbackSuccess();
					}
					})
			}
		})
	}

	// function loading json data from url
	// parameters:
	// 		- url, url of data in string format
	// 		- callbackError, callback in case of error
	// 		- callbackSuccess, callback if data loads normally
	// returns:
	// 		- Nothing
	dmObj.loadDatasetJSON = function (url, callbackError, callbackSuccess){
		d3.json(url, function(error, data){
			if(error){
				callbackError(error);
			} else {
				dataset = data;
				console.log("Data loaded in dataManager");
				console.log(dataset);
				callbackSuccess();
			}
		})
	}


	// returns uk json file
	dmObj.getDataUK = function(){
		return dataset;
	}

	// reurns learning provider array
	dmObj.getDataLP = function(){
		return learningProviders;
	}

	// function to return array with all institutions that have a specific UOA
	// creates a higherarchy on REF14 data with keys: UOA - Profile
	// filters hierarchy to on row[key] == UOAFilter
	// if UOAFilter is null --> return all of learning providers
	// if UOAFilter is set --> return (lpnew2[0].values[3].values) containing filtered universities
	dmObj.getDataLP_filtered_UOA = function(){

		var hierarchyJSONnew = createJSONhierarchyNOTFIL(ref14data, "root", ["Unit of assessment name", "Profile"])
		lpnew2 = hierarchyJSONnew.values.filter(function(row){
			return (String(row["key"]) == UOAFilter || UOAFilter == null ) 
		})


		if(UOAFilter == null)
		{
			return learningProviders;
		}
		else{
			return lpnew2[0].values[3].values;
		}
	}

	// function to return array with all institutions that have a specific UOA
	// creates a higherarchy on REF14 data with keys: UOA - Profile
	// filters hierarchy to on row[key] == UOA3Filter
	// if UOA3Filter is null --> return all of learning providers
	// if UOA3Filter is set --> return (lpnew2[0].values[3].values) containing filtered universities
	dmObj.getDataLP3_filtered_UOA = function(){

		var hierarchyJSONnew = createJSONhierarchyNOTFIL(ref14data, "root", ["Unit of assessment name", "Profile"])
		lpnew2 = hierarchyJSONnew.values.filter(function(row){
			return (String(row["key"]) == UOA3Filter || UOA3Filter == null ) 
		})


		if(UOA3Filter == null)
		{
			return learningProviders;
		}
		else{
			return lpnew2[0].values[3].values;
		}
	}


	// function to return array with all institutions that fall withing a certain range of LatFilter & LongGilter
	// function filters REF14 data: gets all records with (lat lower than max radius range & lat greater than min radius range & long lower than max radius range & long greater than min radius range) 
	// creates a higherarchy on filtered data with keys: UOA - Profile
	// filters hierarchy to on row[key] == UOA3Filter
	// if LatFilter is null --> return all of learning providers
	// if LAtFilter is set , but no elements exists --> return empty object
	// if LAtFilter is set --> return (lpnew2[0].values[3].values) containing filtered universities
	dmObj.getDataLP_filtered_UOA_specific_Long_Lat= function(){
		var kmInLongitudeDegree = 111.320 * Math.cos( LatFilter / 180.0 * Math.PI);
		// specify radius in KM = 80
		var deltaLat = 80 / 111.1;
		var deltaLong = 80 / kmInLongitudeDegree;
		console.log("delta lat: ", deltaLat);
		console.log("delta long: ", deltaLong);

		var temp11 = ref14data.filter(function(row){
			return ((Number(row["LONGITUDE"])) > (Number(LongFilter)-deltaLong) && (Number(row["LONGITUDE"])) < (Number(LongFilter)+deltaLong) && (Number(row["LATITUDE"])) < (Number(LatFilter)+deltaLat) && (Number(row["LATITUDE"])) > (Number(LatFilter)-deltaLat))
		})

		var hierarchyJSONnew = createJSONhierarchyNOTFIL(temp11, "root", ["Unit of assessment name", "Profile"])
		lpnew2 = hierarchyJSONnew.values.filter(function(row){
			return (String(row["key"]) == UOA3Filter || UOA3Filter == null ) 
		})


		if(LatFilter == null)
		{
			return learningProviders;
		}
		else{
			if(lpnew2[0] == null)
			{
				return {} ;
			}
			else
			{
			return lpnew2[0].values[3].values;
			}
		}
	}

	// function to return array with all institutions that have a particular UOA and whos 4* overall rating is greater than Star4Filter
	// function filters REF14 data: gets all records with profile = overall and 4* rating higher than Star4Filter
	// creates a higherarchy on filtered data with keys: UOA - Profile
	// filters hierarchy to on row[key] == UOA2Filter
	// if UOA2Filter is null --> return all of learning providers
	// if UOA2Filter is set , but no elements exists --> return empty object
	// if UOA2Filter is set --> return (lpnew2[0].values[0].values) containing filtered universities
	dmObj.getDataLP_filtered_UOA_higher_4star = function(){

		var higher4 = ref14data.filter(function(row){
			return (Number(row["4*"]) > Star4Filter || Star4Filter == null) && (row["Profile"] == "Overall")
		})

		var hierarchyJSONnew = createJSONhierarchyNOTFIL(higher4, "root", ["Unit of assessment name", "Profile"])
		lpnew2 = hierarchyJSONnew.values.filter(function(row){
			return (String(row["key"]) == UOA2Filter || UOA2Filter == null ) 
		})

		if(UOA2Filter == null)
		{
			return learningProviders;
		}
		else{
			if(lpnew2[0] == null)
			{
				return {} ;
			}
			else
			{
			return lpnew2[0].values[0].values;
			}
		}
	}

	// returns a higherarchy on data and keys passed from parameter
	function createJSONhierarchyNOTFIL(flatDataset, rootKey, keys){
		var hierarchy = d3.nest();
		keys.forEach(applyKey);
		
		function applyKey(key, i){
			hierarchy = hierarchy
				.key(function (d) { 
					return d[key];
				});
		}
		
		//Uncomment to see effect of rollup method
		
		hierarchy = hierarchy.entries(flatDataset); 
		//Return single top node called the value of rootKey
		return {"key":rootKey, "values": hierarchy}
	}

	// returns a higherarchy on filtered data (UniNameFilter & UOAFilter) with multiple keys passed from parameter
	function createJSONhierarchy(flatDataset, rootKey, keys){
		var hierarchy = d3.nest();
		keys.forEach(applyKey);
		
		function applyKey(key, i){
			hierarchy = hierarchy
				.key(function (d) { 
					return d[key];
				});
		}
		
		//Uncomment to see effect of rollup method
		
		hierarchy = hierarchy.entries(filteredData(flatDataset)); 
		//Return single top node called the value of rootKey
		return {"key":rootKey, "values": hierarchy}
	}

	// returns a higherarchy on data and keys passed from parameter
	function createJSONhierarchy2(flatDataset, rootKey, keys){
		var hierarchy = d3.nest();
		keys.forEach(applyKey);
		
		function applyKey(key, i){
			hierarchy = hierarchy
				.key(function (d) { 
					return d[key];
				});
		}
		
		//Uncomment to see effect of rollup method
		
		hierarchy = hierarchy.entries(flatDataset); 
		//Return single top node called the value of rootKey
		return {"key":rootKey, "values": hierarchy}
	}

	// returns a higherarchy on filtered data (UOA3Filter) with keys passed from parameter
	function createJSONhierarchy3(flatDataset, rootKey, keys){
		var hierarchy = d3.nest();
		keys.forEach(applyKey);
		
		function applyKey(key, i){
			hierarchy = hierarchy
				.key(function (d) { 
					return d[key];
				});
		}
		
		//Uncomment to see effect of rollup method
		
		hierarchy = hierarchy.entries(filteredData3(flatDataset)); 
		//Return single top node called the value of rootKey
		return {"key":rootKey, "values": hierarchy}
	}

	// returns a higherarchy on filtered data (UniNameFilter & UOAFilter) with 1 key passed from parameter
	function createJSONhierarchyOne(flatDataset, rootKey, key){
		var hierarchy = d3.nest();
		keys.key(function(d) { return d[key]; })
		
		//Uncomment to see effect of rollup method
		
		hierarchy = hierarchy.entries(filteredData(flatDataset)); 
		//Return single top node called the value of rootKey
		return {"key":rootKey, "values": hierarchy}
	}


	// returns a higherarchy on filtered data with keys: UOA - Institution name
	dmObj.getHierarchy = function(){
		var hierarchyJSON = createJSONhierarchy(ref14data, "root", ["Profile", "Main panel", "Unit of assessment name"])
		return hierarchyJSON;
	}

	// return heirarchy with key = UOA
	// append an equal number with all keys, to render pie archs of equal size
	dmObj.getHierarchyUOA = function(){
		var hierarchyJSON2 = createJSONhierarchy(ref14data, "root", ["Unit of assessment name"])
		hierarchyJSON2.values.forEach(function(ref14entry){
					ref14entry.num = "2";
			})
		return hierarchyJSON2;
	}

	// returns a higherarchy on REF14 data with keys: UOA - Institution name - Profile
	dmObj.getHierarchy_UOA_Inst_Pro = function(){
		// call JSONhierarchy function that correclty identiefies related filters
		var hierarchyJSON2 = createJSONhierarchy(ref14data, "root", ["Unit of assessment name","Institution name", "Profile"])
		//var hierarchyJSON2 = createJSONhierarchyOne(ref14data, "root", "Institution name")
		return hierarchyJSON2;
	}

	// function filters REF14 data: gets all records with profile = overall
	// returns a higherarchy on filtered data with keys: UOA - Institution name
	dmObj.getHierarchy4_UOA_Inst = function(){

		var temp = ref14data.filter(function(row){
			return (row["Profile"] == "Overall")
		})

		var hierarchyJSON2 = createJSONhierarchy2(temp, "root", ["Unit of assessment name","Institution name"])
		//var hierarchyJSON2 = createJSONhierarchyOne(ref14data, "root", "Institution name")
		return hierarchyJSON2;
	}

	// returns a higherarchy on REF14 data with keys: UOA - Institution name - Profile
	dmObj.getHierarchy2_UOA_Inst_Pro = function(){

		// call JSONhierarchy function that correclty identiefies related filters
		var hierarchyJSON2 = createJSONhierarchy3(ref14data, "root", ["Unit of assessment name","Institution name", "Profile"])
		//var hierarchyJSON2 = createJSONhierarchyOne(ref14data, "root", "Institution name")
		return hierarchyJSON2;
	}

	// function filters REF14 data: gets all records within a radius of LatFilter & LongFilter
	// returns a higherarchy on filtered data with keys: UOA - Institution name - Profile
	dmObj.getHierarchy_filtered_Long_Lat = function(){
		var kmInLongitudeDegree = 111.320 * Math.cos( LatFilter / 180.0 * Math.PI);
		// specify radius in KM = 80
		var deltaLat = 80 / 111.1;
		var deltaLong = 80 / kmInLongitudeDegree;
		console.log("delta lat: ", deltaLat);
		console.log("delta long: ", deltaLong);

		var temp11 = ref14data.filter(function(row){
			return ((Number(row["LONGITUDE"])) > (Number(LongFilter)-deltaLong) && (Number(row["LONGITUDE"])) < (Number(LongFilter)+deltaLong) && (Number(row["LATITUDE"])) < (Number(LatFilter)+deltaLat) && (Number(row["LATITUDE"])) > (Number(LatFilter)-deltaLat))
		})

		var hierarchyJSONnew = createJSONhierarchy3(temp11, "root", ["Unit of assessment name","Institution name", "Profile"])

		return hierarchyJSONnew;
	}


	// print filter for debugging
	dmObj.printUniName = function(){
		console.log("UniNameFilter = ", UniNameFilter);
	}

	// print filter for debugging
	dmObj.printUniName2 = function(){
		console.log("UniName2Filter = ", UniName2Filter);
	}

	// print filter for debugging
	dmObj.printUOA3Filter = function(){
		console.log("UOA3Filter = ", UOA3Filter);
	}

	// print filter for debugging
	dmObj.printlongFilter = function(){
		console.log("LongFilter = ", LongFilter);
	}

	// print filter for debugging
	dmObj.printlatFilter = function(){
		console.log("LatFilter = ", LatFilter);
	}

	// set Longitude filter
	dmObj.setlongFilter = function(u){
		LongFilter = u;
		if (UOA3Filter ==null)
		{
			document.getElementById('manual3').innerHTML = '<p>Unit of assessment: none ==> all Intitutions near you ==> Profile ==> 4*';
		}
		else
		{
			document.getElementById('manual3').innerHTML = '<p>Unit of assessment: '+ UOA3Filter+ ' ==> all Intitutions near you ==> Profile ==> 4*';
		}
	}

	// set latitude filter
	dmObj.setlatFilter = function(u){
		LatFilter = u;
	}

	// function setting UOA filter and updating user manual text on screen
	// parameters:
	//		- u, filter to set, if equal to current filter, set to null
	// returns:
	// 		- nothing
	dmObj.setUOAFilter = function(u){
		if(UOAFilter == u){
			UOAFilter = null;
			document.getElementById('manual2').innerHTML = '<p>' + "none selected";
		} else {
			UOAFilter = u;
			document.getElementById('manual2').innerHTML = '<p>' + u;
		}
	}

	// function setting UOA3 filter and updating user manual text on screen
	// parameters:
	//		- u, filter to set, if equal to current filter, set to null
	// returns:
	// 		- nothing
	dmObj.setUOA3Filter = function(u){
		if(UOA3Filter == u){
			UOA3Filter = null;
			document.getElementById('manual2').innerHTML = '<p>' + "none selected";
		} else {
			UOA3Filter = u;
			document.getElementById('manual2').innerHTML = '<p>' + u;
		}
	}

	// function setting UniName filter and updating user manual text on screen
	// parameters:
	//		- u, filter to set, if equal to current filter, set to null
	// returns:
	// 		- nothing
	dmObj.setUniNameFilter = function(u){
		if(UniNameFilter == u){
			UniNameFilter = null;
			document.getElementById('manual').innerHTML = '<p>' + "none selected";
		} else {
			UniNameFilter = u;
			document.getElementById('manual').innerHTML = '<p>' + u;
		}
	}

	// function setting UniName2 filter and updating user manual text on screen
	// set old and new values of UniName2 to Uniarray[0] & Uniarray[1] respectively
	// this is imporatant for UAO2 filter to not be reset to null if the UniName2 changes from 1 value to other
	// parameters:
	//		- u, filter to set, if equal to current filter, set to null
	// returns:
	// 		- nothing
		
	dmObj.setUniName2Filter = function(u){
		if(UniName2Filter == u){
				Uniarray[0] = UniName2Filter;
			UniName2Filter = null;
			document.getElementById('manual3').innerHTML = '<p>Unit of assessment ==> Intitution name ==> Instituion name; Select Intitution!';
			document.getElementById('manual2').innerHTML = '<p>Heriot Watt UOAs and their overall 4* rating ==> Select UOA to view Institutions with higher 4* rating!';
			Uniarray[1] = u;
		} else {
			if (UniName2Filter == null)
			{
			Uniarray[0] = "null";
			}
			else
			{
				Uniarray[0] = UniName2Filter;
			}
			UniName2Filter = u;
			document.getElementById('manual3').innerHTML = '<p>Unit of assessment ==> '+ u +' ==> ' + u;
			document.getElementById('manual2').innerHTML = '<p>'+ u +' UOAs and their overall 4* rating = ==> Select UOA to view Institutions with higher 4* rating!';
			Uniarray[1] = u;
		}
	}


	// function setting UOA2 filter and updating user manual text on screen
	// parameters:
	//		note: you will not be able to set filter to null if UniName2 filter changes from 1 value to other, becuase if i click Computer science for Univeristy of cambridge and the I click computer science for Heriot watt, the filter should not be set to null
	//		- u, filter to set, if equal to current filter, set to null
	// returns:
	// 		- nothing
	dmObj.setUOA2Filter = function(u){
		if (Uniarray[0] != Uniarray[1]) {
			document.getElementById('manual2').innerHTML = '<p>'+ Uniarray[1]+' UOAs and their overall 4* rating ==> Selected: '+ u;
			UOA2Filter = u;
			Uniarray[0] = Uniarray[1];
		}
		else if(UOA2Filter == u){
			if(UniName2Filter ==null)
			{
				document.getElementById('manual2').innerHTML = '<p>Heriot Watt UOAs and their overall 4* rating ==> Selected: none';
			}
			else{
				document.getElementById('manual2').innerHTML = '<p>'+ UniName2Filter + ' UOAs and their overall 4* rating ==> Selected: none';
			}
			UOA2Filter = null;
		} else {
			if (UniName2Filter ==null)
			{
			document.getElementById('manual2').innerHTML = '<p>Heriot Watt UOAs and their overall 4* rating ==> Selected: ' + u;
			}
			else
			{
				document.getElementById('manual2').innerHTML = '<p>'+ Uniarray[1]+' UOAs and their overall 4* rating ==> Selected: '+ u;
			}
			UOA2Filter = u;
		}
	}

	// print filter for debugging
	dmObj.printUOA2Filter = function(){
		console.log("UOA2Filter = ", UOA2Filter);
	}

	// function setting 4* filter
	// parameters:
	//		- u, filter to set, if equal to current filter, set to null
	// returns:
	// 		- nothing
	dmObj.setStar4Filter = function(u){
		if(Star4Filter == u){
			Star4Filter = null;
		} else {
			Star4Filter = u;
		}
	}

	// print filter for debugging
	dmObj.printStar4 = function(){
		console.log("Star4Filter = ", Star4Filter);
	}

	// ---- PRIVATE VARIABLES

	var dataset = []; // dataset array

	// filters 
		var UOAFilter = null;
		var UniNameFilter = null;
		var UniName2Filter = null;
		var UOA2Filter = null;
		var UOA3Filter = null;
		var Star4Filter = null;
		var LongFilter = null;
		var LatFilter = null;

	// record changing values for UOA2Filter

		var Uniarray = [];

	// ---- PRIVATE FUNCTIONS

	// function to get data using filters


	function combineCSVdata(ref14data, learningProviders){
		console.log("\n\nFUNCTION: findREFunisWithNoEntryInLearningProvidersPlus\n")
		
		// For each learning provider university - add learning provider entry as field
		// 'lp' in relevant REF14 table entry
		learningProviders.forEach(processUniversity);
		
		function processUniversity(learningProvider){
			ref14data.forEach(function(ref14entry){
				if (ref14entry["Institution code (UKPRN)"] == learningProvider.UKPRN){
					ref14entry.LONGITUDE = learningProvider["LONGITUDE"];
					ref14entry.LATITUDE = learningProvider["LATITUDE"];
					ref14entry.VIEW_NAME = learningProvider["VIEW_NAME"];
					ref14entry.lp = learningProvider;
				}
				
			})
		}
	}
	
	function findREFunisWithNoEntryInLearningProvidersPlus(ref14data, learningProviders){
		//Find REF universities with no entry in learning-providers-plus.csv
		var listOfUniWithNoEntryInLearningProviders = "";

		console.log("\n\nFUNCTION: findREFunisWithNoEntryInLearningProvidersPlus\n")
		
		//Get list (array) of REF universities
		refUniversitiesByUKPRN = d3.nest()
			.key(function(d) { return d["Institution code (UKPRN)"]; })
			.entries(ref14data);
			
		// For each REF14 university - see if its PRN is in the Learning Providers' list
		// If not add it to listOfUniWithNoEntryInLearningProviders
		refUniversitiesByUKPRN.forEach(processUniversity);
		
		function processUniversity(ref14university){
			learningProviderUni=learningProviders.filter(function(uni){return uni.UKPRN == ref14university.key})
			if (!learningProviderUni[0]) {
				//If no entry, accumulate 
				listOfUniWithNoEntryInLearningProviders 
					+= "<p>"+ref14university.key
					+ ": "
					+ ref14university.values[0]["Institution name"]
					+"</p>";
				console.log("PRN = ", ref14university.key)
				console.log("ref14university = ", ref14university)
				console.log("Name = ", ref14university.values[0]["Institution name"] )
			}
		}
	}
	
	function displayHWCS(ref14data){
		console.log("\n\nFUNCTION: displayHWCS\n")

		heriotWattCS = ref14data.filter(function(row){
			return (row["Institution code (UKPRN)"] == 10007764) 
			&& (row["Unit of assessment name"] == "Computer Science and Informatics")
		})
		console.log("heriotWattCS = ", heriotWattCS)
	}

	//saves REF14 filter on (heriot watt & overall) to global variable
	function labFourOne(ref14data){
		console.log("\n\nFUNCTION: labFourOne\n")

		HeriotWatt_UOA_Overall = ref14data.filter(function(row){
			return (row["Institution code (UKPRN)"] == 10007764) 
			&& (row["Profile"] == "Overall")
		})

		console.log("HeriotWatt_UOA_Overall = ", HeriotWatt_UOA_Overall)
	}
	
	
	function displayOneUniversityAsNestedList(ref14data){
		console.log("\n\nFUNCTION: displayOneUniversityAsNestedList\n")

		var refUniversitiesByName = d3.nest()
			.key(function(d) { return d["Institution name"]; })
			.key(function(d) { return d["Unit of assessment name"]; })
			.key(function(d) { return d["Profile"]; })
			.entries(ref14data);
		console.log("refUniversitiesByName-UOA-Profile= ", refUniversitiesByName);
		
		var heriotWatt = refUniversitiesByName.filter(function(uni){
			return (uni.key == "Heriot-Watt University")})
		console.log("heriotWatt= ",heriotWatt)
	}

	//filter data on UniNameFilter and UOAFilter
	function filteredData(ds){
		return ds.filter(function(entry){
				return (UniNameFilter === null || UniNameFilter === String(entry["VIEW_NAME"]))
					&& (UOAFilter === null || UOAFilter === String(entry["Unit of assessment name"])); // keep if no year filter or year filter set to year being read,
			})
	}

	//filter data on UOA3Filter
	function filteredData3(ds){
		return ds.filter(function(entry){
				return (UOA3Filter === null || UOA3Filter === String(entry["Unit of assessment name"])); // keep if no year filter or year filter set to year being read,
			})
	}


	return dmObj; // returning the main object
}