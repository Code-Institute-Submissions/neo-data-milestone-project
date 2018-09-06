
//object number function//
function close_approach_object_number(data) {

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

    var neo_object_count_chart = dc.barChart("#neo_count"); //bind data to bar chart//

    // Close encounters per day chart//
    neo_object_count_chart
       .turnOnControls(true)
        .margins({ top: 10, left: 50, right: 10, bottom: 80 })
        .width(800)
        .height(400)
        .dimension(close_approach_date_dim)
        .group(close_approaches)
        .ordinalColors(['#b1d6de','#a1c3f0','#a1b5f0','#b1d6de','#a1c3f0','#a1b5f0','red', 'green'])
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxisLabel("Number of near Earth objects")
        .xAxisLabel("Close approach date")
        .yAxis().ticks(10);
}



//close approach scatter function//
function close_approach_scatter(ndx){
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

    var spend_chart = dc.compositeChart("#scatter-plot");
    spend_chart
        .width(800)
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

}


//Closest approach distance function// 
function close_approach_object_distance(data) {


var neo_distance = data.dimension(function(d) {
        if (d.miss_distance_km < 10) {
            return "too close";
        }
        else {
            return "fine";
        }
    });

    var neo_distance_group = neo_distance.group();

    
    dc.pieChart("#neo_distance")
        .radius(100)
        .innerRadius(40)
        .height(400)
        .dimension(neo_distance)
        .group(neo_distance_group)
        .renderLabel(false)
        .ordinalColors(['red' , 'blue'])
        .legend(dc.legend().x(95).y(330).itemWidth(60).gap(5).horizontal(true))
        .transitionDuration(500);
}

////////////////////////////////
//Estimated diameter function// 
//////////////////////////////

function neo_estimated_diameter(data) {
    
    var neo_size = data.dimension(function(d) {
        if (d.estimated_diameter_max > 2) {
            return "> 2km";
        }
        else if (d.estimated_diameter_max <1) {
            return "1km <";
        }
        else {
            return "> 1km";
        }
    });

    var neo_size_group = neo_size.group();

    dc.pieChart("#neo_diameter")
        .radius(100)
        .innerRadius(40)
        .height(400)
        .dimension(neo_size)
        .group(neo_size_group)
        .ordinalColors(['#b1d6de','#a1c3f0','#a1b5f0'])
        .renderLabel(false)
        .legend(dc.legend().x(75).y(330).itemWidth(60).gap(5).horizontal(true))
        .transitionDuration(500);
    
}

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



////////////////////////////
//NEO data table function// 
//////////////////////////

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

/*function show_rank_distribution(ndx) {

    function rankByGender(dimension, rank) {
        return dimension.group().reduce(
            function (p, v) {
                p.total++;
                if (v.rank === rank) {
                    p.match++;
                };
                return p;
            },
            function (p, v) {
                p.total--;
                if (v.rank === rank) {
                    p.match--;
                };
                return p;
            },
            function () {
                return { total: 0, match: 0 }
            }
        );
    };

    var dim = ndx.dimension(dc.pluck("sex"));
    var profByGender = rankByGender(dim, "Prof");
    var asstProfByGender = rankByGender(dim, "AsstProf");
    var assocProfByGender = rankByGender(dim, "AssocProf");
    
    dc.barChart("#rank-distribution")
        .width(350)
        .height(250)
        .dimension(dim)
        .group(profByGender, "Prof")
        .stack(asstProfByGender, "AsstProf")
        .stack(assocProfByGender, "AssocProf")
        .valueAccessor(function (d) {
            if(d.value.total > 0) {
                return (d.value.match / d.value.total) * 100
            } else {
                return 0;
            }
            return d.value.percent * 100;
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Gender")
        .legend(dc.legend().x(270).y(170).itemHeight(15).gap(5))
        .margins({top: 10, right: 100, bottom: 30, left: 30});
}*/



/*



   

    ////////////////////////////////////////////////
    var approach_date_dim = ndx.dimension(dc.pluck('close_approach_date'));

    var hazard = approach_date_dim.group().reduceSum(function(d) {

        return d.miss_distance_km;
    });


    dc.barChart("#bar-chart")
        .width(1000)
        .height(500)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(approach_date_dim)
        .group(hazard)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("close approach date")
        .yAxis().ticks(4);

    var miss_distance_dim = ndx.dimension(dc.pluck('miss_distance_km'));
    var diameter = miss_distance_dim.group().reduceSum(dc.pluck('estimated_diameter_max'));

    dc.barChart("#bye-chart")
        .width(1000)
        .height(500)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(miss_distance_dim)
        .group(diameter)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("name")
        .yAxis().ticks(10);


    var dia_dim = ndx.dimension(dc.pluck('miss_distance_km'));




    var velocity_dim = ndx.dimension(dc.pluck('relative_velocity_kmps'));
    var large_diameter = velocity_dim.group().reduceSum(function(d) {
        if (d.estimated_diameter_max > 0.5) {
            return d.miss_distance_km;
        }
        else {
            return 0;
        }
    });

    dc.barChart("#sigh-chart")
        .width(1000)
        .height(500)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(approach_date_dim)
        .group(large_diameter)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("name")
        .yAxis().ticks(20);*/

    ////////////////////////////////////////