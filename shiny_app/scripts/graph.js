<style type="text/css"> 

.background {
  fill: none;
  pointer-events: all;
}

#states {
  fill: #aaa;
}

#states .active {
  fill: orange;
}

#state-borders {
  fill: none;
  stroke: #fff;
  stroke-width: 1.5px;
  stroke-linejoin: round;
  stroke-linecap: round;
  pointer-events: none;
}

circle {
    cursor:pointer    
}
</style>
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
    
    var metric = [{"var_name":"THRIVEIND", "disp_name": "Thrive Index"},
                  {"var_name":"TEST", "disp_name": "Test Metric"}]
    
    $('<div id="buttons"></div>').insertBefore('.checkbox');
    $('<br /><br />').insertBefore('.checkbox');
    var mx_button = d3.select('#buttons').selectAll('div')
        .data(metric).enter()
        .append("div")
        .attr("class", "mx-button")
        
    mx_button.append("input")
            .attr("type", "radio")
            .attr("name", "mx")
            .attr("id", function(d, i) { return "button" + i; })

    mx_button.append("label")
            .attr("for", function(d, i){ return "button" + i; })
            .text(function(d){ return d.disp_name; })
            .attr("unselectable", "")
    
    mx_button.filter(function(d,i) { return(i == 0); }).selectAll("input")
        .attr("checked","")
    
    var width = $(d3io).width(),
            height = width*0.520833,
            title_qsb,
            graphs_qsb,
            scale_resp,
            scale_color;   
        
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
    
    var g = svg.append("g");
        
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
        var root = JSON.parse(data.data_json);
        
        scale_resp = d3.scale.linear()
            .domain(d3.extent(root, function(d){return d.TOTALRESP}))
            .range([4,16])
            
        scale_color = d3.scale.linear()
            .domain(d3.extent(root, function(d){return d.THRIVEIND}))
            .range(['red', 'green']);
        
        var comms = g.selectAll('circle')
            .data(root)
            .enter()
            .append('circle')
            .attr("transform", function(d) { 
                return "translate(" + projection([d.lons, d.lats]) + ")"; 
            })
            .attr('r', function(d){ return(scale_resp(d.TOTALRESP)); })
            .style('fill', function(d){ return(scale_color(d.THRIVEIND)); })
            .on("click", clicked)
            .append("title")
                .text(function(d){ return(d.QSB); });
            
    }
    
        title_qsb = d3.select('.span4').append('div')
            .attr("width", $('.span4').width())
            .attr("height", 30)
            .attr("class", "title_qsb")
        
        graphs_qsb = d3.select('.container-fluid').append('div')
            .attr("width", width)
            .attr("height", width/3)
            .attr("class", "graphs_qsb")
          
    
    });
    
    
    
    
    function clicked(d) {        
        title_qsb.selectAll("h2").remove();
        title_qsb.append("h2").text(d.QSB);
        console.log(d);
        g.selectAll("circle.select").remove();
        
        g.append("circle")
            .attr("class", "select")
            .attr("transform", "translate(" + projection([d.lons, d.lats]) + ")")
            .attr("r", scale_resp(d.TOTALRESP)*4)
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-opacity", 1e-6)
            .style("stroke-width", 3)
            .transition()
            .duration(750)
            .attr("r", scale_resp(d.TOTALRESP))
            .style("stroke-opacity", 1);
        
    }
    
}




</script>