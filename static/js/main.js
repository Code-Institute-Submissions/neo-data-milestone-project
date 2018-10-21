
//Identify global variables
/* global dc, d3, crossfilter, $, topFunction */


//Event actions
$(document).ready(function() {

    $('#initial-search-date').datepicker({ //select date to start search
        dateFormat: 'yy-mm-dd'
    });
    
    $('#initial-search-date').focus(function() {
        $('.ui-datepicker').addClass('calendar-background'); //add class to date-picker calendar
    });

    $('button.data').click(function() {
        var input_date =  document.getElementById('initial-search-date').value;
        var  date_validaton = Date.parse(input_date);
        
            if (date_validaton > 0) {
                var button_id = this.id.toString(); //get the id of the search button clicked 
                
                if ($('#data-output').hasClass("data-hidden")) {
                    var data_output_state = 'false';
                }           
                else {data_output_state = 'true';}
                
                neo_search_period(button_id, data_output_state); //call search period function with button id as argument
            }
            else {
                document.getElementById('initial-search-date').value = 'Please enter a date';
                alert("An invalid date has been entered");
            }
        });

    $('.link').mouseenter(function() { $(this).animate({ "color": "#eb5d5d" }, 800) })
        .mouseleave(function() { $(this).animate({ "color": '#007bff' }, 800) }); //add styles to link

    $('#table_update_all').click(function(){ //table button to show all NEO data
            document.getElementById("table_title").innerHTML = "All Approaches";
            var n = 200;
            plot_create(n);
    });
    
    $('#table_update_top').click(function(){ //table button to show top 10 closest approaches
            document.getElementById("table_title").innerHTML = "Top 10 Closest Approaches";
            var n = 10;
            plot_create(n);
    });
    
    $("#return").click(topFunction()); //Return to top 
});

// Change data content area to visible
function display_data(){
            $('#data-output').removeClass('data-hidden').addClass('data-display'); //reveal data output container elements//
            $('#return').removeClass('data-hidden'); //reveal back to top link//
    }

//Definition of search period function with id as input argument
function neo_search_period(id, data_output_state) {
    
    var state = data_output_state; // define variable based on data output state
    
    var start_search_date = document.getElementById('initial-search-date').value, //get start date of NEO search from user
        start_date = new Date(start_search_date), //create start date variable
        new_date = new Date(start_date); //create new search date variable

    if (id == 'search') { //if statement based on id returned for search button clicked

       search_start(start_search_date, new_date);
    }
    else if (id == 'prev') {
        new_date.setDate(new_date.getDate() - 8); //set new date of search period
        date_format(new_date); //call function to format date correctly
        document.getElementById('initial-search-date').value = window.search_date; //write date to element
        
        start_search_date = window.search_date;
        start_date = new Date(start_search_date), //create start date variable
        new_date = new Date(start_date); //create new search date variable
        
        if (state == 'true') {
            search_start(start_search_date, new_date);
        }
    }
    else if (id == 'next') {

        new_date.setDate(new_date.getDate() + 8); //set new date of search period
        date_format(new_date); //call function to format date correctly
        document.getElementById('initial-search-date').value = window.search_date; //write date to element
        
        start_search_date = window.search_date;
        start_date = new Date(start_search_date), //create start date variable
        new_date = new Date(start_date); //create new search date variable
        
        if (state == 'true') {
            search_start(start_search_date, new_date);
        }
    }
    else { alert('An error has occured'); } //alert user if error occurs
}

// search function which calls main data generation function 
function search_start(start, end) { 
        end.setDate(end.getDate() + 7); //set new date of search period
        date_format(end); //call function to format date correctly

        var search_period = "https://api.nasa.gov/neo/rest/v1/feed?start_date=" + start + "&" +
            window.search_date + "&api_key=snyH1wsmtSD133oCQy2spPHmK4PICRb2Y6PdAt4Q"; //create search URL

        retrieve_asteroid_data(search_period, data_extraction, plot_create); //call function to retrieve NEO data
}

// Function to output date in the required format
function date_format(date) {
    window.search_date = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2); //format date variable
}


//Retrieve data from server and make data available via callback function
function retrieve_asteroid_data(search_url, data_create, print) {

    var xhr = new XMLHttpRequest(); //create new XMLHttp request

    xhr.open("GET", search_url); //request data from search URL
    xhr.send();

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            data_create(JSON.parse(this.responseText)); //callback function with server response data as input argument
            
            var n= 10; // define initial table size
            print(n); //callback function to plot data visualisations
            display_data(); //display data content area
        }
    };
}


//function to obtain NEO object data and create new object with required information
function data_extraction(data) {

    window.neo_array = []; //clear previous data from array

    //extract keys from data objects
    for (var key in data.near_earth_objects) {

        var date = data.near_earth_objects[key]; //obtain keys in 'near_earth_objects'

        for (key in date) {

            var neo = date[key]; //obtain keys in 'date' objects
            var neo_object = {}; //create empty object to store information

            neo_object.name = neo["name"];
            neo_object.nasa_jpl_url = neo["nasa_jpl_url"];
            neo_object.close_approach_date = neo["close_approach_data"][0]["close_approach_date"];
            neo_object.absolute_magnitude_h = neo["absolute_magnitude_h"];
            neo_object.estimated_diameter_max = neo["estimated_diameter"]["kilometers"]["estimated_diameter_max"];
            neo_object.miss_distance_km = neo["close_approach_data"][0]["miss_distance"]["kilometers"] / 1000000;
            neo_object.relative_velocity_kmps = neo["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"];
            neo_object.potential_hazard = neo["is_potentially_hazardous_asteroid"];
            neo_object.links = neo["links"]["self"];
            
            window.neo_array.push(neo_object); //push created data objects to array
        }
    }
}

//function to create data visualisation
function plot_create(n, display_data) {

    var ndx = crossfilter(window.neo_array); //pass data to crossfilter from NEO object array

    //define chart variables names
    var neo_object_count_chart, close_approach_stacked, estimated_diameter_stacked, hazardous_neo, total_neo_count, neo_object_table;

    number_hazardous_objects(ndx, neo_object_count_chart); //call composite chart of number of hazardous objects
    close_approach_stack(ndx, close_approach_stacked); //call close approach stack plot
    estimated_diameter_stack(ndx, estimated_diameter_stacked); //call estimated diameter stack plot
    potential_hazard(ndx, hazardous_neo); //call potential hazard pie chart
    neo_count(ndx, total_neo_count); //call total count function
    neo_data_table(ndx, neo_object_table, n); //call create NEO data table function

    dc.renderAll(); //render all plots
}

//miss distance function
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

//estimated diameter function
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

//NEO objects line chart
function number_hazardous_objects(data, chart) {

    var parse_date = d3.time.format("%Y-%m-%d").parse; //set format for date string

    window.neo_array.forEach(function(d) {
        d.date = parse_date(d.close_approach_date); //parse date string
    });

    var close_approach_date_dim = data.dimension(function(d) { //create dimension
        return d.date;
    });

    var min_date = close_approach_date_dim.bottom(1)[0].date; //create start date
    var max_date = close_approach_date_dim.top(1)[0].date; //create end date

    var close_approaches = close_approach_date_dim.group().reduce( //create functions to allow crossfillter to count close approaches per day
        function reduceAdd(p, v) { return p + 1; },
        function reduceRemove(p, v) { return p - 1; },
        function reduceInitialise() { return 0; }
    );

    var hazards = close_approach_date_dim.group().reduceSum(function(d) { //create functions to allow crossfillter to count potentially hazardous close approaches per day
        if (d.potential_hazard === true) { return +d.potential_hazard; }
        else { return 0; }
    });

    var lessThan10millionkm = miss_distance(close_approach_date_dim, 0, 10); //call miss distance function with required arguments
    var greaterThan2km = estimated_diameter(close_approach_date_dim, 2, 10); //call estimated diameter function with required arguments

    chart = dc.compositeChart("#neo-count"); //bind data to html element
    chart //create chart
        .margins({ top: 60, right: 30, bottom: 80, left: 40 })
        .dimension(close_approach_date_dim)
        .width(550)
        .height(350)
        .x(d3.time.scale().domain([min_date, max_date]))
        .shareTitle(false)
        .compose([
            dc.lineChart(chart)
            .colors('#96bae2')
            .group(close_approaches, "Total number of NEO's per day").title(function(d) { return "There are a total of " + d.value + " NEO's making their close approach to Earth on this date" }),
            dc.lineChart(chart)
            .colors('#eb5d5d')
            .group(hazards, "Neo's potentially hazardous to Earth").title(function(d) { return "There are a total of " + d.value + " potentially hazardous NEO's making their close approach to Earth on this date"}),
            dc.lineChart(chart)
            .colors('#ade49b')
            .group(lessThan10millionkm, "Miss distance less than 10 million km ")
            .valueAccessor(function(d) {
                if (d.value.total > 0) { return d.value.total; }
                else { return 0; }
            }).title(function(d) { return "There are a total of " + d.value.total + " NEO's with an Earth miss distance less than 10 million km making their close approach to Earth on this date" }),
            dc.lineChart(chart)
            .colors('#e378e4')
            .group(greaterThan2km, "Estimated diameter greater than 2km")
            .valueAccessor(function(d) {
                if (d.value.total > 0) { return d.value.total; }
                else { return 0; }
            }).title(function(d) { return "There are a total of " + d.value.total + " NEO's with an estimated diameter greater than 2 km making their close approach to Earth on this date" })
        ])

        .brushOn(false)
        .elasticX(true)
        .elasticY(true)
        .xAxisLabel("Close approach date")
        .yAxisLabel("Number of NEO objects")
        .legend(dc.legend().x(60).y(-2).itemWidth(250).gap(20).horizontal(true))
        .render()
        .xAxis().tickFormat(d3.time.format("%Y-%m-%d")).ticks(8);

}

//Close approach distance stacked chart
function close_approach_stack(data, chart) {

    var close_approach_date_dim = data.dimension(dc.pluck('close_approach_date')); //create dimension based on close approach date

    //call miss distance function with required arguments
    var lessThan10millionkm = miss_distance(close_approach_date_dim, 0, 10);
    var lessThan50millionkm = miss_distance(close_approach_date_dim, 10, 50);
    var moreThan50millionkm = miss_distance(close_approach_date_dim, 50, 100);

    chart = dc.barChart("#close-approach-plot"); //bind data to stacked chart
    chart
        .margins({ top: 50, right: 30, bottom: 80, left: 40 })
        .width(500)
        .height(350)
        .dimension(close_approach_date_dim)
        .group(lessThan10millionkm, "less than 10*10^6 km")
        .stack(lessThan50millionkm, "less than 50*10^6 km")
        .stack(moreThan50millionkm, "greater than 50*10^6 km")
        .valueAccessor(function(d) {
            if (d.value.total > 0) { return d.value.total; }
            else { return 0; }
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .ordinalColors(['#eb5d5d', '#b7cee8', '#ade49b'])
        .title('less than 10*10^6 km', function(d) { return 'There are ' + d.value.total + ' NEOs with a close approach distance less than 10*10^6 km on ' + d.key; })
        .title('less than 50*10^6 km', function(d) { return 'There are ' + d.value.total + ' NEOs with a close approach distance less than 50*10^6 km and greater than 10*10^6 km on ' + d.key; })
        .title('greater than 50*10^6 km', function(d) { return 'There are ' + d.value.total + ' NEOs with a close approach distance greater than 50*10^6 km on ' + d.key; })
        .legend(dc.legend().x(50).y(-2).itemWidth(140).gap(5).horizontal(true))
        .yAxisLabel("Number of NEO objects")
        .xAxisLabel("Close approach date");
}

//Estimated maximum diameter stacked chart function
function estimated_diameter_stack(data, chart) {

    var close_approach_date_dim = data.dimension(dc.pluck('close_approach_date')); //create dimension based on close approach date

    //call estimated diameter function with arguments
    var lessThan1km = estimated_diameter(close_approach_date_dim, 0, 1);
    var lessThan2km = estimated_diameter(close_approach_date_dim, 1, 2);
    var moreThan2km = estimated_diameter(close_approach_date_dim, 2, 100);

    chart = dc.barChart("#estimated-diameter-stack"); //bind data to stacked chart
    chart
        .margins({ top: 50, right: 30, bottom: 80, left: 40 })
        .width(500)
        .height(350)
        .dimension(close_approach_date_dim)
        .group(lessThan1km, "less than 1km")
        .stack(lessThan2km, "less than 2km")
        .stack(moreThan2km, "greater than 2km")
        .valueAccessor(function(d) {
            if (d.value.total > 0) { return d.value.total; }
            else { return 0; }
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .ordinalColors(['#ade49b', '#b7cee8', '#eb5d5d'])
        .title('less than 1km', function(d) { return 'There are ' + d.value.total + ' NEOs with an estimated diameter less than 1km on ' + d.key; })
        .title('less than 2km', function(d) { return 'There are ' + d.value.total + ' NEOs with an estimated diameter less than 2km but greater than 1 km on ' + d.key; })
        .title('greater than 2km', function(d) { return 'There are ' + d.value.total + ' NEOs with an estimated diameter greater than 2km on ' + d.key; })
        .legend(dc.legend().x(100).y(-2).itemWidth(100).gap(5).horizontal(true))
        .yAxisLabel("Number of NEO objects")
        .xAxisLabel("Close approach date");
}

//Potential hazard pie chart
function potential_hazard(data, chart) {

    var hazard_size = data.dimension(function(d) { //create dimension based on potential hazard
        if (d.potential_hazard == true) { return 'YES'; }
        else { return 'NO'; }
    });

    var hazard_size_group = hazard_size.group(); //create data group

    chart = dc.pieChart("#potential-hazard"); //bind data to chart
    chart
        .radius(130)
        .innerRadius(50)
        .height(400)
        .width(300)
        .dimension(hazard_size)
        .group(hazard_size_group)
        .ordinalColors(['#ade49b', '#eb5d5d'])
        .title(function(d) {
            if (d.key === 'YES') {
                return "A potential risk to Earth is posed by these " + d.value + " NEO's";
            }
            else { return "No risk to Earth is posed by these " + d.value + " NEO's"; }
        })
        .renderLabel(true)
        .legend(dc.legend().x(110).y(350).itemWidth(60).gap(5).horizontal(true))
        .transitionDuration(500);
}

//Total object count
function neo_count(data, count) {

    var all = data.groupAll();

    count = dc.dataCount("#data-count")
        .dimension(data)
        .group(all);
}

//NEO data table
function neo_data_table(data, table, n) {

    var neo_data_dim = data.dimension(function(d) { return d; }); //create dimensions to be used in plotting

    table = dc.dataTable('#neo_data_table'); //bind data to table
    table
        .dimension(neo_data_dim)
        .group(function(d) { return d; })
        .size(n)
        .columns([
            function(d) { return d.close_approach_date; },
            function(d) { return d.name; },
            function(d) { return d.miss_distance_km.toPrecision(4); },
            function(d) { return d.estimated_diameter_max.toPrecision(4); },
            function(d) { return d.potential_hazard; },
            function(d) { return '<a id="neo-link" href=\"' + d.nasa_jpl_url + '\" target=\"_blank\">' + d.nasa_jpl_url + '</a>';}
        ])
        .sortBy(function(d) { return d.miss_distance_km; })
        .order(d3.ascending)
        .on('renderlet', function(table) {
            table.select('tr.dc-table-group').remove();
        });
}
