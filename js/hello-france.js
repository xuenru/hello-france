const w = 600; // width
const h = 600; // height
const p = 50; // padding
let dataset = [];

//Create SVG element
let svg = d3.select("body")
    .append("svg")
    .attr('class', 'map')
    .attr('width', w)
    .attr('height', h);


d3.tsv('data/france.tsv', (d, i) => {
    return {
        codePostal: +d["Postal Code"],
        inseeCode: +d.inseecode,
        place: d.place,
        longitude: +d.x,
        latitude: +d.y,
        population: +d.population,
        density: +d.density
    }
}).then((rows) => {
    // console.log(error, rows)
    console.log("loaded " + rows.length + " rows")
    if (rows.length > 0) {
        console.log("First Row: ", rows[0])
        console.log("Last Row: ", rows[rows.length - 1])
    }
    dataset = rows;
    draw();
    // drawBar();
});


function draw() {
    // scale x
    let x = d3.scaleLinear()
        .domain(d3.extent(dataset, (row) => row.longitude))
        .range([p, w - p]);

    // scale y
    let y = d3.scaleLinear()
        .domain(d3.extent(dataset, (row) => row.latitude))
        .range([h - p, p])

    //scale population
    let scale_pop = d3.scaleLinear()
        .domain(d3.extent(dataset, (row) => row.population))
        .range([0, 100]);

    let scale_color = d3.interpolate('gray', 'red');

    // plot the points
    svg.selectAll('rect')
        .data(dataset)
        .enter()
        .append('rect')
        .attr('width', 1)
        .attr('height', 1)
        .attr('x', (d) => Number.isNaN(d.longitude) ? null : x(d.longitude))
        .attr('y', (d) => Number.isNaN(d.latitude) ? null : y(d.latitude))
        .attr('fill', (d) => scale_color(scale_pop(d.population)))
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
    ;

    // x axis
    let axisX = d3.axisBottom(x);
    let gX = svg.append("g")
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${h - p})`)
        .call(axisX);

    // y axis
    let axisY = d3.axisLeft(y);
    let gY = svg.append("g")
        .attr('class', 'y-axis')
        .attr('transform', `translate(${p}, 0)`)
        .call(axisY);

    // x axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", w - p)
        .attr("y", h - 10)
        .text("longitude");

    // y axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("x", -p)
        .attr("y", p - 40)
        .text("latitude")

    // zoom
    function zoomed() {
        svg.selectAll('rect')
            .attr("transform", d3.event.transform);
        gX.call(axisX.scale(d3.event.transform.rescaleX(x)));
        gY.call(axisY.scale(d3.event.transform.rescaleY(y)));
    }

    let zoom = d3.zoom()
        .on("zoom", zoomed);
    let callZoom = svg.call(zoom);

    d3.select("#reset-zoom")
        .on('click', function () {
            callZoom.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        });
}

// create a tooltip
let tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")

function handleMouseOver(d) {
    tooltip.transition()
        .duration(200)
        .style("opacity", 0.9)
        .style("left", `${d3.event.pageX}px`)
        .style("top", `${d3.event.pageY - 50}px`);
    tooltip.html(`${d.place}, ${d.codePostal}<br>
                    density: ${d.density}<br>
                    population: ${d.population}`);
}

function handleMouseOut() {
    tooltip.transition()
        .duration(200)
        .style("opacity", 0);
}


function drawBar() {
    //Create SVG element
    let svg_chart = d3.select("body")
        .append("svg")
        .attr('class', 'chart')
        .attr('width', w)
        .attr('height', h);

    // Create bars
    let bar = svg_chart.selectAll("g")
        .data(dataset)
        .enter()
        .append("g")
        .attr("transform", function (d, i) {
            return "translate(10,10)";
        });

// Create rectangles of the correct width
    bar.append("rect")
        .attr("fill", 'blue')
        .attr("class", "bar")
        .attr("width", (d) => d.population)
        .attr("height", 10);

// Add text label in bar
    bar.append("text")
        .attr("x", function (d) {
            return 0;
        })
        .attr("y", 0)
        .attr("fill", "red")
        .attr("dy", ".35em")
        .text(function (d) {
            return d.population;
        });

// Draw labels
    bar.append("text")
        .attr("class", "label")
        .attr("x", function (d) {
            return -10;
        })
        .attr("y", 0)
        .attr("dy", ".35em")
        .text(function (d, i) {
            return d.place
        });

}

