
// Dimensions of chart.
let margin = { top: 30, right: 10, bottom: 30, left: 56 }
let width = 800 - margin.left - margin.right
let height = 700 - margin.top - margin.bottom; 
let tickLabels = ['Jan','Feb','Mar','Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let beeswarm = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // .append("div")
  // // Container class to make it responsive.
  // .classed("svg-container", true) 
  // .append("svg")
  // // Responsive SVG needs these 2 attributes and no width and height attr.
  // .attr("preserveAspectRatio", "xMinYMin meet")
  // .attr("viewBox", "0 0 800 700")
  // // Class to make it responsive.
  // .classed("svg-content-responsive", true)


    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)

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

let xAxisEl = beeswarm.append("g")
  .attr("class", "beeswarm x axis bottom")
  .attr("transform", "translate (0, " + (height - margin.bottom) + ")")
  .call(xAxis);

  // y-axis
  let yAxis = d3.axisLeft(y)
  .tickSize(8)
  .tickPadding(5)
  .ticks(2)
  .tickFormat(d3.format("d"));

let yAxisEl = beeswarm.append("g")
  .attr("class", "beeswarm y axis left")
  // .attr("transform", "translate (0, " + (height - margin.bottom) + ")")
  .call(yAxis)

// Load data.
const posts = d3.csv("./data/data.csv", ({id, timestamp, month, year, likes, comments, post_url, height, width}) => 
  ({id: id, timestamp: timestamp, month: +month, year: +year, likes: +likes, comments: +comments, url: post_url, height: +height, width: + width}));

posts.then(function (data) {
  console.log(data);

        //vertical lines
        let vlines = beeswarm.append("g")
        .attr("class", "beeswarm vlines")
        .selectAll("line")
        .data([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        .join("line")
          .attr("x1", d => x(d) + 0.5)
          .attr("x2", d => x(d) + 0.5)
          .attr("y1", 0)
          .attr("y2", height - margin.bottom)
    
        //horizontal lines
        let hlines = beeswarm.append("g")
        .attr("class", "beeswarm hlines")
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
      let circle = beeswarm.append("g")
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
        .attr("class", "beeswarm tooltip")
    
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

              let clicked = false;
              //Interaction
              beeswarm.selectAll("circle").on("mouseover", function(event, d) {

                    
                let id = String(d.data.id);
                let imgRatio = d.data.height / d.data.width
                let imgHeight = 250;
                let imgWidth = imgHeight * imgRatio;

                d3.select(this).style("cursor", "pointer"); 
                d3.select(this).style("fill", "var(--hover)").attr("r", 7);
                tooltip.style("visibility", "visible");
    
                if (Number(d3.select(this).attr("cy")) < height/2) {
                  tooltip.classed("top", true)
                  tooltip.style("left", (event.pageX) + "px");
                  tooltip.style("top", (event.pageY + 10) + "px");
                } else {
                  tooltip.classed("top", false)
                  tooltip.style("left", (event.pageX) + "px");
                  tooltip.style("top", (event.pageY - imgHeight - 10) + "px");
                }


                tooltip.style("width", imgWidth + "px");
                tooltip.html("<img src=\"./data/pictures/" + id + ".jpg\" height=" + imgHeight + "width=" + imgWidth + ">");

                d3.select(this).on("click", function(event, d) {

                  let likes = String(d.data.likes);
                  let comments = String(d.data.comments);
                  let meta = tooltip.append("div")
                  let url = d.data.url;

                  //meta.append("span").style("font-weight", "bold").style("margin-left","0.25em").text("likes: ");
                  meta.append("span").style("margin-left","0.25em").html("<img src=\"./style/insta_icons_like.svg\" height = 12px>")
                  meta.append("span").text(" " + likes + " ");
                  //meta.append("span").style("font-weight", "bold").style("margin-left","1em").text("comments: ");
                  meta.append("span").style("margin-left","0.25em").html("<img src=\"./style/insta_icons_comment.svg\" height = 12px>")
                  meta.append("span").text(" " + comments + " ");
                  meta.append("span").style("margin-left","0.25em").html("<a href=" + url + " target=_blank class=tooltip>original</a>");


                  tooltip.style("height", "280px");

                  d3.select(this).style("fill", "var(--hover)").attr("r", 7);


                  d3.select("body").on("click", function(event, d) {

                    if (clicked) {
                      d3.selectAll("circle").style("pointer-events", "all");
                      tooltip.style("height", "200px").style("visibility", "hidden");
                      tooltip.select("div").remove();
                      d3.selectAll("circle").style("fill", "var(--main)").attr("r", 5);

                      clicked = false;
                    } else {

                      d3.selectAll("circle").style("pointer-events", "none");
                      clicked = true;
                    }

                  })
                })
              
    
              }).on("mouseout", function(event, d) {
                if(!clicked) {
                  d3.select(this).style("fill", "var(--main)").attr("r", 5);
                  tooltip.style("height", "200px").style("visibility", "hidden");
                }

              })
          }
      }


});