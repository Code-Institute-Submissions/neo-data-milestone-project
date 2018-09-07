////////////////////////////////////////////////////////////////////////////////
//CREATE GLOBAL VARIABLES//
////////////////////////////////////////////////////////////////////////////////

var neo_array = []; //create empty to store NEO object data//
//Identify global variables//
/* global dc, d3, crossfilter, $ */



////////////////////////////////////////////////////////////////////////////////
//EVENT ACTIONS//
////////////////////////////////////////////////////////////////////////////////

$(document).ready(function() {


    $('#initial-search-date').datepicker({ //select date to start search//

        dateFormat: 'yy-mm-dd'

    });


    $('button.data').click(function() {

        var button_id = this.id.toString(); //get the id of the search button clicked //
        neo_search_period(button_id); //call search period function with button id as argument//

    });

});


////////////////////////////////////////////////////////////////////////////////
//CREATE SERVER REQUEST IN CORRECT FORMAT//
////////////////////////////////////////////////////////////////////////////////

//Definition of search period function with id as input argument//
function neo_search_period(id) {

    if (document.getElementById('initial-search-date').value == '') {

        document.getElementById('initial-search-date').value = 'Please enter a date'; // request valid input date from user
    }
    else {
        var start_search_date = document.getElementById('initial-search-date').value; //get start date of NEO search from user//
    }

    var start_date = new Date(start_search_date); //create start date variable//

    var new_date = new Date(start_date); //create new search date variable//

    //if statement based on id returned for search button clicked//
    if (id == 'search') {

        new_date.setDate(new_date.getDate() + 7); //set new date of search period//

        date_format(new_date); //call function to format date correctly//

        // document.getElementById('end-search-date').value = window.search_date; //write date to element//

        var search_period = "https://api.nasa.gov/neo/rest/v1/feed?start_date=" + start_search_date + "&" +
            window.search_date + "&api_key=ZnhM6SAoXPwGVXYMEqYw5L4MLB7z6SQmrwv7fbuW"; //create search URL//

        retrieve_asteroid_data(search_period, data_extraction, plot_create); //call function to retrieve NEO data//
    }
    else if (id == 'prev') {

        new_date.setDate(new_date.getDate() - 8); //set new date of search period//

        date_format(new_date); //call function to format date correctly//

        document.getElementById('initial-search-date').value = window.search_date; //write date to element//
    }
    else if (id == 'next') {

        new_date.setDate(new_date.getDate() + 8); //set new date of search period//

        date_format(new_date); //call function to format date correctly//

        document.getElementById('initial-search-date').value = window.search_date; //write date to element//
    }
    else {

        alert('An error has occured'); //alert user if error occurs//
    }
}


// Function to output date in the required format //
function date_format(date) {

    window.search_date = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2); //format date variable//
}



////////////////////////////////////////////////////////////////////////////////
//RETRIEVE DATA FROM SERVER//
////////////////////////////////////////////////////////////////////////////////

//Retrieve data from server and make data available via callback function//
function retrieve_asteroid_data(search_url, data_create, print) {

    var xhr = new XMLHttpRequest(); //create new XMLHttp request//

    xhr.open("GET", search_url); //request data from search URL//
    xhr.send();

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            data_create(JSON.parse(this.responseText)); //callback function with server response data as input argument//

            print(); //callback function to plot data visualisations//
        }
    };
}


////////////////////////////////////////////////////////////////////////////////
//CREATE NEW OBJECT FROM ACQUIRED DATA//
////////////////////////////////////////////////////////////////////////////////

//function to obtain NEO object data and create new object with required information//
function data_extraction(data) {

    neo_array = []; //clear previous data from array//

    //extract keys from data objects//
    for (var key in data.near_earth_objects) {


        var date = data.near_earth_objects[key]; //obtain keys in 'near_earth_objects'//


        for (key in date) {


            var neo = date[key]; //obtain keys in 'date' objects// 


            var neo_object = {}; //create empty object to store information//


            neo_object.name = neo["name"];

            neo_object.nasa_jpl_url = neo["nasa_jpl_url"];

            neo_object.close_approach_date = neo["close_approach_data"][0]["close_approach_date"];

            neo_object.absolute_magnitude_h = neo["absolute_magnitude_h"];

            neo_object.estimated_diameter_max = neo["estimated_diameter"]["kilometers"]["estimated_diameter_max"];

            neo_object.miss_distance_km = neo["close_approach_data"][0]["miss_distance"]["kilometers"] / 1000000;

            neo_object.relative_velocity_kmps = neo["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"];

            neo_object.potential_hazard = neo["is_potentially_hazardous_asteroid"];

            neo_object.links = neo["links"]["self"];

            neo_array.push(neo_object); //push created data objects to array//
        }
    }
}


////////////////////////////////////////////////////////////////////////////////
//PLOT DATA//
////////////////////////////////////////////////////////////////////////////////

//function to create data visualisation//
function plot_create() {

    var ndx = crossfilter(neo_array); //pass data to crossfilter from NEO object array//

    neo_row_chart(ndx); //call row chart of neo's and date//
    number_hazardous_objects(ndx); //call composite chart of number of hazardous objects//
    close_approach_stack(ndx); //call close approach stack plot
    potential_hazard(ndx); //call potential hazard pie chart
    estimated_diameter_stack(ndx); //call estimated diameter stack plot
    neo_data_table(ndx); // call create NEO data table function//

    dc.renderAll(); //render all plots//
}


////////////////////////////////////////////////////////////////////////////////
//PLOT CREATE FUNCTIONS//
////////////////////////////////////////////////////////////////////////////////


//miss distance function//
function miss_distance(dimension, min_distance, max_distance) {
    return dimension.group().reduce(
        function(p, v) {
            if (min_distance <= v.miss_distance_km) {
                if (v.miss_distance_km < max_distance) {
                    p.total++;
                }
            }
            return p;
        },
        function(p, v) {
            if (min_distance <= v.miss_distance_km) {
                if (v.miss_distance_km < max_distance) {
                    p.total--;
                }
            }
            return p;
        },
        function() {
            return { total: 0 };
        }
    );
}


//estimated diameter function//
function estimated_diameter(dimension, min_size, max_size) {
    return dimension.group().reduce(
        function(p, v) {
            if (min_size <= v.estimated_diameter_max) {
                if (v.estimated_diameter_max < max_size) {
                    p.total++;
                }
            }
            return p;
        },
        function(p, v) {
            if (min_size <= v.estimated_diameter_max) {
                if (v.estimated_diameter_max < max_size) {
                    p.total--;
                }
            }
            return p;
        },
        function() {
            return { total: 0 };
        }
    );
}
 
 
//Date row chart//
function neo_row_chart(data) {

    var close_approach_date_dim = data.dimension(dc.pluck('close_approach_date')); //create dimension//
    var date_group = close_approach_date_dim.group(); //create group//

    var date_row_chart = dc.rowChart("#close-approach-date-selector"); //bind data to html element//
        date_row_chart //create chart//
            .width(200).height(300)
            .margins({ top: 20, left: 10, right: 10, bottom: 20 })
            .dimension(close_approach_date_dim).group(date_group);
}


//NEO objects line chart//
function number_hazardous_objects(data) {

    var parse_date = d3.time.format("%Y-%m-%d").parse; //set format for date string//

    neo_array.forEach(function(d) {
        d.date = parse_date(d.close_approach_date); //parse date string//
    });

    var close_approach_date_dim = data.dimension(function(d) { //create dimension//
        return d.date;
    });

    var min_date = close_approach_date_dim.bottom(1)[0].date; //create start date//
    var max_date = close_approach_date_dim.top(1)[0].date; //create end date//

    var close_approaches = close_approach_date_dim.group().reduce( //create functions to allow crossfillter to count close approaches per day//
        function reduceAdd(p, v) { return p + 1; },
        function reduceRemove(p, v) { return p - 1; },
        function reduceInitialise() { return 0; }
    );

    var hazards = close_approach_date_dim.group().reduceSum(function(d) { //create functions to allow crossfillter to count potentially hazardous close approaches per day//
        if (d.potential_hazard === true) { return +d.potential_hazard; }
        else { return 0; }
    });

    var lessThan10millionkm = miss_distance(close_approach_date_dim, 0, 10); //call miss distance function with required arguments//
    var greaterThan2km = estimated_diameter(close_approach_date_dim, 2, 10); //call estimated diameter function with required arguments//

    var neo_object_count_chart = dc.compositeChart("#neo-count"); //bind data to html element//
        neo_object_count_chart //create chart//
            .margins({ top: 60, right: 30, bottom: 80, left: 40 })
            .dimension(close_approach_date_dim)
            .width(800)
            .height(300)
            .x(d3.time.scale().domain([min_date, max_date]))
            .compose([
                dc.lineChart(neo_object_count_chart)
                .colors('#96bae2')
                .group(close_approaches, "Total number of NEO's per day"),
                dc.lineChart(neo_object_count_chart)
                .colors('#eb5d5d')
                .group(hazards, "Neo's potentially hazardous to Earth"),
                dc.lineChart(neo_object_count_chart)
                .colors('#ade49b')
                .group(lessThan10millionkm, "Miss distance less than 10 million km ")
                .valueAccessor(function(d) {
                    if (d.value.total > 0) { return d.value.total; }
                    else { return 0; } }),
                dc.lineChart(neo_object_count_chart)
                .colors('#e378e4')
                .group(greaterThan2km, "Estimated diameter greater than 2km")
                .valueAccessor(function(d) {
                    if (d.value.total > 0) { return d.value.total; }
                    else { return 0; }})])
            .brushOn(false)
            .elasticX(true)
            .elasticY(true)
            .xAxisLabel("Close approach date")
            .yAxisLabel("Number of NEO's")
            .legend(dc.legend().x(150).y(-3).itemWidth(250).gap(20).horizontal(true))
            .render()
            .xAxis().tickFormat(d3.time.format("%Y-%m-%d")).ticks(8);

}


//Close approach distance stacked chart//
function close_approach_stack(data) {

    var close_approach_date_dim = data.dimension(dc.pluck('close_approach_date')); //create dimension based on close approach date//

    //call miss distance function with required arguments//
    var lessThan10millionkm = miss_distance(close_approach_date_dim, 0, 10);
    var lessThan50millionkm = miss_distance(close_approach_date_dim, 10, 50);
    var moreThan50millionkm = miss_distance(close_approach_date_dim, 50, 100);

    var close_approach_stacked = dc.barChart("#close-approach-plot"); //bind data to stacked chart//
        close_approach_stacked
            .margins({ top: 50, right: 30, bottom: 80, left: 40 })
            .width(500)
            .height(350)
            .dimension(close_approach_date_dim)
            .group(lessThan10millionkm, "less than 10*10^6 km")
            .stack(lessThan50millionkm, "less than 20*10^6 km")
            .stack(moreThan50millionkm, "greater than 50*10^6 km")
            .valueAccessor(function(d) {
                if (d.value.total > 0) { return d.value.total; }
                else { return 0; } })
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .ordinalColors(['#eb5d5d', '#b7cee8', '#ade49b'])
            .legend(dc.legend().x(50).y(-2).itemWidth(140).gap(5).horizontal(true))
            .yAxisLabel("Number of NEO objects")
            .xAxisLabel("Close approach date");
}


//Potential hazard pie chart// 
function potential_hazard(data) {

    var hazard_size = data.dimension(function(d) { //create dimension based on potential hazard//
        if (d.potential_hazard == true) { return 'YES'; }
        else { return 'NO'; }
    });

    var hazard_size_group = hazard_size.group(); //create data group//

    var hazardous_neo = dc.pieChart("#potential-hazard"); //bind data to chart//
        hazardous_neo
            .radius(100)
            .innerRadius(40)
            .height(400)
            .dimension(hazard_size)
            .group(hazard_size_group)
            .ordinalColors(['#ade49b', '#eb5d5d'])
            .renderLabel(false)
            .legend(dc.legend().x(75).y(330).itemWidth(60).gap(5).horizontal(true))
            .transitionDuration(500);
}


//Estimated maximum diameter stacked chart function//
function estimated_diameter_stack(data) {

    var close_approach_date_dim = data.dimension(dc.pluck('close_approach_date')); //create dimension based on close approach date//

    //call estimated diameter function with arguments//
    var lessThan1km = estimated_diameter(close_approach_date_dim, 0, 1);
    var lessThan2km = estimated_diameter(close_approach_date_dim, 1, 2);
    var moreThan2km = estimated_diameter(close_approach_date_dim, 2, 100);

    var estimated_diameter_stack = dc.barChart("#estimated-diameter-stack"); //bind data to stacked chart//
        estimated_diameter_stack
            .margins({ top: 50, right: 30, bottom: 80, left: 40 })
            .width(500)
            .height(350)
            .dimension(close_approach_date_dim)
            .group(lessThan1km, "less than 1km")
            .stack(lessThan2km, "less than 2km")
            .stack(moreThan2km, "greater than 2km")
            .valueAccessor(function(d) {
                if (d.value.total > 0) { return d.value.total; }
                else { return 0; } })
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .ordinalColors(['#ade49b', '#b7cee8', '#eb5d5d'])
            .legend(dc.legend().x(100).y(-2).itemWidth(100).gap(5).horizontal(true))
            .yAxisLabel("Number of NEO objects")
            .xAxisLabel("Close approach date");
}


//NEO data table//
function neo_data_table(data) {

    var neo_data_dim = data.dimension(function(d) { return d; }); //create dimensions to be used in plotting

    var neo_object_table = dc.dataTable('#neo_data_table'); //bind data to table//
        neo_object_table
            .dimension(neo_data_dim)
            .group(function(d) { return d; })
            .size(100)
            .columns([
                function(d) { return d.close_approach_date; },
                function(d) { return d.name; },
                function(d) { return d.miss_distance_km.toPrecision(4); },
                function(d) { return d.estimated_diameter_max.toPrecision(4); },
                function(d) { return d.potential_hazard; },
                function(d) { return d.nasa_jpl_url; }
            ])
            .sortBy(function(d) { return d.close_approach_date; })
            .order(d3.ascending)
            .on('renderlet', function(table) {
                table.select('tr.dc-table-group').remove();
            });
}
