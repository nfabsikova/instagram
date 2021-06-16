
// Dimensions of chart.
let margin = { top: 30, right: 10, bottom: 30, left: 56 }
let width = 800 - margin.left - margin.right
let height = 700 - margin.top - margin.bottom; 
let tickLabels = ['Jan','Feb','Mar','Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let chart = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Scales
let x = d3.scaleLinear()
	.domain([1, 12])
	.range([margin.left, width - margin.right - margin.left]);

let y = d3.scaleLinear()
  .domain([2018, 2020])
  .range([100, 500]);

// x-axis
let xAxis = d3.axisBottom(x)
  .tickSize(8)
  .tickPadding(5)
  .tickFormat(function(d,i){ return tickLabels[i] });

let xAxisEl = chart.append("g")
  .attr("class", "x axis bottom")
  .attr("transform", "translate (0, " + (height - margin.bottom) + ")")
  .call(xAxis);

  // y-axis
  let yAxis = d3.axisLeft(y)
  .tickSize(8)
  .tickPadding(5)
  .ticks(2)
  .tickFormat(d3.format("d"));

let yAxisEl = chart.append("g")
  .attr("class", "y axis left")
  // .attr("transform", "translate (0, " + (height - margin.bottom) + ")")
  .call(yAxis)

// Load data.
const posts = d3.csv("data.csv", ({id, timestamp, month, year, likes, comments, post_url}) => 
  ({id: id, timestamp: timestamp, month: +month, year: +year, likes: +likes, comments: +comments, url: post_url}));

posts.then(function (data) {
  console.log(data);

  //get images dimensions data
  let dims = d3.csv("dims.csv");

  dims.then(function(dims) {

        //vertical lines
        let vlines = chart.append("g")
        .attr("class", "vlines")
        .selectAll("line")
        .data([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        .join("line")
          .attr("x1", d => x(d) + 0.5)
          .attr("x2", d => x(d) + 0.5)
          .attr("y1", 0)
          .attr("y2", height - margin.bottom)
    
        //horizontal lines
        let hlines = chart.append("g")
        .attr("class", "hlines")
        .selectAll("line")
        .data([2018, 2019, 2020])
        .join("line")
          .attr("x1", 0)
          .attr("x2", x(12.5))
          .attr("y1", d => y(d))
          .attr("y2", d => y(d))
    
    
      // Create node data.
      let nodes = data.map(function(d,i) {		
        return {
            id: "node"+i,
            x: x(d.month) + Math.random(),
            y: y(d.year)  - 50 +  Math.random() * 100,
            r: 5,
            month: d.month,
            year: d.year,
            data: d
        }
      });
    
      // Circle for each node.
      let circle = chart.append("g")
      .attr("class", "circles")
      .selectAll("circle")
       .data(nodes)
       .join("circle")
       .attr("id", d => "circle"+d.id)
       .attr("cx", d => d.x)
       .attr("cy", d => d.y)
       .style("fill", "var(--main)")
    
        // Ease in the circles.
        circle.transition()
          .delay(100)
          .duration(800)
          .attrTween("r", d => {
                const i = d3.interpolate(0, d.r);
                return t => d.r = i(t);
          });
    
    
       //Tooltips
       let tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "tooltip")
    
         // Forces
      simulation = d3.forceSimulation(nodes)
      .force("x", d3.forceX(d => x(d.month)))
      .force("y", d3.forceY(d => y(d.year)))
      .force("collision", d3.forceCollide().radius(d => d.r + 1.5))
        .alpha(.05)
        .alphaDecay(0)
      .on("tick", onSimulationTick);
    
      const simulationDurationInMs = 4000; 
    
      let startTime = Date.now();
      let endTime = startTime + simulationDurationInMs;
    
      function onSimulationTick() {
          if (Date.now() < endTime) {
            circle
            .attr("cx", d => d.x)
              .attr("cy", d => d.y)
              .attr("fill", d => d.color);
          } else {
              simulation.stop();
    
              //Interaction
              d3.selectAll("circle").on("mouseover", function(event, d) {

                d3.select(this).style("cursor", "pointer"); 
    
                d3.select(this).style("fill", "var(--hover)").attr("r", 7);
                tooltip.style("visibility", "visible");
    
                if (Number(d3.select(this).attr("cy")) < height/2) {
                  tooltip.classed("top", true)
                  tooltip.style("left", (Number(d3.select(this).attr("cx")) + 64) + "px");
                  tooltip.style("top", (Number(d3.select(this).attr("cy")) + 60) + "px");
                } else {
                  tooltip.classed("top", false)
                  tooltip.style("left", (Number(d3.select(this).attr("cx")) + 64) + "px");
                  tooltip.style("top", (Number(d3.select(this).attr("cy")) -264) + "px");
                }
    
    
    
                let id = String(d.data.id);
                let imgRatio = dims.find(x => x.id == (id + ".jpg")).height / dims.find(x => x.id == (id + ".jpg")).width;
                let imgHeight = 250;
                let imgWidth = imgHeight * imgRatio;

                tooltip.style("width", imgWidth + "px");
                tooltip.html("<img src=\"./beeswarm_medicka_pictures/" + id + ".jpg\" height=" + imgHeight + "width=" + imgWidth + ">");

                let likes = String(d.data.likes);
                let comments = String(d.data.comments);

                let meta = tooltip.append("div")
                meta.append("span").style("font-weight", "bold").text("likes: ");
                meta.append("span").text(likes);
                meta.append("span").style("font-weight", "bold").style("margin-left","1em").text("comments: ");
                meta.append("span").text(comments);
              
    
              }).on("mouseout", function(event, d) {
                d3.select(this).style("fill", "var(--main)").attr("r", 5);
                tooltip.style("visibility", "hidden");

              }).on("click", function(event, d) {
                let url = d.data.url;
                console.log(url);
                window.open(url, '_blank');
              })
          }
      }


  })


});