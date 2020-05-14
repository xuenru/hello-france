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
        .range([1, 30]);

    //scale density
    let scale_des = d3.scaleLinear()
        .domain(d3.extent(dataset, (row) => row.density))
        .range([0, 20]);

    let scale_color = d3.interpolate("lightblue", "red");

    // plot the points
    svg.selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('cx', (d) => Number.isNaN(d.longitude) ? null : x(d.longitude))
        .attr('cy', (d) => Number.isNaN(d.latitude) ? null : y(d.latitude))
        .attr("r", (d) => scale_pop(d.population))
        .attr('fill', (d) => scale_color(scale_des(d.population)))
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
        svg.selectAll('circle')
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

