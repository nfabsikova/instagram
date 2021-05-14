
// Dimensions of chart.
let margin = { top: 20, right: 10, bottom: 40, left: 56 }
let width = 800 - margin.left - margin.right
let height = 700 - margin.top - margin.bottom; 

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
  .tickPadding(5);

let xAxisEl = chart.append("g")
  .attr("class", "x axis bottom")
  .attr("transform", "translate (0, " + (height - margin.bottom) + ")")
  .call(xAxis);

  // y-axis
  let yAxis = d3.axisLeft(y)
  .tickSize(8)
  .tickPadding(5);

let yAxisEl = chart.append("g")
  .attr("class", "y axis left")
  // .attr("transform", "translate (0, " + (height - margin.bottom) + ")")
  .call(yAxis)


// Load data.
const posts = d3.csv("data.csv", ({id, month, year, season}) => 
  ({id: id, month: +month, year: +year, season: season}));

posts.then(function (data) {
  console.log(data);

  // Create node data.
  let nodes = data.map(function(d,i) {		
    return {
        id: "node"+i,
        x: x(d.month) + Math.random(),
        y: y(d.year) - 50 +  Math.random() * 100,
        r: 5,
        month: d.month,
        year: d.year,
        color: "#F24088",
        data: d
    }
  });

  console.log(nodes);

  // Circle for each node.
	let circle = chart.append("g")
  .selectAll("circle")
   .data(nodes)
   .join("circle")
   .attr("id", d => "circle"+d.id)
   .attr("cx", d => d.x)
   .attr("cy", d => d.y)
  //  .attr("r", d => d.r)
   .attr("fill", d => d.color)

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
    .style("pointer-events", "none")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

   	// Forces
	simulation = d3.forceSimulation(nodes)
  .force("x", d3.forceX(d => x(d.month)))
  .force("y", d3.forceY(d => y(d.year)))
  .force("collision", d3.forceCollide().radius(d => d.r + 1.5))
    .alpha(.05)
    .alphaDecay(0)
  .on("tick", onSimulationTick);

  const simulationDurationInMs = 5000; // 20 seconds

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

            d3.select(this).attr("fill", "#F5C549").attr("r", 7);
            tooltip.style("visibility", "visible");
            tooltip.style("top", (Number(d3.select(this).attr("cy")) + 50) + "px");
            tooltip.style("left", (Number(d3.select(this).attr("cx")) + 50) + "px");

            let id = String(d.data.id);
            console.log(id);
            console.log(id.length);
            let comparison = "1693826311004235126";

            for (let i = 0; i < id.length; i++) {
              console.log(id[i] === comparison[i]);
              if (id[i] !== comparison[i]) {
                console.log(id.charCodeAt(i));
                console.log(comparison.charCodeAt(i));
              }
            }

            console.log("1693826311004235126".length === id.length);
            console.log(id === "1693826311004235126");
            tooltip.html("<img src=\"./natural_images/" + id + ".jpeg\">");
          

          }).on("mouseout", function(event, d) {
            d3.select(this).attr("fill", "#F24088").attr("r", 5);
            tooltip.style("visibility", "hidden");
          })
      }
  }





});