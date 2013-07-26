<script src="http://d3js.org/d3.v3.min.js"></script>
<script src="http://d3js.org/topojson.v1.min.js"></script>
<link rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css" />
<script src="http://code.jquery.com/jquery-1.9.1.js"></script>
<script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
<script type="text/javascript">

var return_value = 0;

var outputBinding = new Shiny.OutputBinding();
$.extend(outputBinding, {
  find: function(scope) {
    return $(scope).find('.d3map');
  },
  renderValue: function(el, data) {  
    do_stuff(el, data);
  }});
Shiny.outputBindings.register(outputBinding);

var inputBinding = new Shiny.InputBinding();
$.extend(inputBinding, {
  find: function(scope) {
    return $(scope).find('.d3map');
  },
  getValue: function(el) {
    return return_value;
  },
  subscribe: function(el, callback) {
    $(el).on("change.inputBinding", function(e) {
      callback();
    });
  },
});
Shiny.inputBindings.register(inputBinding);


function do_stuff(el, data) {
    //controls
    var metric = [{"var_name":"CCE", "disp_name": "Community Attachment"},
                  {"var_name":"PASSION", "disp_name": "Passion"},
                  {"var_name":"LEADERSH", "disp_name": "Leadership"},
                  {"var_name":"AESTHETI", "disp_name": "Aesthetics"},
                  {"var_name":"ECONOMY", "disp_name": "Economy"},
                  {"var_name":"SOCIAL_O", "disp_name": "Social Offerings"},
                  {"var_name":"COMMUNIT", "disp_name": "Community"},
                  {"var_name":"INVOLVEM", "disp_name": "Involvement"},
                  {"var_name":"OPENNESS", "disp_name": "Openness"},
                  {"var_name":"SOCIAL_C", "disp_name": "Social Capital"}]
    
    $('<div id="buttons"></div>').insertBefore('#d3io');
    
    var mx_button = d3.select('#buttons').selectAll('div')
        .data(metric).enter()
        .append("div")
        .attr("class", "mx-button")
        
    mx_button.append("input")
            .attr("type", "radio")
            .attr("name", "mx")
            .attr("id", function(d, i) { return "button" + i; })
            .on("click", function(d) { click_metric(d); });

    mx_button.append("label")
            .attr("for", function(d, i){ return "button" + i; })
            .text(function(d){ return d.disp_name; })
            .attr("unselectable", "");
    
    mx_button.filter(function(d,i) { return(i == 0); }).selectAll("input")
        .attr("checked","");
    
    
    //slider 
    $('.jslider-pointer').mouseleave(function(){ setTimeout(function() { update_map(); update_graphs();}, 1000); });
    $('#aggregate').mouseup(function(){ setTimeout(function(){update_map(); update_graphs(); }, 1000); });
    
    //map
    var width = $(d3io).width(),
            height = width*0.520833,
            root, root_2008, root_2009, root_2010, subset, corr_dat,
            title_qsb, graphs_qsb,
            scale_resp, scale_color,
            year_select, circ_selected,
            comms, comms_select,
            g, g_1, g_2, g_3,
            svg_1, svg_2, svg_3,
            metric_select = metric[0].var_name,
            year_select = 2008;   
        
    var projection = d3.geo.albersUsa()
        .scale(1.07858243*width)
        .translate([width / 2, height / 2]);
    
    var path = d3.geo.path()
        .projection(projection);
    
    var svg = d3.select(el).append("svg")
        .attr("tabindex", 1)
        .attr("width", width)
        .attr("height", height);
    
    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
    
    g = svg.append("g");
        
    d3.json("data/us_states_5m.json", function(error, us) {
        g.append("g")
          .attr("id", "states")
        .selectAll("path")
          .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
          .attr("d", path);
        
        g.append("path")
          .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
          .attr("id", "state-borders")
          .attr("d", path);
          
        if(data) {        
            root = JSON.parse(data.data_json);
            root_2008 = JSON.parse(data.data_json_2008);
            root_2009 = JSON.parse(data.data_json_2009);
            root_2010 = JSON.parse(data.data_json_2010);
            corr_dat = JSON.parse(data.data_json_corr);
                         
            update_map();
        }       
    });
    
    //add spots for extra graphs
    title_qsb = d3.select('.span4').append('div')
        .attr("width", $('.span4').width())
        .attr("height", 30)
        .attr("class", "title_qsb");
    
    graphs_qsb = d3.select('.container-fluid').append('div')
        .attr("width", $('.container-fluid').width())
        .attr("height", $('.container-fluid').width()/3 + 60)
        .attr("class", "graphs_qsb");
      
    svg_1 = graphs_qsb.append("svg")
        .attr("width", $('.container-fluid').width()/3)
        .attr("height", $('.container-fluid').width()/3 + 60);
    
    g_1 = svg_1.append("g");
    
    svg_2 = graphs_qsb.append("svg")
        .attr("width", $('.container-fluid').width()/3)
        .attr("height", $('.container-fluid').width()/3 + 60);
    
    g_2 = svg_2.append("g");
    
    svg_3 = graphs_qsb.append("svg")
        .attr("width", $('.container-fluid').width()/3)
        .attr("height", $('.container-fluid').width()/3 + 60);
    
    g_3 = svg_3.append("g");
    
    function click_metric(d) {
        metric_select = d.var_name;            
        update_map();
        update_graphs();
    }
    
    function update_map() {
        if(root) {
            if($('#aggregate').is(':checked')) {
                subset = root;
            } else {
                year_select = $('#year').val();
                subset = eval("root_" + year_select);
            }
            
            scale_resp = d3.scale.linear()
                    .domain(d3.extent(subset, function(d){return d.TOTALRESP}))
                    .range([4,16])
            
            scale_color = d3.scale.linear()
                        .domain(d3.extent(subset, function(e){return e[metric_select]}))
                        .range(['red', 'green']);
            
            comms = g.selectAll('circle.community').data(subset);   
            
            comms.enter()
                .append('circle')
                .attr("class", "community")
                .attr("transform", function(d) { 
                    return "translate(" + projection([d.lons, d.lats]) + ")"; 
                })
                .on("click", clicked)
                .append("title")
                .text(function(d){ return(d.QSB); }); 
            
            
            comms.transition().duration(750)
                .style('fill', function(e){ return(scale_color(e[metric_select])); })
                .attr('r', function(e){ return(scale_resp(e.TOTALRESP)); });
            
			comms.exit().remove(); 
            circ_selected = d3.selectAll("circle.selected").data()[0];
            if(circ_selected) {
                comms_select.transition().duration(750) 
                  .attr('r', scale_resp(circ_selected.TOTALRESP));
            }
        }        
    }    
    
    function clicked(d) {         
        comms.classed("selected", false);
        comms.classed("selected", function(e) {return e.QSB == d.QSB; });
        
        title_qsb.selectAll("h2").remove();
        title_qsb.append("h2").text(d.QSB);

        g.selectAll("circle.select").remove();
        
        comms_select = g.append("circle")
            .attr("class", "select")
            .attr("transform", "translate(" + projection([d.lons, d.lats]) + ")")
            .attr("r", scale_resp(d.TOTALRESP)*4)
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-opacity", 1e-6)
            .style("stroke-width", 3)
            
        comms_select.transition()
            .duration(750)
            .attr("r", scale_resp(d.TOTALRESP))
            .style("stroke-opacity", 1);
            
        circ_selected = d3.selectAll("circle.selected").data()[0];
        update_graphs(); 
        update_table();
    }
    
    function update_graphs() {
        if(circ_selected) {
            
            //graph 1
            var margin_1 = {top: 20, right: 20, bottom: 130, left: 40},
            g_width_1 =  $('.container-fluid').width()/3 - margin_1.left - margin_1.right,
            g_height_1 = $('.container-fluid').width()/3 + 60 - margin_1.top - margin_1.bottom;
            
            var x_1 = d3.scale.ordinal()
                .rangeRoundBands([0, g_width_1], .1, .5);
            
            var y_1 = d3.scale.linear()
                .range([g_height_1, 0]);
            
            var xAxis_1 = d3.svg.axis()
                .scale(x_1)
                .orient("bottom");
            
            var yAxis_1 = d3.svg.axis()
                .scale(y_1)
                .orient("left");
                
            var dataset_1 = [{ "x": circ_selected.QSB, "y": subset.filter(function(e){return e.QSB == circ_selected.QSB})[0][metric_select]},       
                { "x": circ_selected.URBAN_GR, "y": d3.mean(subset.filter(function(e){return e.URBAN_GR == circ_selected.URBAN_GR}), function(k) {return k[metric_select]})},
                { "x": circ_selected.Region, "y": d3.mean(subset.filter(function(e){return e.Region == circ_selected.Region}), function(k) {return k[metric_select]})},
                { "x": "All Cities", "y": d3.mean(subset, function(k) {return k[metric_select]})}]
                
            g_1.attr("transform", "translate(" + margin_1.left + "," + margin_1.top + ")");          
            x_1.domain(dataset_1.map(function(d) { return d.x; }));
            y_1.domain([0, d3.max(dataset_1, function(d) { return d.y; })]);           
            
            g_1.selectAll(".axis").remove();
            
            g_1.append("g")
              .attr("class", "x axis g1")
              .attr("transform", "translate(0," + g_height_1 + ")")
              .call(xAxis_1);
              
            g_1.selectAll(".x.axis").selectAll("text")
                .style("text-anchor", "start")
                .attr("transform", function(d) {
                    return "rotate(45)" 
                });
      
            g_1.append("g")
              .attr("class", "y axis")
              .call(yAxis_1)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text(metric.filter(function(e) {return e.var_name == metric_select;})[0].disp_name);
            
            var bar = g_1.selectAll(".bar")
              .data(dataset_1);
              
            bar.enter().append("rect")
              .attr("class", "bar");
              
            bar.transition().duration(750)
                .attr("x", function(d) { return x_1(d.x); })
                .attr("width", x_1.rangeBand())
                .attr("y", function(d) { return y_1(d.y); })              
                .attr("height", function(d) { return g_height_1 - y_1(d.y); });
            
    		bar.exit().remove(); 
    		
    		
    		//graph 2
            var margin_2 = {top: 20, right: 20, bottom: 130, left: 100},
            g_width_2 =  $('.container-fluid').width()/3 - margin_2.left - margin_2.right,
            g_height_2 = $('.container-fluid').width()/3 + 60 - margin_2.top - margin_2.bottom;
            
            var x_2 = d3.scale.linear()
				.range([0, g_width_2]);
            
            var y_2 = d3.scale.ordinal()
                .rangePoints([g_height_2, 0], .5);
            
            var xAxis_2 = d3.svg.axis()
                .scale(x_2)
                .orient("bottom");
            
            var yAxis_2 = d3.svg.axis()
                .scale(y_2)
                .orient("left");
                
            var dataset_2 = subset.slice(0)
            dataset_2.sort(function(a, b){return a[metric_select] - b[metric_select]; });
                
            g_2.attr("transform", "translate(" + margin_2.left + "," + margin_2.top + ")");          
            x_2.domain([d3.min(dataset_2, function(d){return d[metric_select];}) - .5, d3.max(dataset_2, function(d){return d[metric_select];}) + .5]);
            y_2.domain(dataset_2.map(function(d) { return d.QSB; }));           
            
            g_2.selectAll(".axis").remove();
            
            g_2.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + g_height_2 + ")")
              .call(xAxis_2)
            .append("text")
                .attr("transform", "translate(" + (g_width_2 / 2) + " , " + 2*margin_2.bottom/3 + ")")
                .style("text-anchor", "middle")
                .text(metric.filter(function(e) {return e.var_name == metric_select;})[0].disp_name);
            
            g_2.append("g")
              .attr("class", "y axis")
              .call(yAxis_2);            
            
            var dot = g_2.selectAll("circle.dot")
              .data(dataset_2);
              
            dot.enter().append("circle")
              .attr("class", "dot")
              .attr("r", 2)
              .attr("fill", "grey");
              
            dot.transition().duration(750)
                .attr("cx", function(d) { return x_2(d[metric_select]); })
                .attr("cy", function(d) { return y_2(d.QSB); });
            
    		dot.exit().remove();
            
            
            //graph 3
            var margin_3 = {top: 20, right: 20, bottom: 130, left: 40},
            g_width_3 =  $('.container-fluid').width()/3 - margin_3.left - margin_3.right,
            g_height_3 = $('.container-fluid').width()/3 + 60 - margin_3.top - margin_3.bottom;
            
            var x_3 = d3.scale.ordinal()
    			.rangePoints([0, g_width_3], 1);
            
            var y_3 = d3.scale.linear()
                .range([g_height_3, 0]);
            
            var xAxis_3 = d3.svg.axis()
                .scale(x_3)
                .orient("bottom");
            
            var yAxis_3 = d3.svg.axis()
                .scale(y_3)
                .orient("left");

            var year_val = $('#aggregate').is(':checked') ? "Aggregate" : year_select;
            var dataset_3 = corr_dat.filter(function(e) {return (e.Year == year_val) && (e.City == circ_selected.QSB); });
            
            //update with interactivity from bar chart click.
            var loc_var = "City";
            
            var dataset_3_array = [];
            metric.forEach(function(d){
                if (d.var_name != "CCE") {
                    dataset_3_array.push({"x": d.disp_name, "y": dataset_3[0][d.var_name]});
                }
            });
            
            g_3.attr("transform", "translate(" + margin_3.left + "," + margin_3.top + ")");          
            
            
            x_3.domain(dataset_3_array.map(function(d){ return d.x; }));
            y_3.domain([-1, 1]);

            g_3.selectAll(".axis").remove();
            
            g_3.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + g_height_3 + ")")
              .call(xAxis_3)
            .append("text")
                .attr("transform", "translate(" + (g_width_3 / 2) + " , " + 2*margin_3.bottom/3 + ")")
                .style("text-anchor", "middle")
                .text(dataset_3[0][loc_var] + " - " + year_val);
            
            g_3.selectAll(".tick.major").selectAll("text")
                .style("text-anchor", "start")
                .attr("transform", function(d) {
                    return "rotate(45)" 
                });
            
            g_3.append("g")
              .attr("class", "y axis")
              .call(yAxis_3)
             .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Correlation to Community Attachment");

            
            var dot_3 = g_3.selectAll("circle.dot")
              .data(dataset_3_array);
            
            var color_scale = d3.scale.category10();
            
            dot_3.enter().append("circle")
              .attr("class", "dot")
              .attr("r", 6)
              .attr("fill", function(d,i){ return color_scale(i); })
              .append("title")
                .text(function(d){ return(d.x); }); 
              
            dot_3.transition().duration(750)
                .attr("cx", function(d) { return x_3(d.x); })
                .attr("cy", function(d) { return y_3(d.y); });
            
    		dot_3.exit().remove();

            
        }
    }
    
    function update_table() {
        if(circ_selected) {
            
            
            title_qsb.selectAll("table").remove();
            var table = title_qsb.append("table"),
                thead = table.append("thead"),
                tbody = table.append("tbody");
            
            var columns = ["Region", "Urbanicity", "Incorporated", "Population", "Unemployment"];
            
            var dataset = root.filter(function(e){ return e.QSB == circ_selected.QSB; })
            var dataset_array = [];
            
            columns.forEach(function(d){
                    dataset_array.push({"x": d, "y": dataset[0][d]});
            }); 
            var cols = ["x", "y"];
            
            // create a row for each object in the data
            var rows = tbody.selectAll("tr")
                .data(dataset_array)
                .enter()
                .append("tr");
    
            // create a cell in each row for each column
            var cells = rows.selectAll("td")
                .data(function(row) {
                    return cols.map(function(column) {
                        return {column: column, value: row[column]};
                    });
                })
                .enter()
                .append("td")
                    .text(function(d) { return d.value; })
                    .attr("class", function(d) { return d.column; });
        }
    }
    
}




</script>
