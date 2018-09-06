/* global dc, d3, crossfilter, $ */

$(document).ready(function() {


    $('#initial-search-date').datepicker({ //select date to start search//

        dateFormat: 'yy-mm-dd'

    });


    $('button.data').click(function() {

        var button_id = this.id.toString(); //get the id of the search button clicked //
        neo_search_period(button_id); //call search period function with button id as argument//

    });

});



var neo_array = []; //create empty to store NEO object data//


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

    console.log(data.near_earth_objects);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//function to create data visualisation//
function plot_create() {

    var ndx = crossfilter(neo_array); //pass data to crossfilter from NEO object array//

    //call plot data functions//
    neo_row_chart(ndx); //call row chart of neo's and date//
    number_hazardous_objects(ndx); //call composite chart of number of hazardous objects//
    estimated_diameter_stack(ndx);
    potential_hazard(ndx);
    close_approach_stack(ndx); //call close approach scatter plot
    neo_data_table(ndx); // call create NEO data table function//
    
    dc.renderAll();  //render all plots//
}

//close approach date selector//
/*function close_approach_date_selector(data) {
    var close_approach_date_dim = data.dimension(dc.pluck('close_approach_date')); 
    var date_select = close_approach_date_dim.group();

    dc.selectMenu("#close-approach-date-selector")
        .dimension(close_approach_date_dim)
        .group(date_select);
}*/

////////////////////////////////////////////////////////////////////////////////
//date row chart
function neo_row_chart(data) {
    
    var close_approach_date_dim = data.dimension(dc.pluck('close_approach_date'));
    var date_group = close_approach_date_dim.group();
    
    var date_row_chart = dc.rowChart("#close-approach-date-selector");
    
    date_row_chart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
        .width(200)
        .height(300)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .dimension(close_approach_date_dim)
        .group(date_group);
}


////////////////////////////////////////////////////////////////////////////////
// hazardous objects line chart

function number_hazardous_objects(data) {
    
    var close_approach_date_dim = data.dimension(dc.pluck('close_approach_date')); //create dimension based on close approach date//

    var close_approaches = close_approach_date_dim.group().reduce( //create functions to allow crossfillter to count close approaches per day//

        function reduceAdd(p, v) {
            return p + 1;
        },

        function reduceRemove(p, v) {
            return p - 1;
        },

        function reduceInitialise() {
            return 0;
        }
    );
    
     var hazards = close_approach_date_dim.group().reduceSum( function(d) {
        if (d.potential_hazard === true){
            return +d.potential_hazard;
        }
        else{
            return 0;
        }
        
    });

    var neo_object_count_chart = dc.compositeChart("#neo-count"); //bind data to bar chart//

    // Close encounters per day chart//
    neo_object_count_chart
       .turnOnControls(true)
        .margins({ top: 10, left: 50, right: 10, bottom: 80 })
        .width(800)
        .height(400)
        .dimension(close_approach_date_dim)
        .group(close_approaches)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .compose([
            dc.lineChart(neo_object_count_chart)
                .colors('blue').group(close_approaches, "Number of NEO's").dashStyle([5,5]),
            dc.lineChart(neo_object_count_chart)
                .colors('red').group(hazards, "NEO's hazardous to Earth").dashStyle([2,2])
            ])
        .elasticY(true)
        .yAxisLabel("Number of near Earth objects")
        .xAxisLabel("Close approach date")
        .yAxis().ticks(8);
}
    
   /* var parse_date = d3.time.format("%Y-%m-%d").parse;

    neo_array.forEach(function(d) {
        d.date = parse_date(d.close_approach_date);
    });

    var date_dim = data.dimension(function(d) {
        return d.date;
    });

    //console.log(date_dim.all());

    var min_date = date_dim.bottom(1)[0].date;
    console.log(min_date);
    var max_date = date_dim.top(1)[0].date;
    console.log(max_date);
        
    var close_approach_date_dim = data.dimension(dc.pluck('close_approach_date')); //create dimension based on close approach date//

    var close_approaches = date_dim.group().reduce( //create functions to allow crossfillter to count close approaches per day//

        function reduceAdd(p, v) {
            return p + 1;
        },

        function reduceRemove(p, v) {
            return p - 1;
        },

        function reduceInitialise() {
            return 0;
        }
    );


    var hazards = date_dim.group().reduceSum( function(d) {
        if (d.potential_hazard === true){
            return +d.potential_hazard;
        }
        else{
            return 0;
        }
        
    });
    
    var neo_object_count_chart = dc.compositeChart("#neo-count"); //bind data to bar chart//

        neo_object_count_chart
        .dimension(date_dim)
        .width(500)
        .x(d3.time.scale().domain([min_date, max_date]))
        .yAxisLabel("Number of near Earth objects")
        .xAxisLabel("Close approach date")
        .legend(dc.legend().x(80).y(20).itemHeight(13).gap(5))
        .compose([
            dc.lineChart(neo_object_count_chart)
                .colors('blue').group(close_approaches, "Number of NEO's").dashStyle([5,5]),
            dc.lineChart(neo_object_count_chart)
                .colors('red').group(hazards, "NEO's hazardous to Earth").dashStyle([2,2])
            ])
        .brushOn(false)
        .elasticX(true)
        .elasticY(true)
        .render();
        
        neo_object_count_chart.xAxis().tickFormat(function (v) {return v.format("%Y-%m-%d");});
    }*/
    
    ////////////////////////////////
//Potential hazard function// 
//////////////////////////////

function potential_hazard(data) {
    
     var hazard_size = data.dimension(function(d) {
        if (d.potential_hazard == true) {
            return 'true';
        }
        else {
            return 'false';
        }
    });

    var hazard_size_group = hazard_size.group();
    
    dc.pieChart("#potential-hazard")
        .radius(100)
        .innerRadius(40)
        .height(400)
        .dimension(hazard_size)
        .group(hazard_size_group)
        .ordinalColors(['#b1d6de','#a1c3f0'])
        .renderLabel(false)
        .legend(dc.legend().x(75).y(330).itemWidth(60).gap(5).horizontal(true))
        .transitionDuration(500);

}

////////////////////////////////////////////////
///////////////////////////////////////////////

//close approach distance stacked function//
/*function close_approach_scatter(ndx){
    var parseDate = d3.time.format("%Y-%m-%d").parse;

    neo_array.forEach(function(d) {
        d.date = parseDate(d.close_approach_date);
    });

    var date_dim = ndx.dimension(function(d) {
        return d.date;
    });

    //console.log(date_dim.all());

    var min_date = date_dim.bottom(1)[0].date;
    var max_date = date_dim.top(1)[0].date;

    var spend_dim = ndx.dimension(function(d) {
        return [d.date, d.miss_distance_km, d.name];
    });

    var spend_group = spend_dim.group();
    //console.log(spend_group.all());

    var distanceColours = d3.scale.ordinal()
        .domain(["near", "middle", "far"])
        .range(["red", "blue", "green"]);

    var spend_chart = dc.scatterPlot("#scatter-plot");
    spend_chart
        .width(600)
        .height(400)
        .x(d3.time.scale().domain([min_date, max_date]))
        .brushOn(false)
        .symbolSize(8)
        .clipPadding(10)
        .yAxisLabel("Amount Spent")
        .title(function(d) {
            return "NEO name : " + d.key[2] + " , Earth miss distance: " + d.key[1] + " x 10^6 Km";
        })
        .colorAccessor(function(d) {
            if (d.key[1] <= 10) {
                return "near";

            }
            else if (50 <= d.key[1]) {
                return "far";
            }
            else {
                return "middle";
            }
        })
        .colors(distanceColours)
        .dimension(spend_dim)
        .group(spend_group);

} */  

function close_approach_stack(data) {

    var close_approach_date_dim = data.dimension(dc.pluck('close_approach_date')); //create dimension based on close approach date//

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

    var lessThan10millionkm = miss_distance(close_approach_date_dim, 0, 10);
    var lessThan50millionkm = miss_distance(close_approach_date_dim, 10, 50);
    var moreThan50millionkm = miss_distance(close_approach_date_dim, 50, 100);

    dc.barChart("#scatter-plot")
        .width(500)
        .height(300)
        .dimension(close_approach_date_dim)
        .group(lessThan10millionkm, "less than 10*10^6 km")
        .stack(lessThan50millionkm, "less than 20*10^6 km")
        .stack(moreThan50millionkm, "greater than 50*10^6 km")
        .valueAccessor(function(d) {
            if (d.value.total > 0) {
                return d.value.total;
            }
            else {
                return 0;
            }
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .ordinalColors(['red','#a1c3f0','green'])
        .legend(dc.legend().x(320).y(20).itemHeight(15).gap(5))
        .margins({ top: 10, right: 100, bottom: 30, left: 30 });
}


//Estimated maximum diameter stacked barchart function//

function estimated_diameter_stack(data) {

    var close_approach_date_dim = data.dimension(dc.pluck('close_approach_date')); //create dimension based on close approach date//

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

    var lessThan1km = estimated_diameter(close_approach_date_dim, 0, 1);
    var lessThan2km = estimated_diameter(close_approach_date_dim, 1, 2);
    var moreThan2km = estimated_diameter(close_approach_date_dim, 2, 100);

    dc.barChart("#estimated-diameter-stack")
        .width(500)
        .height(300)
        .dimension(close_approach_date_dim)
        .group(lessThan1km, "less than 1km")
        .stack(lessThan2km, "less than 2km")
        .stack(moreThan2km, "greater than 2km")
        .valueAccessor(function(d) {
            if (d.value.total > 0) {
                return d.value.total;
            }
            else {
                return 0;
            }
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .ordinalColors(['#b1d6de','#a1c3f0','#a1b5f0'])
        .legend(dc.legend().x(320).y(20).itemHeight(15).gap(5))
        .margins({ top: 10, right: 100, bottom: 30, left: 30 });
}


/*function size_hazard(data) {
    
            var chart = dc.seriesChart('#line');

            neo_array.forEach(function(x) {
               if(x.potential_hazard == true) {
                  x.newdata = 1;
               } else {
                  x.newdata = 2;
               }
            });

            var hwDimension = data.dimension(function(d) { 
               return [d.potential_hazard, d.estimated_diameter_max];
            });
            var hwGroup = hwDimension.group().reduceCount();

            chart
               .width(800)
               .height(600)
               .chart(function(c) { 
                  return dc.lineChart(c).interpolate('cardinal').evadeDomainFilter(true);
               })
               .x(d3.scale.linear().domain([0,5]))
               .elasticY(true)
               .brushOn(false)
               .xAxisLabel("Height")
               .yAxisLabel("Count")
               .dimension(hwDimension)
               .group(hwGroup)
               .seriesAccessor(function(d) { return d.key[0];})
               .keyAccessor(function(d) { return +d.key[1]; })
               .valueAccessor(function(d) { return +d.value; })
               .legend(dc.legend().x(350).y(500).itemHeight(13).gap(5).horizontal(1)
                  .legendWidth(120).itemWidth(60));

            chart.render();
         }*/

//NEO data table//
function neo_data_table(data) {


    var neo_data_dim = data.dimension(function(d) { //create dimensions to be used in plotting
        return d;

    });


    var neo_object_table = dc.dataTable('#neo_data_table'); //bind data to table//


    //NEO object data table//
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