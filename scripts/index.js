 var keys;
 var count_data;
 var parseDate = d3.timeParse("%Y-%m-%d %H");  
var FinalData;
var refData;
var sentimentData;
var selected_arc = undefined;
var selected_index = -1;
var start_time_range = parseDate("2020-04-06 00");
var end_time_range = parseDate("2020-04-10 23");
var location_line_chart = "Broadway"

 document.addEventListener('DOMContentLoaded', function() {
	 
	scatter_plot = d3.select("#scatter_plot");
	Promise.all([d3.csv('./Data/new_YInt_with_GroupBy_counts.csv').then(data=> {data.forEach(function(d) {
	d.sewer_and_water = +d.sewer_and_water;
	d.power_energy = +d.power_energy;
	d.roads_and_bridges = +d.roads_and_bridges;
	d.medical = +d.medical;
	d.buildings = +d.buildings;
	return d;
	
    });
	return data;}),d3.csv('./Data/new_YInt_deleted_adv_accounts.csv').then(data=>data),d3.csv('./Data/new_YInt_sentiments.csv').then(data=>data)
	
	])
          .then(function(values){
    //console.log(values);
    FinalData = values[0];
	refData=values[1];
	sentimentData = values[2];
	  })
  .catch(function(err) {
  console.log(err.message); // some coding error in handling happened
});

	setTimeout(function(){bar_graph(); drawDonutPiePlot(parseDate("2020-04-06 00"),parseDate("2020-04-10 23")); draw_wordcloud(parseDate("2020-04-06 00"),parseDate("2020-04-06 12"));draw_map(parseDate("2020-04-06 00"),parseDate("2020-04-10 23"));bar_chart(parseDate("2020-04-06 00"),parseDate("2020-04-10 23"))},1000);
  document.getElementById("navtime").innerHTML = "2020-4-6 00:00:00 to 2020-4-10 11:00:00"
  document.getElementById("line_chart").style.display = "block";
  document.getElementById("line_chart").style.visibility = "hidden";
  document.getElementById("line-chart-button").onclick = function(){d3.select("#line_chart").select("svg").remove();document.getElementById("line_chart").style.visibility = "visible";line_chart(start_time_range,end_time_range,location_line_chart)};
  document.getElementById("selectButton").addEventListener("change", function(d) {
  bar_chart(start_time_range,end_time_range)
})
});

function bar_graph(){

  barMargin = {top: 60, right: 30, bottom: 20, left: 60};
  barMaxWidth = 700;
  barMaxHeight = 450;
  barWidth = barMaxWidth - barMargin.left - barMargin.right;
  barHeight = barMaxHeight - barMargin.top - barMargin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#scatter_plot")
      .append("svg")
      .attr("width", barMaxWidth)
      .attr("height", barMaxHeight + 2* barMargin.top)
      .append("g")
      .attr("transform", "translate(" + 0 + "," + 0+ ")");
		  
  d3.csv('Data/count_resources.csv').then( function(data) {
  data.forEach(function(d) {    
      d.new_time=parseDate(d.new_time);
      d.Earthquake = +d.Earthquake;
      d.sewer_and_water = +d.sewer_and_water;
      d.power_energy = +d.power_energy;
      d.roads_and_bridges = +d.roads_and_bridges;
      d.medical = +d.medical;
      d.buildings = +d.buildings;
      return d;
  });
		  
  keys=data.columns.slice(1);

  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeSet3);

  var stackedData = d3.stack()
    .keys(keys)
    (data)
  // console.log(stackedData);

  // Add X axis
  var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.new_time; }))
    .range([ 0, barWidth ]);
  var xAxis = svg.append("g")
    .attr("transform", "translate(" + barMargin.left + "," + (barHeight + barMargin.top)+ ")")
    .call(d3.axisBottom(x).ticks(5))

  // Add X axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", barWidth/2 + barMargin.left)
      .attr("y", barHeight+barMargin.top*1.75)
      .text("Time");

  svg.append("text")
      .attr("text-anchor", "end")
      .classed("headline",true)
      .attr("x", barMaxWidth/2 + 2*barMargin.left)
      .attr("y", barMargin.top)
      .text("Events Overview");  

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 1200])
    .range([ barHeight+barMargin.top, barMargin.top]);
  svg.append("g")
	  .attr("transform", "translate(" + barMargin.left + ","+0+")")
    .call(d3.axisLeft(y).ticks(5))
  var clip = svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", barWidth)
      .attr("height", barHeight + barMargin.top )
      .attr("x", 1)
      .attr("y", 0);

  // Add brushing
  var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
      .extent( [ [0,barMargin.top], [barWidth,barHeight+barMargin.top] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function
  
  
  var areaChart = svg.append('g')
      .attr("transform", "translate(" + barMargin.left + ","+0+")")
      .attr("clip-path", "url(#clip)")
	
  var area = d3.area()
    .x(function(d) { return x(d.data.new_time); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); })

  // console.log(stackedData)
  // Show the areas
  areaChart
    .selectAll("mylayers")
    .data(stackedData)
    .enter()
	    .append("path")
	    .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("class", function(d) { return "myArea " + d.key })
      .style("fill", function(d) { return color(d.key); })
      .attr("d", area)

  // Add the brushing
  areaChart
      .append("g")
      .attr("class", "brush")
      .call(brush);

  var idleTimeout
  function idled() { idleTimeout = null; }

  // A function that update the chart for given boundaries
  function updateChart() {

        extent = d3.event.selection

          // If no selection, back to initial coordinate. Otherwise, update X axis domain
          if(!extent){
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            values = d3.extent(data, function(d) { return d.new_time; })
            console.log(values)
            x.domain(values)
            
            start = values[0]
            end = values[1]
            
            start_time=start.getFullYear()+"-"+(start.getMonth()+1)+"-"+start.getDate()+" "+(start.getHours())+":00:00"
            end_time=end.getFullYear()+"-"+(end.getMonth()+1)+"-"+end.getDate()+" "+end.getHours()+":00:00"
            
            document.getElementById("navtime").innerHTML = String(start_time)+" to "+String(end_time);
            setTimeout(function(){ drawDonutPiePlot(parseDate("2020-04-06 00"),parseDate("2020-04-10 23")); draw_wordcloud(parseDate("2020-04-06 00"),parseDate("2020-04-06 12"));draw_map(parseDate("2020-04-06 00"),parseDate("2020-04-10 23"));bar_chart(parseDate("2020-04-06 00"),parseDate("2020-04-10 23"))},1000);
  

          }else{
          //x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
          
          start = x.invert(extent[0])
          end = x.invert(extent[1])
          
          if(diff_hours(start,end)==0){
            start.setHours( start.getHours() -3 );
          }
          else if(diff_hours(start,end)<=3){
            start.setHours( start.getHours() -(3%diff_hours(start,end)) );
          }
          x.domain([ start, end])
          console.log(start,end);
          start_time=start.getFullYear()+"-"+(start.getMonth()+1)+"-"+start.getDate()+" "+(start.getHours())+":00:00"
          end_time=end.getFullYear()+"-"+(end.getMonth()+1)+"-"+end.getDate()+" "+end.getHours()+":00:00"
          console.log(start_time,end_time);
          document.getElementById("navtime").innerHTML = String(start_time)+" to "+String(end_time);
          start_time_range=x.invert(extent[0]);
          end_time_range=x.invert(extent[1]);
          drawDonutPiePlot(x.invert(extent[0]),x.invert(extent[1]));
          draw_wordcloud(x.invert(extent[0]),x.invert(extent[1]));
          draw_map(x.invert(extent[0]),x.invert(extent[1]));
		      bar_chart(x.invert(extent[0]),x.invert(extent[1]));
          areaChart.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done

          }

        // Update axis and area position
        xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(5))
        areaChart
          .selectAll("path")
          .transition().duration(1000)
          .attr("d", area)
    }

    var highlight = function(d){
      d3.selectAll(".myArea").style("opacity", .1)
      d3.select("."+d).style("opacity", 1)
    }

    // And when it is not hovered anymore
    var noHighlight = function(d){
      d3.selectAll(".myArea").style("opacity", 1)
    }

    var size = 10
    svg.selectAll("myrect")
      .data(keys)
      .enter()
      .append("rect")
        .attr("x", barWidth - barMargin.left)
        .attr("y", function(d,i){ return barMargin.top + i*(size+5)}) 
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    svg.selectAll("mylabels")
      .data(keys)
      .enter()
      .append("text")
        .attr("x", barWidth - barMargin.left + size*1.2)
        .attr("y", function(d,i){ return barMargin.top + i*(size+5) + (size/2)})
        .style("fill", "black")
        .text(function(d){ return d})
        .attr("text-anchor", "left")
		.style("font-size",10)
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)
		  });

}

function diff_hours(dt2, dt1){
  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= (60 * 60);
  return Math.abs(Math.round(diff));
}


function draw_wordcloud(start,end){
	
    d3.select("#word_cloud").selectAll("svg").remove();
    var cloudMargin = {top: 70, right: 40, bottom: 10, left: 40};
    cloudMaxWidth = 700;
    cloudMaxHeight = 450;
    cloudWidth = cloudMaxWidth - cloudMargin.left - cloudMargin.right,
    cloudHeight = cloudMaxHeight - cloudMargin.top - cloudMargin.bottom;
    // append the svg object to the body of the page
    var svg = d3.select("#word_cloud").append("svg")
      .attr("width", cloudWidth + cloudMargin.left + cloudMargin.right)
      .attr("height", cloudHeight + cloudMargin.top + cloudMargin.bottom)
      .append("g")
      .attr("transform", "translate(" + cloudMargin.left + "," + cloudMargin.top + ")");

    if(diff_hours(start,end)==0){
        start.setHours( start.getHours() -3 );
      }
      else if(diff_hours(start,end)<=3){
        start.setHours( start.getHours() -(3%diff_hours(start,end)) );
      }
      //console.log(start+"  "+end)
      filterData = refData.filter(d => {return (parseDate(d.new_time) > start && parseDate(d.new_time) < end && d.resource_present == 1)})
    // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
    // Wordcloud features that are different from one word to the other must be here

      var dataDict = {}

      var maxCount = 0
      var dataLength = 0
        for(var i in filterData){
          row = filterData[i];
          featureList = row["formatted_message"].split(",");
          for(var i=0;i<featureList.length;i++ ){
            if(!(featureList[i] in dataDict)){
                dataDict[featureList[i]]=1
            } 
            else{
              dataDict[featureList[i]] += 1
              if(dataDict[featureList[i]]>maxCount){
                maxCount = dataDict[featureList[i]]
              } 
            }																				
          }
        }
        var minCount = 100
        for(var i in dataDict){
          if(dataDict[i]<minCount){
              minCount = dataDict[i]
            } 
        }
      //console.log(dataDict)

      var WordcloudScale = d3.scaleLinear().domain([minCount,maxCount]).range([12,56])
      var listDatadict = []
      for(var i in dataDict){
        //console.log(i)
        listDatadict.push({text:i,size:WordcloudScale(dataDict[i])})
      }

      const wordScale = d3.scaleLinear()
            .domain([0,75])
            .range([10,120])
      var layout = d3.layout.cloud()
        .size([cloudWidth, cloudHeight])
        .words(listDatadict)
        .spiral("archimedean")        //space between words
        .rotate(0)       // rotation angle in degrees
        .fontSize(d=> d.size)      // font size of words
        .on("end", draw);
      layout.start();

      // This function takes the output of 'layout' above and draw the words
      // Wordcloud features that are THE SAME from one word to the other can be here
      function draw(words) {
        svg
          .append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
          .selectAll("text")
          .data(words)
          .enter()
          .append("text")
          .style("font-size", function(d) {return d.size + "px"; })
          .style("fill", "#69b3a2")
          .attr("text-anchor", "middle")
          .style("font-family", "Impact")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; });
      }

      svg.append("text")
          .attr("text-anchor", "end")
          .classed("headline",true)
          .attr("x", cloudMaxWidth/2 + 2*cloudMargin.left)
          .attr("y", -cloudMargin.top/3)
          .text("Word Frequency Cloud"); 

}

function drawDonutPiePlot(start,end) {

      d3.select("#pie_donut_chart").selectAll("svg").remove();
      if(diff_hours(start,end)==0){
        start.setHours( start.getHours() -3 );
      }
      else if(diff_hours(start,end)<=3){
        start.setHours( start.getHours() -(3%diff_hours(start,end)) );
      }
      var pieMargin = {top: 60, right: 40, bottom: 40, left: 80};
      pieMaxWidth = 700;
      pieMaxHeight = 450;
      pieWidth = pieMaxWidth - pieMargin.left - pieMargin.right,
      pieHeight = pieMaxHeight - pieMargin.top - pieMargin.bottom;
      // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
      var radius = pieMaxHeight / 2 - 40

      // append the svg object to the div called 'my_dataviz'
      var svg = d3.select("#pie_donut_chart")
          .append("svg")
          .attr("width", pieMaxWidth)
          .attr("height", pieMaxHeight+radius)
          .append("g")
          .attr("transform", "translate(" + (pieMargin.left+radius) + "," + (pieMargin.top+radius) + ")");

      // Create dummy data
      FilterFinalData = FinalData.filter(data=>{ return parseDate(data.new_time) > start && parseDate(data.new_time) < end})
      //console.log(FilterFinalData);
      var data = {}
      var dataLength = 0
      for(var i in FilterFinalData){
          temp = {}
          row = FilterFinalData[i];
          if(row["location"]!="<Location with-held due to contract>" && row["location"]!="UNKNOWN"&&row["location"]!=undefined){
          if(!(row["location"] in data)){
            //console.log(row["location"])
            dataLength+=1
            data[row["location"]] = row["sewer_and_water"]+row["power_energy"]+row["roads_and_bridges"]+row["medical"]+row["buildings"];
            length += 1;
          } 
          else{
            data[row["location"]] += row["sewer_and_water"]+row["power_energy"]+row["roads_and_bridges"]+row["medical"]+row["buildings"];
          }}                                       
      }


    //console.log(dataLength)	
    // set the color scale
    var color = d3.scaleOrdinal()
      .domain(data)
      .range(["#1f77b4", "#aec7e8",
      "#ff7f0e", "#ffbb78",
      "#2ca02c", "#98df8a",
      "#d62728", "#ff9896",
      "#9467bd", "#c5b0d5",
      "#8c564b", "#c49c94",
      "#e377c2", "#f7b6d2",
      "#7f7f7f", "#c7c7c7",
      "#bcbd22", "#dbdb8d",
      "#17becf", "#9edae5"])

    // Compute the position of each group on the pie:
    var pie = d3.pie()
      .value(function(d) {return d.value; })
    var data_ready = pie(d3.entries(data))

    var tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "3px")
        .style("opacity", "0");

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
      .selectAll('whatever')
      .data(data_ready)
      .enter()
      .append('path')
      .attr('d', d3.arc()
        .innerRadius(130)         // This is the size of the donut hole
        .outerRadius(radius)
      )
      .attr('fill', function(d){ return(color(d.data.key)) })
      .attr("stroke", "black")
      .style("stroke-width", "2px")
      .style("opacity", 0.7)
      .on('mouseover', function(d,i) {
          d3.select(this).style('stroke','cyan').style('stroke-width','4');
          tooltip.transition()
              .style("opacity", 1).style("z-index","1");
          console.log(data)
          console.log(d)
          let val = "Location:"+String(d.data.key)+"<br><span>Total Messages related to resources : "+String(data[d.data.key])+"</span>";
          tooltip.html(val)
              .style("font-size", "14px")
              .style("stroke","black")
              .style("left", (d3.event.pageX + 50) + "px")
              .style("top", (d3.event.pageY - 15) + "px")
              ;
        })
      .on('mousemove',function(d,i) {
          console.log("mousemove");
        })
      .on('mouseout', function(d,i) {
          d3.select(this).style('stroke','black').style('stroke-width','1');
          tooltip.transition()
              .style('opacity', '0').style("z-index","-1");
        })
      .on('click', function(d,i) {
          if(selected_arc!=undefined){
            svg.selectAll('.pie-chart-legend').remove();
            if(selected_index==i){
              pathAnim(d3.select(this), 0,radius);
              svg.selectAll('.arc1').remove();
              selected_index = -1
              selected_arc = undefined
            }
            else{
              pathAnim(selected_arc, 0,radius);
              selected_arc = d3.select(this);
              pathAnim(d3.select(this), 1,radius);
              drawPieChart(d.data.key,svg,radius,start,end);
              selected_index = i;
            }
            
          }
          else{
            selected_arc = d3.select(this);
              pathAnim(d3.select(this), 1,radius);
              console.log(d);
              drawPieChart(d.data.key,svg,radius,start,end);
              selected_index = i;
          }    
      });
      const l = svg.append('g')
              .attr('transform', `translate(${radius+30},${-radius})`);

      //console.log(Object.keys(data));
      const xl = d3.scaleBand()
            .range([0, 2*radius])
            .padding(0.3)
            .domain(color.domain());

      const legend = l.selectAll('.chart-legend')
              .data(color.domain())
              .enter()
              .append('g')
              .attr('class', 'chart-legend')
              .attr('transform', (d, i) => `translate(${10},${xl(d)})`);

      legend.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .style('fill', color).style("opacity","0.9").style("stroke","black")
      ;
      
      legend.append('text')
        .attr('x', 20)
        .attr('y', 10)
        .text(d => d)
      ;

      svg.append("text")
          .attr("text-anchor", "end")
          .classed("headline",true)
          .attr("x", radius+radius/2 )
          .attr("y", -radius-20)
          .text("Location Wise Resource Allocation"); 
			
}

var pathAnim = function(path, dir,radius) {
			
    switch(dir) {
        case 0:
            path.transition()
                .duration(500)
                .attr('d', d3.arc()
                              .innerRadius((130))
                              .outerRadius(radius)
                );
            break;

        case 1:
            path.transition()
                .attr('d', d3.arc()
                              .innerRadius((130))
                              .outerRadius((radius+20))
                );
            break;
    }
}            

function drawPieChart(loc,svg,radius,start,end){
      console.log(loc);
      svg.selectAll('arc1').remove();
      var totalData = 0;
      var Resourcedata = [0,0,0,0,0]
      var resources = ["Sewage","Power","Bridges","Medical","Buildings"]
      LocationFinalData = FinalData.filter(data=>{ return parseDate(data.new_time) > start && parseDate(data.new_time) < end && data.location == loc})
      console.log(LocationFinalData)
      
      var dataLength = 0
      for(var i in LocationFinalData){
          
        row = LocationFinalData[i];
          dataLength+=1
          Resourcedata[0] += row["sewer_and_water"]
          Resourcedata[1]+=row["power_energy"]
          Resourcedata[2]+=row["roads_and_bridges"]
          Resourcedata[3]+=row["medical"]
          Resourcedata[4]+=row["buildings"]
          totalData=Resourcedata[0]+Resourcedata[1]+Resourcedata[2]+Resourcedata[3]+Resourcedata[4]
      }
          
      console.log(Resourcedata)																					
      var color = d3.scaleOrdinal(d3.schemeCategory10);

      var tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "3px")
        .style("opacity", "0");

      // Generate the pie
      var pie = d3.pie();

      // Generate the arcs
      var arc = d3.arc()
                  .innerRadius(0)
                  .outerRadius(100);

      //Generate groups
        var arcs = svg.selectAll("arc")
                    .data(pie(Resourcedata))
                    .enter()
                    .append("g")
                    .attr("class", "arc1")
            
      //Draw arc paths
      arcs.append("path")
          .attr("fill", function(d, i) {return color(i);})
          .attr("d", arc)
          .attr("stroke", "black")
          .on('mouseover', function(d,i) {
              d3.select(this).style('stroke','cyan').style('stroke-width','4');
              tooltip.transition()
                        .style("opacity", 1).style("z-index","1");
              let val = "Location: "+loc+"<br>Resource: "+resources[i]+"<br>Value:"+Math.round(((Resourcedata[i]/totalData)*100))+"%";
              tooltip.html(val)
                  .style("font-size", "14px")
                  .style("stroke","black")
                  .style("left", (d3.event.pageX + 50) + "px")
                  .style("top", (d3.event.pageY - 15) + "px");
          })
          .on('mousemove',function(d,i) {
              console.log("mousemove");
          })
          .on('mouseout', function(d,i) {
              d3.select(this).style('stroke','black').style('stroke-width','1');
              tooltip.transition()
                        .style('opacity', '0').style("z-index","-1");
          })
        
      const l = svg.append('g')
              .attr('transform', `translate(${-radius},${radius})`);

      const xl = d3.scaleBand()
            .range([-20, 2*radius])
            .padding(0.2)
            .domain(color.domain());

      
      const legend = l.selectAll('.pie-chart-legend')
              .data(color.domain())
              .enter()
              .append('g')
              .attr('class', 'pie-chart-legend')
              .attr('transform', (d, i) => `translate(${xl(d)},${30})`);

            legend.append('circle')
              .attr('r', 5)
              .style('fill', color)
            ;
            
            legend.append('text')
              .attr('x', 8)
              .attr('y', 5).style("fontSize","10")
              .text(d => resources[d])
            ;
}




function draw_map(start,end){
      
      if(diff_hours(start,end)==0){
        start.setHours( start.getHours() -3 );
      }
      else if(diff_hours(start,end)<=3){
        start.setHours( start.getHours() -(3%diff_hours(start,end)) );
      }
      refDataFilter = refData.filter(data=>{ return parseDate(data.new_time) >= start && parseDate(data.new_time) <= end})
      
      var mapMargin = {top: 40, right: 30, bottom: 20, left: 30};
      mapMaxWidth = 700
      mapMaxHeight = 450
      mapWidth = mapMaxWidth - mapMargin.left - mapMargin.right,
      mapHeight = mapMaxHeight - mapMargin.top - mapMargin.bottom;
      //console.log("Map Called");
      d3v4.select("#maps").selectAll("svg").remove();

      active = d3v4.select(null);
      messageCount = {}
      for(var i in refDataFilter){
          row = refDataFilter[i];
          if(row["location"]!="<Location with-held due to contract>" && row["location"]!="UNKNOWN"&&row["location"]!=undefined){
          if(!(row["location"] in messageCount)){
                messageCount[row["location"]]=1
            }
            else{
                messageCount[row["location"]]+=1
            }
          }
      } 
      //console.log(messageCount)
      var minNumber = 10000
      var maxNumber = 0
      for(var i in messageCount){
        if(messageCount[i]<minNumber){
            minNumber = messageCount[i]
          }
        if(messageCount[i]>maxNumber){
            maxNumber = messageCount[i]
          } 
      }
      // console.log(minNumber,maxNumber)
      var color1 = d3.scaleSequential()
            .interpolator(d3.interpolateBlues)
            .domain([0, maxNumber])
            
      
      let selectionPanel = d3v4.select("#maps")
          .append("div")
          .attr("class", "box")
          .attr("id", "mapDiv")
          .attr("align","center");

      var zoom = d3v4.zoom()
          .scaleExtent([1, 8])
          .on("zoom", zoomed);

      let svg =  selectionPanel.append("svg")
          .attr('transform', `translate(${mapMargin.left},${mapMargin.top})`)
          .attr("width", mapMaxWidth)
          .attr("height", mapMaxHeight)
          .on("click", stopped, true)

      // svg.append("rect")
      //     .attr("class", "background")
      //     .attr("width", mapWidth/2)
      //     .attr("height", mapHeight/2)
      //     .style("z-index","-1")
      //     .on("click", reset)
		  

      let projection = d3v4.geoMercator()
          .scale(1)
          .translate([0, 0]);

      svg
        .call(zoom)
        .on("wheel.zoom",null);

      let geoGenerator = d3v4.geoPath()
          .projection(projection);
      let map;
      
      var geotooltip = d3v4.select("body").append("div")
          .style("position", "absolute")
          .style("background-color", "white")
          .style("border", "solid")
          .style("border-width", "1px")
          .style("border-radius", "5px")
          .style("padding", "3px")
          .style("opacity", "0");

      var highlight = function(d){
          //console.log("hovered")
          d3v4.select(this).style('stroke','cyan').style('stroke-width','4');
          geotooltip.transition()
                  .style("opacity", 1).style("z-index","1");
          let val = "Location: "+d.properties.Nbrhood +"<br>Message Count: "+messageCount[d.properties.Nbrhood];
          geotooltip.html(val)
              .style("font-size", "14px")
              .style("stroke","black")
              .style("left", (d3v4.event.pageX + 50) + "px")
              .style("top", (d3v4.event.pageY - 15) + "px");
      }

      // And when it is not hovered anymore
      var noHighlight = function(d){
          //console.log("no-hovered")
          d3v4.select(this).style('stroke','#444').style('stroke-width','1');
          geotooltip.transition()
                .style('opacity', '0').style("z-index","-1");
      }

      d3v4.json("./Data/StHimark.geojson", function (error, geojson) {
              if (error){console.log("Error");throw error;}
              // console.log("Bingo")
              var b = geoGenerator.bounds(geojson),
                  s = .85 / Math.max((b[1][0] - b[0][0]) / mapWidth, (b[1][1] - b[0][1]) / mapHeight),
                  t = [(mapWidth - s * (b[1][0] + b[0][0])) / 2, (mapHeight - s * (b[1][1] + b[0][1])) / 2];

              projection
                  .scale(s)
                  .translate(t);

              locationList = geojson.features.map(d => d.properties.Nbrhood);
              map = svg.selectAll("path")
                  .data(geojson.features);

              map
                  .enter().append("path")
                  .attr("d", geoGenerator)
                  .attr("id",function(d) {return "location"+d.properties.Id})
                        .attr("class", "feature")
                .attr("fill", function(d) {
                    if(messageCount[d.properties.Nbrhood]==undefined){
                      messageCount[d.properties.Nbrhood]=0
                    }
                    return color1(messageCount[d.properties.Nbrhood])
                  })
                  .on("click", clicked)
                  .style("stroke", "#444")
                  .on("mouseover", highlight)
                  .on("mouseout",noHighlight);

              map.enter()
                  .append("svg:text")
                  .attr("id",function(d) {return "text"+d.properties.Id})
                  .attr("class","text-class")
                  .text(function (d) {
                      return d.properties.Nbrhood;
                  })
                  .attr("x", function (d) {
                      return geoGenerator.centroid(d)[0];
                  })
                  .attr("y", function (d) {
                      return geoGenerator.centroid(d)[1];
                  })
                  .attr("text-anchor", "middle")
                  .attr("font-family", "sans-serif")
                  .attr("fill", "#df0000")
                  .attr("font-weight", "530")
                  .attr('font-size', '8pt');

              //add legend on the #map svg
                
                const legendWidth = 280;
                const legendHeight = 450;
                const barHeight = 20;
                legendMargin = ({top: -20, right: 40, bottom: 60, left: 60})
                const defs = svg.append("defs");
                
                axisScale = d3.scaleLinear()
                  .domain([0, maxNumber])
                  .range([legendMargin.left, legendWidth - legendMargin.right])
                
                axisBottom = g => g
                    .attr("class", `x-axis`)
                    .attr("transform", `translate(0,${legendHeight - legendMargin.bottom})`)
                    .call(d3.axisBottom(axisScale)
                    .ticks(legendWidth / 60)
                    .tickSize(-barHeight));
                
                const linearGradient = svg.append("linearGradient")
                    .attr("id", "linear-gradient");
                
              //  console.log('Akshay ' + colorScale.());
                
                linearGradient.selectAll("stop")
                  .data(color1.ticks().map((t, i, n) => ({ offset: `${100*(i)/n.length}%`, color: color1(t)})))
                  .enter().append("stop")
                  .attr("offset", d => d.offset)
                  .attr("stop-color", d => d.color);
                
                svg.append('g')
                  .attr("transform", `translate(0,${legendHeight - legendMargin.bottom - barHeight})`)
                  .append("rect")
                  .attr('transform', `translate(${legendMargin.left}, 0)`)
                  .attr("width", legendWidth - legendMargin.right - legendMargin.left)
                  .attr("height", barHeight)
                  .style("fill", "url(#linear-gradient)")
                  .style("stroke", "#444");
                
                svg.append('g')
                  .call(axisBottom);

                svg.append("text")
                  .attr("text-anchor", "end")
                  .attr("x", legendWidth/2+1.25*legendMargin.left)
                  .attr("y", legendHeight-1.5*legendMargin.bottom)
                  .text("Number of Messages");

                svg.append("text")
                  .attr("text-anchor", "end")
                  .style("font-size", "12px")
                  .attr("x", legendWidth/2-1*legendMargin.left)
                  .attr("y", legendHeight+1.8*legendMargin.top)
                  .text("Min");

                svg.append("text")
                  .attr("text-anchor", "end")
                  .style("font-size", "12px")
                  .attr("x", legendWidth/2+1.75*legendMargin.left)
                  .attr("y", legendHeight+1.8*legendMargin.top)
                  .text("Max");
      
      });

    function clicked(d) {
        document.getElementById("line_chart").style.visibility = "hidden";
        d3.select("#line_chart").select("svg").remove();
        svg.selectAll(".feature").attr("opacity","0.05")
        svg.selectAll(".text-class").attr("opacity","0")
        svg.selectAll("text").attr("opacity","0")
        svg.selectAll("g").attr("opacity","0");
        svg.select("#location"+d.properties.Id).attr("opacity","1")
        svg.select("#text"+d.properties.Id).attr("opacity","1")
        // d3v4.select(this).style('stroke','green').style('stroke-width','3');
        svg.selectAll("image").remove();
        if (active.node() === this){
            return reset();
        }
        d3.select("#line_chart").attr("opacity","1")
		
        // line_chart(start,end,d.properties.Nbrhood)
        // active.classed("active", false);
        active = d3v4.select(this).classed("active", true);
        var bounds = geoGenerator.bounds(d);
        //console.log(bounds);
            dx = bounds[1][0] - bounds[0][0];
            dy = bounds[1][1] - bounds[0][1];
            x = (bounds[0][0] + bounds[1][0]) / 2;
            y = (bounds[0][1] + bounds[1][1]) / 2;
        [[x0, y0], [x1, y1]] = geoGenerator.bounds(d);
      
        scale = Math.max(1, Math.min(2, 1 / Math.max(dx / mapWidth, dy / mapHeight)));
        translate = [mapWidth  - scale * x, mapHeight  - scale * y];
        // svg.append("circle").attr("r", "4px").attr("fill","black")
        // .attr('x', x)
        // .attr('y', y);
        sentimentDataFilter = sentimentData.filter(data=>{ return parseDate(data.new_time) >= start && parseDate(data.new_time) <= end})
        sentimentDataFilter = sentimentDataFilter.filter(data=>{ return data.location==d.properties.Nbrhood})
        console.log(sentimentDataFilter)
        labels = ["Angry","Fear","Happy","Sad","Surprise"]
        emotionsCount = {"Angry":0,"Fear":0,"Happy":0,"Sad":0,"Surprise":0}
        for(var i in sentimentDataFilter){
          row = sentimentDataFilter[i];
          //console.log(row)
          emotionsCount[row["Emotion"]]+=1;
        } 
        emotionPercentage = {}
        totalEmotions = sentimentDataFilter.length
        for(var label in labels){
            label = labels[label]
			emotionPercentage[label] = ((emotionsCount[label]/totalEmotions)*100).toFixed(2);
            emotionsCount[label] = Math.ceil(emotionsCount[label]/totalEmotions*10);
        
        }
		console.log(emotionPercentage)
        x1 = x
        y1 = y
        count=0
        console.log(emotionsCount)
        for(var label in labels){
          label = labels[label]
          for (let step = 0; step < emotionsCount[label]; step++) {
            // Runs 5 times, with values of step 0 through 4.
            svg.append("svg:image")
            .attr("href","./Images/"+label+".png")
            .attr("id",label)
            .attr("width", 10)
            .attr("height", 10)
            .attr('x', x1)
            .attr('y', y1)
            .style('z-index',4)
			
          
            x1 +=10;
            count+=1
            if(count%5==0){
              x1 = x
              y1 += 10
            }
          }
        }
        svg.transition()
          .duration(750)
          // .call(zoom.translate(translate).scale(scale).event); // not in d3 v4
          .call( zoom.transform, d3v4.zoomIdentity.translate(translate[0],translate[1]).scale(scale*0.9) );
        var emojiHighlight = function(label){
          
            
            geotooltip.transition()
                  .style("opacity", 1).style("z-index","1");
            let val = label+":"+emotionPercentage[label]+"%";
            console.log(val)
            geotooltip.html(val)
              .style("font-size", "14px")
              .style("stroke","black")
              .style("left", (d3v4.event.pageX + 50) + "px")
              .style("top", (d3v4.event.pageY - 15) + "px");
          }
        var emojiNoHighlight = function(){geotooltip.transition()
                    .style('opacity', '0').style("z-index","-1");}
          //Happy tooltip
          svg.selectAll("#Happy")
            .on("mouseover", function(){return emojiHighlight("Happy")})
                      .on("mouseout",emojiNoHighlight);
          
          //Sad tooltip
          svg.selectAll("#Sad")
            .on("mouseover", function(){return emojiHighlight("Sad")})
                      .on("mouseout",emojiNoHighlight);
          //Surprise tooltip
          svg.selectAll("#Surprise")
            .on("mouseover", function(){return emojiHighlight("Surprise")})
                      .on("mouseout",emojiNoHighlight);
          //Angry tooltip
          svg.selectAll("#Angry")
          .on("mouseover", function(){return emojiHighlight("Angry")})
                    .on("mouseout",emojiNoHighlight);
          //Fear tooltip
          svg.selectAll("#Fear")
            .on("mouseover", function(){return emojiHighlight("Fear")})
                      .on("mouseout",emojiNoHighlight);  
          
        	setTimeout(function(){
              // var elem=document.getElementById("duplicate");
              // elem.scrollIntoView({block:"center"});
              
              location_line_chart=d.properties.Nbrhood;
              document.getElementById("line_chart").style.visibility = "visible";
              d3.select("#line_chart").style("z-index","10");
              line_chart(start,end,d.properties.Nbrhood)
            },1000);
	
	
    }

    function reset() {
        console.log("RESET")
        svg.selectAll("text").attr("opacity","1")
        svg.selectAll(".feature").attr("opacity",1)
        svg.selectAll(".text-class").attr("opacity",1)
        svg.selectAll("g").attr("opacity","1");
        active.classed("active", false);
        active = d3v4.select(null);
        svg.transition()
            .duration(750)
            .call( zoom.transform, d3v4.zoomIdentity ); // updated for d3 v4
    }

    function zoomed() {
        console.log("ZOOMED")
        svg.style("stroke-width", 1.5 / d3v4.event.transform.k + "px");
        svg.style("z-index","-1");
        svg.attr("transform", d3v4.event.transform); // updated for d3 v4
    }

    // If the drag behavior prevents the default click,
    // also stop propagation so we don’t click-to-zoom.
    function stopped() {
      if (d3v4.event.defaultPrevented) d3v4.event.stopPropagation();
    }

    svg.append("text")
          .attr("text-anchor", "end")
          .classed("headline",true)
          .attr("x", mapMaxWidth/2+2*mapMargin.left)
          .attr("y", mapMargin.top/2.2)
          .text("St. Himark"); 

}

function line_chart(start,end,loc){

	 if(diff_hours(start,end)==0){
        start.setHours( start.getHours() -3 );
      }
      else if(diff_hours(start,end)<=3){
        start.setHours( start.getHours() -(3%diff_hours(start,end)) );
      }
    var lineChartMargin = {top: 20, right: 40, bottom: 20, left: 40};
    lineChartMaxWidth = 600;
    lineChartMaxHeight = 350;
    lineChartWidth = lineChartMaxWidth - lineChartMargin.left - lineChartMargin.right,
    lineChartHeight = lineChartMaxHeight - lineChartMargin.top - lineChartMargin.bottom;

    
    var animationSpeed = +document.getElementById("speedAnimation").value;

    d3.select("#line_chart")
        .classed("line_chart", true);
    // append the svg object to the body of the page
    var svg = d3.select("#line_chart_svg")
        .append("svg")
        .attr("transform", "translate(" + 0 + "," + lineChartMargin.top + ")")
        .attr("width", lineChartMaxWidth)
        .attr("height", lineChartMaxHeight+2*lineChartMargin.top)
        .append("g");
          
    d3.csv('Data/new_YInt_sentiments_counts.csv').then( function(data) {
        data.forEach(function(d) {
          d.new_time=parseDate(d.new_time);
          d.EmotionCount = +d.EmotionCount;
          return d;
        });

        data = data.filter(d => {return (d.new_time > start && d.new_time < end && d.location == loc)})
        console.log(data);
        var x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.new_time; }))
            .range([ 0, lineChartWidth ]);
        var xAxis = svg.append("g")
          .attr("transform", "translate(" + lineChartMargin.left + "," + (lineChartHeight+lineChartMargin.top)+ ")")
          .call(d3.axisBottom(x).ticks(5))

        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", lineChartWidth/2 + lineChartMargin.left)
            .attr("y", lineChartHeight + 3*lineChartMargin.bottom)
            .text("Time");

        // Add Y axis
        var y = d3.scaleLinear()
          .domain([0, d3.max(data, function(d) { return d.EmotionCount; })])
          .range([ lineChartHeight , 0 ]);
        svg.append("g")
          .attr("transform", "translate(" + lineChartMargin.left + ","+(lineChartMargin.top)+")")
          .call(d3.axisLeft(y).ticks(5))

        var checkboxes = document.getElementsByClassName("emotionCheckBox");
        var EmotionList = [];
        for (var i=0; i<checkboxes.length; i++) {
          
            if (checkboxes[i].checked) {
              EmotionList.push(checkboxes[i].value);
            }
        }
        
        //define color scale
        var colorScale = d3.scaleOrdinal().domain(EmotionList)
          .range(d3.schemeCategory10 )

        // define the 1st line
        var valueline = d3.line()
            .x(function(d) { return x(d.new_time)+lineChartMargin.left; })
            .y(function(d) { return y(d.EmotionCount)+1.4*lineChartMargin.top; });

          
        console.log(data.filter(d =>d.Emotion == EmotionList[0]))
        EmotionListData = []
        for (var i=0; i<EmotionList.length; i++) {
          EmotionListData.push(data.filter(d =>d.Emotion === EmotionList[i]))
        }
          // Add the valueline path.
        let ids = 1 
        const lineSvg = svg.selectAll("lines")
            .data(EmotionListData)
            .enter()
            .append("g");
        linePath = lineSvg.append("path")
            .attr("class", function () {
                    return "line-"+ids++;
                  })
            .attr("d", function(d){return valueline(d);})
            .attr("stroke", function(d,i){return colorScale(d[0].Emotion)});
          
        function tweenDash() {
              var l = this.getTotalLength(),
                  i = d3.interpolateString("0," + l, l + "," + l);
              return function (t) { return i(t); };
          }

        linePath.transition()
                  .duration(animationSpeed)
                  .attrTween("stroke-dasharray", tweenDash);
        for(var i in EmotionList){
          drawImagePath(data.filter(d =>d.Emotion == EmotionList[i]),EmotionList[i])
        }

        function drawImagePath(referenceData, emotion){
            var ImageLinePath = svg.append("path")
                .attr("d", valueline(referenceData))
                .style("stroke", "None")
                .style("fill", "none");
              
            
            ImageSvg = svg.append("svg:image")
                .attr("href","./Images/"+emotion+".png")
                .attr("width", 40)
                .attr("height", 40)
                .attr("transform","translate(" +x(d3.min(referenceData, function(d) { return d.new_time; }))+","+ (y(d3.min(referenceData, function(d) { return d.EmotionCount; }))+lineChartMargin.top)+")")
            ImageSvg.transition()
                .duration(animationSpeed)
                .tween("pathTween", function(){return pathTween(ImageLinePath)});
          }
          
          
          
          function pathTween(path){
              var length = path.node().getTotalLength(); // Get the length of the path
              var r = d3.interpolate(0, length); //Set up interpolation from 0 to the path length
              
              return function(t){
                var point = path.node().getPointAtLength(r(t)); // Get the next point along the path
                d3.select(this) // Select the circle
                  .attr("transform","translate(" +(point.x-10)+","+(point.y-10)+")") // Set the cx
                  
              }
          }
            
          const legend = svg.selectAll('.drawImagePathLegend')
                    .data(colorScale.domain())
                    .enter()
                    .append('g')
                    .attr('class','drawImagePathLegend')
                    .attr('transform',(d,i) => `translate(${(lineChartWidth/2.5)+80*i},${lineChartMargin.top/2})`);
                    
          legend.append('circle')
              .attr('r',5)
              .style('fill',colorScale);
              
          legend.append('text')
              .attr('x',8)
              .attr('y',5)
              .style('fontSize',"10")
              .text(d=>d)
    });
        
    // svg.append("text")
    //     .attr("text-anchor", "end")
    //     .classed("headline",true)
    //     .attr("x", lineChartMaxWidth/2+2*lineChartMargin.left)
    //     .attr("y", lineChartMargin.top/2.2)
    //     .text("Sentiment Timeline"); 
}

function bar_chart(start,end){

      var lineChartMargin = {top: 0, right: 40, bottom: 20, left: 40};
      lineChartMaxWidth = 700;
      lineChartMaxHeight = 450;
      lineChartWidth = lineChartMaxWidth - lineChartMargin.left - lineChartMargin.right,
      lineChartHeight = lineChartMaxHeight - lineChartMargin.top - lineChartMargin.bottom;

      // append the svg object to the body of the page
      
      if(diff_hours(start,end)==0){
        start.setHours( start.getHours() -3 );
      }
      else if(diff_hours(start,end)<=3){
        start.setHours( start.getHours() -(3%diff_hours(start,end)) );
      }  

      var lineCharttooltip = d3v4.select("body").append("div")
          .style("position", "absolute")
          .style("background-color", "white")
          .style("border", "solid")
          .style("border-width", "1px")
          .style("border-radius", "5px")
          .style("padding", "3px")
          .style("opacity", "0");

      var highlight = function(d){
          //console.log("hovered")
          d3v4.select(this).style("opacity", 0.8);
          lineCharttooltip.transition()
                  .style("opacity", 1).style("z-index","1");
          let val = "Account: "+d.account +"<br>Message Count: "+d.NoofMessages;
          lineCharttooltip.html(val)
              .style("font-size", "14px")
              .style('stroke','black')
              .style("left", (d3v4.event.pageX + 50) + "px")
              .style("top", (d3v4.event.pageY - 15) + "px");
      }

      // And when it is not hovered anymore
      var noHighlight = function(d){
          //console.log("no-hovered")
          d3v4.select(this).style('stroke','#444').style('stroke-width','0').style("opacity", 1);
          lineCharttooltip.transition()
                .style('opacity', '0').style("z-index","-1");
      }

      d3v4.csv("data/new_YInt_imp_accounts_counts.csv", function(error, csv_data) {   
          d3v4.select("#bar_chart").selectAll("svg").remove();
          
          var svg = d3v4.select("#bar_chart")
            .classed("line_chart", true)
            .append("svg")
            .attr("transform", "translate(" + lineChartMargin.left + "," + lineChartMargin.top + ")")
            .attr("width", lineChartMaxWidth)
            .attr("height", (lineChartHeight)+4*lineChartMargin.bottom)
            .append("g");
          
          var selectedGroup = document.getElementById("selectButton").value
          // console.log(csv_data)
          csv_data = csv_data.filter(d => parseDate(d.new_time) > start && parseDate(d.new_time) < end && d.AccountType == selectedGroup)
          
          var data = d3v4.nest()
                  .key(function(d) { return d.account;})
                  .rollup(function(d) { 
                      return {"AccountType": d.AccountType, "NoofMessages": d3v4.sum(d, function(g) {return g.NoofMessages; })} })        
                  .entries(csv_data);
          // console.log(csv_data)
        
          data.forEach(function(d) {
              d.account = d.key;        
              d.AccountType = d.value["AccountType"];
              d.NoofMessages = d.value["NoofMessages"];  
          });
          
          data = GetTopTwenty(data);
          
          
          // X axis
          var x = d3v4.scaleBand()
              .range([ lineChartMargin.left, lineChartWidth ])
              .domain(data.map(function(d) { return d.account; }))
              .padding(0.2);
          svg.append("g")
              .attr("transform", "translate(0," + (lineChartHeight-2*lineChartMargin.bottom) + ")")
              .call(d3v4.axisBottom(x))
              .selectAll("text")
              .attr("transform", "translate(-10,0)rotate(-45)")
              .style("text-anchor", "end");
          
          // Add Y axis
          maxMessageCount = d3.max(data, function(d) { return d.NoofMessages; })
          var y = d3v4.scaleLinear()
              .domain([0, maxMessageCount+(maxMessageCount/4)])
              .range([ lineChartHeight, 0]);
          svg.append("g")
              .attr("transform", "translate("+lineChartMargin.left+"," + (-2*lineChartMargin.bottom) + ")")
              .call(d3v4.axisLeft(y));
          
          // Bars
          svg.selectAll("mybar")
              .data(data)
              .enter()
              .append("rect")
                .attr("x", function(d) { return x(d.account); })
                .attr("y", function(d) { return y(d.NoofMessages)-2*lineChartMargin.bottom; })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return lineChartHeight - y(d.NoofMessages); })
                .attr("fill", "#69b3a2")
                .on("mouseover", highlight)
                .on("mouseleave", noHighlight)
          
          //})
          function GetTopTwenty(arrayData){  //sorting to top 3 function
            arrayData.sort(function(a, b) {
                            return parseFloat(b.value["NoofMessages"]) - parseFloat(a.value["NoofMessages"]);
                          });
            return arrayData.slice(0, 20); 
          }



      });  
}